import {
  AlertTriangle,
  Bell,
  Car,
  CheckCheck,
  CheckCircle,
  ChevronRight,
  Clock,
  Info,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { notificationAPI } from "../api/notificationAPI";

// Convert timestamp → "time ago"
const timeAgo = (timestamp) => {
  const now = new Date();
  const past = new Date(timestamp);
  const diff = Math.floor((now - past) / 1000);

  if (diff < 60) return `${diff} sec ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;

  return `${Math.floor(diff / 86400)} days ago`;
};

// Updated config for notification UI with all types from your API
const notificationConfig = {
  INSURANCE: {
    icon: <Shield className="h-5 w-5 text-red-500" />,
    priority: "high",
    title: "Insurance Expiry",
  },
  FITNESS: {
    icon: <Car className="h-5 w-5 text-amber-500" />,
    priority: "high",
    title: "Fitness Expiry",
  },
  "Quote Rejected": {
    icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
    priority: "medium",
    title: "Quote Rejected",
  },
  Info: {
    icon: <Info className="h-5 w-5 text-blue-500" />,
    priority: "low",
    title: "Information",
  },
  "Payment Received": {
    icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    priority: "high",
    title: "Payment Received",
  },
  "Trip Completed": {
    icon: <CheckCircle className="h-5 w-5 text-blue-500" />,
    priority: "medium",
    title: "Trip Completed",
  },
  "Maintenance Due": {
    icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    priority: "high",
    title: "Maintenance Due",
  },
  DEFAULT: {
    icon: <Info className="h-5 w-5 text-gray-400" />,
    priority: "low",
    title: "Notification",
  },
};

// Priority badge
const getPriorityBadge = (priority) => {
  const colors = {
    high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    medium:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority]}`}
    >
      {priority}
    </span>
  );
};

let lastNotifiedIds = new Set();

const NotificationComponent = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'unread', 'high'
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useSelector((state) => state.auth);
  const orgId = user?.orgId;

  // System notification handler
  const showSystemNotification = (notif) => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    if (lastNotifiedIds.has(notif.id)) return;
    lastNotifiedIds.add(notif.id);

    new Notification(notif.title, {
      body: notif.message,
      icon: "/logo512.png",
      tag: notif.id,
    });
  };

  // Get notification config based on type
  const getNotificationConfig = (type) => {
    return notificationConfig[type] || notificationConfig.DEFAULT;
  };

  // Fetch notifications
  const loadNotifications = async () => {
    if (!orgId) return;

    setIsLoading(true);
    try {
      const response = await notificationAPI.getAllNotificationByUserId({
        orgId,
      });

      // Check response structure - it might be direct array or wrapped
      let notificationList = [];

      if (Array.isArray(response)) {
        notificationList = response;
      } else if (response?.paramObjectsMap?.notificationVO) {
        notificationList = response.paramObjectsMap.notificationVO;
      } else if (response?.notificationVO) {
        notificationList = response.notificationVO;
      } else if (response?.data) {
        // Handle if API returns { data: [...] }
        notificationList = Array.isArray(response.data) ? response.data : [];
      }

      // Filter and transform notifications
      const list = notificationList
        .filter((n) => !n.deleted)
        .map((n) => {
          const config = getNotificationConfig(n.notificationType);
          return {
            id: n.notificationId,
            title: config.title || n.notificationType,
            message: n.message,
            isRead: n.read,
            time: timeAgo(n.createdOn),
            auctionsid: n.auctionsid,
            icon: config.icon,
            priority: config.priority,
            type: n.notificationType,
            createdOn: n.createdOn,
          };
        });

      // Show system notifications for new unread items
      list.forEach((n) => {
        if (!n.isRead && !lastNotifiedIds.has(n.id)) {
          showSystemNotification(n);
        }
      });

      setNotifications(list.reverse());
      setUnread(list.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        console.log("Notification permission:", permission);
      });
    }

    if (orgId) {
      loadNotifications();
    }

    const interval = setInterval(() => {
      if (orgId) loadNotifications();
    }, 15000);

    const focusHandler = () => {
      if (orgId) loadNotifications();
    };

    window.addEventListener("focus", focusHandler);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", focusHandler);
    };
  }, [orgId]);

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return !n.isRead;
    if (activeFilter === "high") return n.priority === "high";
    return true;
  });

  // Actions
  const markRead = async (id) => {
    try {
      await notificationAPI.markRead({ id });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnread((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Mark read failed:", error);
    }
  };

  const markAllRead = async () => {
    try {
      // Get all unread notification IDs
      const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);

      // Mark each as read
      for (const id of unreadIds) {
        await notificationAPI.markRead({ id });
      }

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
    } catch (error) {
      console.error("Mark all read failed:", error);
    }
  };

  const deleteNotif = async (id) => {
    const notif = notifications.find((n) => n.id === id);
    try {
      await notificationAPI.clearNotificationById({ id });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (!notif.isRead) setUnread((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Delete notification failed:", error);
    }
  };

  const clearAll = async () => {
    try {
      await notificationAPI.clearAllNotificationd({ orgId });
      setNotifications([]);
      setUnread(0);
    } catch (error) {
      console.error("Clear all failed:", error);
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all relative"
        aria-label={`Notifications ${unread > 0 ? `(${unread} unread)` : ""}`}
      >
        <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center border border-white dark:border-gray-900 animate-pulse">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Right Side Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />

        {/* Drawer Content */}
        <div className="relative ml-auto h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-ping" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {unread} unread • {notifications.length} total
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Close notifications"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <button
              onClick={() => setActiveFilter("all")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === "all"
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter("unread")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === "unread"
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50"
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setActiveFilter("high")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === "high"
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50"
              }`}
            >
              Priority
            </button>
          </div>

          {/* Notifications List */}
          <div className="h-[calc(100vh-200px)] overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  Loading notifications...
                </p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl mb-4">
                  <Bell className="h-12 w-12 text-blue-500 dark:text-blue-400 opacity-50" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No notifications
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-xs">
                  {activeFilter === "all"
                    ? "You're all caught up! No notifications yet."
                    : `No ${activeFilter} notifications found.`}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 transition-colors group hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                      !n.isRead ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-1 flex-shrink-0">{n.icon}</div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                              {n.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              {getPriorityBadge(n.priority)}
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {n.type}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {!n.isRead && (
                              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                            )}
                            <button
                              onClick={() => deleteNotif(n.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all"
                              aria-label={`Delete ${n.title} notification`}
                            >
                              <Trash2 className="h-4 w-4 text-gray-500" />
                            </button>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                          {n.message}
                        </p>

                        {n.auctionsid && (
                          <div className="inline-flex items-center gap-1 mb-3 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-medium">
                            <ChevronRight className="h-3 w-3" />
                            Auction ID: {n.auctionsid}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3" />
                            {n.time}
                          </div>

                          {!n.isRead && (
                            <button
                              onClick={() => markRead(n.id)}
                              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={clearAll}
                  className="flex items-center gap-2 px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Clear All</span>
                </button>

                <button
                  onClick={() => (window.location.href = "/notifications")}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span className="text-sm font-medium">View All</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationComponent;
