import apiClient from "./apiClient";

export const notificationAPI = {
  getAllNotificationByUserId: async ({ orgId }) => {
    return await apiClient.get("/api/notification/byOrgId", {
      params: { orgId },
    });
  },

  clearNotificationById: async ({ id }) => {
    return await apiClient.put(`/api/notification/clear?id=${id}`);
  },

  clearAllNotificationd: async ({ orgId }) => {
    return await apiClient.put(`/api/notification/clearAll?userId=${orgId}`);
  },

  markRead: async ({ id }) => {
    return await apiClient.put(`/api/notification/markRead?id=${id}`);
  },
};
