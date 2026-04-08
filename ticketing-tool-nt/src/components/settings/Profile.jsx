import React, { useState, useEffect } from "react";
import {
  Save,
  X,
  Shield,
  User,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import axios from "axios";
import { useSelector } from "react-redux";
import { encryptPassword } from "../../utils/PasswordEnc";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [message, setMessage] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profile, setProfile] = useState(null);
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const user = useSelector((state) => state.auth.user);
  const userId = user?.userId;
  const username = user?.name;

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const res = await axios.get(
          "http://139.5.190.244:8061/api/user/getUserById",
          { params: { userId } }
        );

        const userData = res.data?.paramObjectsMap?.userVO;

        setProfile({
          name: userData?.firstName,
          email: userData?.email,
          username: userData?.userName,
          type: userData?.type,
          company: userData?.company,
          status: userData?.active ? "Active" : "Inactive",
        });
      } catch {
        setProfile(null);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  /* ================= PASSWORD ================= */
  const handleClear = () => {
    setPassword({ current: "", new: "", confirm: "" });
  };

  const handleSave = async () => {
    if (!password.current || !password.new || !password.confirm) {
      return showMessage("All fields required");
    }

    if (password.new !== password.confirm) {
      return showMessage("Passwords do not match");
    }

    try {
      setPasswordLoading(true);

      const payload = {
        newPassword: encryptPassword(password.new),
        oldPassword: encryptPassword(password.current),
        userName: username,
      };

      const res = await axios.post(
        "http://139.5.190.244:8061/api/user/changePassword",
        payload
      );

      if (res?.data?.status) {
        showMessage("Password updated successfully!");
        handleClear();
      } else {
        showMessage("Update failed");
      }
    } catch {
      showMessage("Something went wrong");
    } finally {
      setPasswordLoading(false);
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 2000);
  };

  return (
    <div className="px-6 py-6 animate-fadeIn">

      {/* Toast */}
      {message && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded shadow flex items-center gap-2 z-50">
          <Check className="w-5 h-5 bg-white text-green-500 rounded-full p-1" />
          <span className="text-sm">{message}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="relative mb-6 overflow-hidden rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4">

        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>

        <div className="relative flex justify-between items-center flex-wrap gap-3">

          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow">
              {activeTab === "profile" ? (
                <User className="text-white w-5 h-5" />
              ) : (
                <Shield className="text-white w-5 h-5" />
              )}
            </div>

            <div>
              <h1 className="text-xl font-bold dark:text-white">
                My Profile
              </h1>
              <p className="text-xs text-gray-500">
                Manage profile & security
              </p>
            </div>
          </div>

          {/* Actions */}
          {activeTab === "security" && (
            <div className="flex gap-2">
              <button
                onClick={handleClear}
                className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border rounded-lg"
              >
                <X size={14} /> Clear
              </button>

              <button
                onClick={handleSave}
                disabled={passwordLoading}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg"
              >
                <Save size={14} />
                {passwordLoading ? "Updating..." : "Save"}
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          {["profile", "security"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-sm rounded-lg ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* CARD */}
      <div className="flex  animate-slideUp ">
        <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl  border p-6 space-y-4 shadow-md hover:shadow-lg">

          {activeTab === "profile" && (
            <>
              {profileLoading ? (
                <Skeleton />
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(profile || {}).map(([k, v]) => (
                    <Field key={k} label={k} value={v} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "security" && (
            <>
              <Input label="Current Password" value={password.current}
                onChange={(e) => setPassword({ ...password, current: e.target.value })} type="password" />

              <Input label="New Password" value={password.new}
                onChange={(e) => setPassword({ ...password, new: e.target.value })} type="password" />

              <Input label="Confirm Password" value={password.confirm}
                onChange={(e) => setPassword({ ...password, confirm: e.target.value })} type="password" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* FIELD */
const Field = ({ label, value }) => (
  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
    <p className="text-xs text-gray-500 capitalize">{label}</p>
    <p className="text-sm font-semibold">{value || "—"}</p>
  </div>
);

/* INPUT */
const Input = ({ label, value, onChange, type = "text" }) => {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label className="text-xs font-semibold mb-1 block">{label}</label>

      <div className="relative">
        <input
          type={isPassword ? (show ? "text" : "password") : "text"}
          value={value}
          onChange={onChange}
          className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-2 top-2"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
};

/* Skeleton */
const Skeleton = () => (
  <div className="grid grid-cols-2 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
    ))}
  </div>
);

/* Animations */
const styles = `
@keyframes fadeIn { from {opacity:0;} to {opacity:1;} }
@keyframes slideUp { from {opacity:0; transform:translateY(10px);} to {opacity:1; transform:translateY(0);} }

.animate-fadeIn { animation: fadeIn 0.4s ease; }
.animate-slideUp { animation: slideUp 0.4s ease forwards; opacity:0; }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default Profile;