import {
  Calendar,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Shield,
  Sun,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import { logout } from "../../store/slices/authSlice";
import { toggleSidebar } from "../../store/slices/uiSlice";
import NotificationComponent from "../../utils/Notification";
import efitlogo from '../../assets/EfitLogo.png'


const Header = () => {
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const dropdownRef = useRef(null);
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
  const sidebarBtnRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    const handleClickOutsideSidebar = (event) => {
      const isMobile = window.innerWidth < 768;
      if (!isMobile) return;

      const sidebar = document.getElementById("sidebar");

      if (
        sidebarOpen &&
        sidebar &&
        !sidebar.contains(event.target) &&
        !sidebarBtnRef.current.contains(event.target)
      ) {
        dispatch(toggleSidebar());
      }
    };

    document.addEventListener("mousedown", handleClickOutsideSidebar);

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideSidebar);
    };
  }, [sidebarOpen, dispatch]);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };


  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getUserRole = () => {
    if (user?.type === "Employee") return "Operational Staff";
    if (user?.type === "Customer") return "Customer";
    if (user?.type === "Admin") return "System Administrator";
    return user?.role || "User";
  };

  const getStatusColor = () => {
    if (["Employee", "Customer", "Admin"].includes(user?.type)) {
      return "bg-green-500";
    }
    return "bg-gray-500";
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="px-3">
        <div className="flex items-center justify-between h-14">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <div className="w-28 h-12 flex-shrink-0">
              <img
                src={efitlogo}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Sidebar Toggle Button */}
            <button
              ref={sidebarBtnRef}
              onClick={() => dispatch(toggleSidebar())}
              className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Date & Time Display */}
            <div className="hidden xl:block">
              <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div className="text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatTime(currentDateTime)}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 mx-1">•</span>
                  <span className="text-gray-600 dark:text-gray-300">
                    {formatDate(currentDateTime)}
                  </span>
                </div>
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors relative group"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-yellow-400 transition-transform group-hover:scale-110" />
              ) : (
                <Moon className="h-5 w-5 text-slate-700 dark:text-slate-300 transition-transform group-hover:scale-110" />
              )}
            </button>

            {/* Notifications */}
            <NotificationComponent />

            {/* User Profile */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-3 pl-3 border-l border-gray-200 dark:border-gray-700 py-1"
              >
                <div className="relative">
                  <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-950 rounded-xl flex items-center justify-center text-white font-semibold shadow-sm">
                    {getUserInitials()}
                  </div>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor()} rounded-full border-2 border-white dark:border-gray-900`}
                  ></div>
                </div>

                <div className="hidden lg:block text-left">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[120px]">
                    {user?.name || "User"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {getUserRole()}
                  </div>
                </div>

                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform ${showProfileDropdown ? "rotate-180" : ""
                    }`}
                />
              </button>

              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden">
                  {/* User Info Header */}
                  <div className="p-5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-950 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {getUserInitials()}
                        </div>
                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor()} rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center`}
                        >
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                          {user?.name || "User"}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-0.5">
                          {user?.email || "user@example.com"}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                            {getUserRole()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          navigate("/myprofile");
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="font-medium">My Profile</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>

                      {user?.type === "Transporter" && (
                        <button
                          onClick={() => {
                            setShowProfileDropdown(false);
                            navigate("/transporter/settings");
                          }}
                          className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg group-hover:bg-orange-100 dark:group-hover:bg-orange-900/50 transition-colors">
                              <Truck className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            <span className="font-medium">
                              Transport Settings
                            </span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="px-3">
                    <div className="h-px bg-gray-100 dark:bg-gray-800"></div>
                  </div>

                  {/* Logout */}
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg group-hover:bg-red-100 dark:group-hover:bg-red-900/50 transition-colors">
                          <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                        <span className="font-medium">Sign Out</span>
                      </div>
                      <LogOut className="h-4 w-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity rotate-180" />
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Version 1.0 • © 2026 India
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// Truck icon component since it wasn't imported
const Truck = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM12 8h4l2 4h2a2 2 0 012 2v4a2 2 0 01-2 2h-2M5 17H3a2 2 0 01-2-2v-4a2 2 0 012-2h2l2-4h4"
    />
  </svg>
);

export default Header;