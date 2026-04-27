import Lottie from "lottie-react";
import {
  ArrowLeft,
  Building2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Shield,
  User,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import ticketFlow from "../../assets/ticketFlow.json";
import {
  loginStart,
  loginSuccess,
  stopLoading,
} from "../../store/slices/authSlice";
import { encryptPassword } from "../../utils/PasswordEnc";
import ForgotPassword from "./ForgotPassword";
import efitLogo from "../../assets/EfitLogo.png";
import fasticket from '../../assets/fasticket.png';

const AuthForm = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationStep, setVerificationStep] = useState("form"); // 'form', 'verify', 'success'
  const [verificationCode, setVerificationCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    type: "Transporter",
    industry: "",
    branch: "",
    branchCode: "",
  });

  // Load remembered credentials on component mount
  useEffect(() => {
    const storedCredentials = localStorage.getItem('rememberedCredentials');
    if (storedCredentials) {
      const { email, password } = JSON.parse(storedCredentials);
      setFormData(prev => ({
        ...prev,
        email: email,
        password: password
      }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (errorMessage) setErrorMessage("");
  };

  // Function to fetch screen permissions
  const getScreenAccess = async (orgId, role) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/auth/getRolesPermissionHeaderByRoleandOrgid?orgid=${orgId}&role=${role}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const userList = response?.data?.paramObjectsMap?.userVO;
      console.log('User List:', userList);

      if (Array.isArray(userList) && userList.length > 0) {
        const rolePermissions = userList[0]?.rolesPermissionVO || [];

        // Format and store in localStorage
        const screenAccessMap = {};
        rolePermissions.forEach(screen => {
          screenAccessMap[screen.screenId] = {
            screenName: screen.screenName,
            canRead: screen.canRead,
            canWrite: screen.canWrite,
            canDelete: screen.canDelete
          };
        });

        localStorage.setItem('screenAccess', JSON.stringify(screenAccessMap));
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  // Login API Call
  const loginAPICall = async (values) => {
    const userData = {
      password: encryptPassword(values.password),
      userName: values.email
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/user/login`,
        userData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status) {
        const userVO = response.data.paramObjectsMap.userVO;

        // Store user data in Redux
        dispatch(
          loginSuccess({
            name: userVO.userName || "",
            email: values.email,
            organizationName: userVO.organizationName || "",
            userId: userVO.userId || "",
            token: userVO.token,
            type: userVO.type,
            orgId: userVO.orgId,
          })
        );

        // Store in localStorage
        localStorage.setItem('orgId', userVO.orgId);
        localStorage.setItem('userId', userVO.userId);
        localStorage.setItem('token', userVO.token);
        localStorage.setItem('tokenId', userVO.tokenId);
        localStorage.setItem('userName', userVO.userName);
        localStorage.setItem('userType', userVO.type);
        localStorage.setItem('finYear', userVO.finYear);
        localStorage.setItem('LoginMessage', true);
        

        // // Handle user type and role
        // const userType = response.data?.paramObjectsMap?.userVO?.userType;
        // const role = response.data?.paramObjectsMap?.userVO?.roleVO?.[0]?.role;

        // if (userType || role) {
        //   localStorage.setItem('userType', userType === 'SADMIN' || userType === 'ADMIN' ? userType : role);
        // }

        const userRole = userVO.roleVO || [];
        localStorage.setItem('ROLE', JSON.stringify(userRole));

        // Get screen permissions
        const roles = userRole.map((row) => ({ role: row.role }));
        localStorage.setItem('ROLES', JSON.stringify(roles));

        if (roles[0]?.role) {
          await getScreenAccess(userVO.orgId, roles[0]?.role);
        }

        // Collect all screens
        let allScreensVO = [];

        (userVO.roleVO || []).forEach((roleObj) => {
          (roleObj.responsibilityVO || []).forEach((responsibility) => {
            if (responsibility.screensVO) {
              allScreensVO = allScreensVO.concat(responsibility.screensVO);
            }
          });
        });

        // remove duplicates
        allScreensVO = [...new Set(allScreensVO)];
        localStorage.setItem('screens', JSON.stringify(allScreensVO));

        // Fetch company name
        try {
          const companyResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/commonmaster/company/${userVO.orgId}`,
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );

          if (companyResponse.data.status === true) {
            const particularCompany = companyResponse.data.paramObjectsMap.companyVO[0];
            localStorage.setItem('companyName', particularCompany.companyName);
          }
        } catch (error) {
          console.error('Error fetching company name:', error);
        }

        // Handle remember me
        if (rememberMe) {
          localStorage.setItem('rememberedCredentials', JSON.stringify({ email: values.email, password: values.password }));
        } else {
          localStorage.removeItem('rememberedCredentials');
        }

        // Show success message
        toast.success('Login successful!', {
          autoClose: 2000,
          theme: 'colored'
        });

        // Navigate to dashboard
        setTimeout(() => {
          const role = userVO.type?.toLowerCase();

          if (role === 'customer') {
            navigate('/menu/ticket');
          } else {
            navigate('/dashboard');
          }

          window.location.reload();
        }, 100);

      } else {
        toast.error(response.data.paramObjectsMap.errorMessage || 'Login failed', {
          autoClose: 2000,
          theme: 'colored'
        });
        setErrorMessage(response.data.paramObjectsMap.errorMessage || 'Login failed');
        dispatch(stopLoading());
      }
    } catch (error) {
      console.error('Login API error:', error);
      toast.error('Network Error - Please try again', {
        autoClose: 2000,
        theme: 'colored'
      });
      setErrorMessage('Network Error - Please check your connection');
      dispatch(stopLoading());
    }
  };

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    dispatch(loginStart());

    // Basic validation
    if (!formData.email || !formData.password) {
      setErrorMessage("Please enter both email and password");
      dispatch(stopLoading());
      return;
    }

    await loginAPICall({
      email: formData.email,
      password: formData.password
    });
  };

  // Handle Signup - Only show OTP verification
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    dispatch(loginStart());

    try {
      const payload = {
        active: true,
        branch: formData.branch || "",
        branchCode: formData.branchCode || "",
        createdby: formData.name,
        email: formData.email,
        id: 0,
        mobileNo: formData.phone,
        orgId: 0,
        organizationName: formData.industry,
        password: encryptPassword(formData.password),
        status: "APPROVED",
        type: formData.type,
        userName: formData.email,
      };

      console.log("Sending signup payload:", payload);

      // Call signup API - this should trigger email OTP
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/user/signup`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Signup API success:", response);

      // IMPORTANT: Use stopLoading instead of loginSuccess to avoid auto-login
      dispatch(stopLoading());

      // Move to verification step
      setVerificationStep("verify");

      toast.success('OTP sent to your email!', {
        autoClose: 2000,
        theme: 'colored'
      });
    } catch (error) {
      console.error("Signup API error:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Signup failed. Please try again.";
      setErrorMessage(errorMsg);
      toast.error(errorMsg, {
        autoClose: 2000,
        theme: 'colored'
      });
      dispatch(stopLoading());
    }
  };

  // Handle OTP Verification - Only verify, DO NOT login
  const handleVerificationSubmit = async (e) => {
    e.preventDefault();

    if (!verificationCode || verificationCode.length !== 6) {
      setErrorMessage("Please enter a valid 6-digit OTP");
      return;
    }

    setErrorMessage("");
    dispatch(loginStart());

    try {
      const verifyPayload = {
        email: formData.email,
        otp: verificationCode,
      };

      console.log("Verifying OTP with payload:", verifyPayload);

      const verifyResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/verify-otp`,
        verifyPayload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("OTP verification success:", verifyResponse);

      // ----------------- CORRECT SUCCESS CHECK -----------------
      const isVerified =
        verifyResponse?.data?.statusFlag === "Ok" &&
        verifyResponse?.data?.paramObjectsMap?.verified === true;

      if (isVerified) {
        dispatch(stopLoading());
        setVerificationStep("success");

        toast.success('Email verified successfully!', {
          autoClose: 2000,
          theme: 'colored'
        });

        // Switch to login after delay
        setTimeout(() => {
          setVerificationStep("form");
          setVerificationCode("");
          setIsSignup(false);

          setFormData((prev) => ({
            name: "",
            email: prev.email,
            phone: "",
            password: "",
            type: "Transporter",
            industry: "",
            branch: "",
            branchCode: "",
          }));

          setErrorMessage("");

          toast.info('Please login with your credentials', {
            autoClose: 2000,
            theme: 'colored'
          });
        }, 2000);
      } else {
        throw new Error(
          verifyResponse?.data?.paramObjectsMap?.message || "OTP verification failed",
        );
      }
    } catch (error) {
      console.error("OTP verification error:", error);

      const errorMsg =
        error?.response?.data?.paramObjectsMap?.message ||
        error?.message ||
        "Invalid OTP. Please try again.";

      setErrorMessage(errorMsg);
      toast.error(errorMsg, {
        autoClose: 2000,
        theme: 'colored'
      });
      dispatch(stopLoading());
    }
  };

  const resendVerificationCode = async () => {
    try {
      setErrorMessage("");
      dispatch(loginStart());

      const resendPayload = {
        email: formData.email,
      };

      console.log("Resending OTP to:", formData.email);

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/resend-otp`,
        resendPayload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success('New OTP sent to your email!', {
        autoClose: 2000,
        theme: 'colored'
      });
      dispatch(stopLoading());
    } catch (error) {
      console.error("Resend OTP error:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to resend OTP. Please try again.";
      setErrorMessage(errorMsg);
      toast.error(errorMsg, {
        autoClose: 2000,
        theme: 'colored'
      });
      dispatch(stopLoading());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isSignup) {
      if (verificationStep === "form") {
        handleSignupSubmit(e);
      } else if (verificationStep === "verify") {
        handleVerificationSubmit(e);
      }
    } else {
      handleLoginSubmit(e);
    }
  };

  const goBackToForm = () => {
    setVerificationStep("form");
    setVerificationCode("");
    setErrorMessage("");
  };

  // Reset form when switching between login/signup
  const handleAuthToggle = (isSignupMode) => {
    setIsSignup(isSignupMode);
    setVerificationStep("form");
    setVerificationCode("");
    setErrorMessage("");

    if (!isSignupMode) {
      // When switching to login, keep email but clear other fields
      setFormData((prev) => ({
        name: "",
        email: prev.email, // Keep email for convenience
        phone: "",
        password: "",
        type: "Transporter",
        industry: "",
        branch: "",
        branchCode: "",
      }));
    } else {
      // When switching to signup, clear everything
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        type: "Transporter",
        industry: "",
        branch: "",
        branchCode: "",
      });
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleBackFromForgotPassword = () => {
    setShowForgotPassword(false);
  };

  // Add this at the beginning of your AuthForm component
  if (showForgotPassword) {
    return <ForgotPassword onBackToLogin={handleBackFromForgotPassword} />;
  }

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen flex">
        {/* Left: Form Section */}
        <div className="flex-1 flex flex-col justify-center py-12 px-6 lg:px-20 bg-white dark:bg-gray-900">
          <div className="mx-auto w-full max-w-md">
            {/* Back button for verification steps */}
            {(verificationStep === "verify" ||
              verificationStep === "success") && (
                <button
                  onClick={goBackToForm}
                  className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-6 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to form
                </button>
              )}

            {/* Logo */}
<div className="text-center mb-8 flex flex-col items-center">
<div className="flex items-center justify-center gap-3 mb-6 select-none">

  {/* Logo */}
  <div className="w-20 h-12 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
    <img
      src={efitLogo}
      alt="Efit Logo"
      className="w-14 h-14 object-contain"
    />
  </div>

  {/* Minimal Brand */}
  <h1 className="text-xl md:text-2xl font-medium tracking-tight text-gray-900 dark:text-gray-100">
    <span className="text-lg uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
    Ticketing Portal
  </span>
  </h1>

</div>

  {/* Dynamic Headings */}
  <div className="space-y-1 max-w-xs">
    {verificationStep === "verify" ? (
      <>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Verify Your Email
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter the 6-digit OTP sent to{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {formData?.email}
          </span>
        </p>
      </>
    ) : verificationStep === "success" ? (
      <>
        <h2 className="text-lg font-semibold text-green-600">
          Account Created Successfully!
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Redirecting to login...
        </p>
      </>
    ) : (
      <>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          {isSignup ? "Create an Account" : "Welcome Back"}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isSignup
            ? "Get started with your logistics journey"
            : "Sign in to your account"}
        </p>
      </>
    )}
  </div>
</div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {errorMessage}
              </div>
            )}

            {/* Auth Toggle - Only show when not in verification steps */}
            {verificationStep === "form" && (
              <div className="flex justify-center mb-6">
                <div>
                  <button
                    type="button"
                    onClick={() => handleAuthToggle(false)}
                    className={`px-5 py-2 text-sm font-medium rounded-md transition-all ${!isSignup
                      ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                      : "text-gray-500 dark:text-gray-400"
                      }`}
                  >
                    Login
                  </button>
                  {/* <button
                    type="button"
                    onClick={() => handleAuthToggle(true)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${isSignup
                      ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                      : "text-gray-500 dark:text-gray-400"
                      }`}
                  >
                    Sign Up
                  </button> */}
                </div>
              </div>
            )}

            {/* Form Content based on verification step */}
            {verificationStep === "verify" ? (
              // Verification Code Form
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    We sent a verification OTP to your email address
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={verificationCode}
                      onChange={(e) => {
                        setVerificationCode(
                          e.target.value.replace(/\D/g, "").slice(0, 6),
                        );
                        if (errorMessage) setErrorMessage("");
                      }}
                      required
                      maxLength={6}
                      className="w-full text-center text-2xl font-mono tracking-widest px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={resendVerificationCode}
                    disabled={loading}
                    className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Didn't receive OTP? Resend"}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={verificationCode.length !== 6 || loading}
                  className="w-full flex justify-center items-center py-4 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </form>
            ) : verificationStep === "success" ? (
              // Success State
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Verification Successful!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your account has been created. Please login.
                  </p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full animate-pulse"></div>
                </div>
              </div>
            ) : (
              // Main Auth Form
              <form className="space-y-5" onSubmit={handleSubmit}>
                {isSignup && (
                  <>
                    {/* Name */}
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-3 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                      />
                    </div>

                    {/* Phone */}
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-3 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                      />
                    </div>
                  </>
                )}

                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-10 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {isSignup && (
                  <>
                    {/* Industry / Transport Name */}
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        name="industry"
                        placeholder="Transport Name"
                        value={formData.industry}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-3 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                      />
                    </div>
                  </>
                )}

                {!isSignup && verificationStep === "form" && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="rememberMe" className="text-sm text-gray-600 dark:text-gray-400">
                        Remember me
                      </label>
                    </div>
                    <button
                    hidden
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-4 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Please wait..."
                    : isSignup
                      ? "Create Account"
                      : "Sign In"}
                </button>
              </form>
            )}

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center justify-center gap-2 text-xs mt-4">
                <Shield className="h-4 w-4" />
                <span>Your data is securely encrypted</span>
              </div>
              <p className="mt-3 text-xs">
                © 2022 Why Digit System Private Limited
              </p>
            </div>
          </div>
        </div>

        {/* Right: Animation Section */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-b from-slate-900 via-blue-900/80 to-slate-900">
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-xs">
              {/* Vertical logo section */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 mb-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl backdrop-blur-sm border border-white/10 p-3">
                  <Lottie
                    animationData={ticketFlow}
                    loop={true}
                    autoplay={true}
                    style={{ width: "100%", height: "100%" }}
                  />

                </div>

                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-1"><span className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
   TICKETING PORTAL
  </span></h3>
                  <div className="w-16 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto mt-2 rounded-full" />
                  <p className="text-[11px] text-blue-300/70 mt-2 tracking-wide">
                    Speed • Transparency • Control
                  </p>
                </div>
              </div>

              {/* Vertical feature list */}
              <div className="space-y-3">
                {/* Feature 1 */}
                <div className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors group">
                  <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v12m8-6H4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm">
                      Seamless Ticket Management
                    </h4>
                    <p className="text-blue-100/60 text-xs">
                      Create, assign, and track tickets effortlessly across teams in real time
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors group">
                  <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 20h9"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm">
                      Real-Time Status Tracking
                    </h4>
                    <p className="text-blue-100/60 text-xs">
                      Stay updated with live ticket progress, status changes, and instant notifications
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors group">
                  <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm">
                      Smart Workflow Automation
                    </h4>
                    <p className="text-blue-100/60 text-xs">
                      Automate ticket routing, prioritization, and resolution for faster turnaround
                    </p>
                  </div>
                </div>
              </div>

              {/* Compact footer */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="text-center">
                  <p className="text-xs text-blue-200/50">
                    Trusted by growing teams to simplify ticketing and support operations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthForm;