import { toast as reactToast } from "react-hot-toast";

const baseStyle = {
    width: "320px",
    minHeight: "60px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 20px",
    fontSize: "15px",
    fontWeight: 500,
    borderRadius: "12px",
    border: "1px solid rgba(0,0,0,0.08)",
    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
};

export const toast = {
    success: (message) => {
        reactToast.success(message, {
            duration: 3000,
            position: "top-right",
            style: {
                ...baseStyle,
                background: "#E9FBF3",
                color: "#0F6F79",
                border: "1px solid #C6F7E6",
            },
        });
    },

    error: (message) => {
        reactToast.error(message, {
            duration: 3000,
            position: "top-right",
            style: {
                ...baseStyle,
                background: "#F4E7E9",
                color: "#8E1F2F",
                border: "1px solid #E2C5CA",
            },
        });
    },

    warning: (message) => {
        reactToast(message, {
            duration: 3000,
            position: "top-right",
            style: {
                ...baseStyle,
                background: "#FFF4DF",
                color: "#8A6313",
                border: "1px solid #F1D9A8",
            },
        });
    },

    info: (message) => {
        reactToast(message, {
            duration: 3000,
            position: "top-right",
            style: {
                ...baseStyle,
                background: "#E6EEF8",
                color: "#244A78",
                border: "1px solid #C9D7EE",
            },
        });
    },
};
