// Simplified version focusing on the core logic
import { useEffect, useState, useRef } from "react";
import { getNetworkStatus, onNetworkStatusChange } from "../api/apiClient";

const NetworkStatusNotifier = () => {
  const [isOnline, setIsOnline] = useState(getNetworkStatus());
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    const handleStatusChange = (status) => {
      setIsOnline(status);
      
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      // Set notification
      setNotificationMessage(
        status ? "Internet connection restored" : "No internet connection"
      );
      setShowNotification(true);
      
      // Only auto-hide if we're online
      if (status) {
        timerRef.current = setTimeout(() => {
          setShowNotification(false);
        }, 4000);
      }
    };
    
    const unsubscribe = onNetworkStatusChange(handleStatusChange);
    
    return () => {
      unsubscribe();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  
  // Optional: Hide offline notification when manually dismissed
  const handleDismiss = () => {
    setShowNotification(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  if (!showNotification) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        padding: "12px 20px",
        backgroundColor: isOnline ? "#4CAF50" : "#f44336",
        color: "white",
        borderRadius: "4px",
        zIndex: 9999,
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        animation: "slideIn 0.3s ease-out",
        textAlign: "center",
        minWidth: "300px",
        maxWidth: "90%",
        cursor: "pointer",
      }}
      onClick={handleDismiss}
      title="Click to dismiss"
    >
      {notificationMessage}
    </div>
  );
};

export default NetworkStatusNotifier;