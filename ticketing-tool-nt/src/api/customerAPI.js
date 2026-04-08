import apiClient from "./apiClient";

export const customerAPI = {

  // ---------------- getAllCustomers ----------------
  getAllCustomers: async () => {
    try {
      const data = await apiClient.get("/api/user/getAllCustomer");

      if (data?.statusFlag === "Ok") {
        return data.paramObjectsMap?.usersVO || [];
      }

      throw new Error(JSON.stringify(data) || "Failed to fetch customers");
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  },

  // ---------------- updateCustomer ----------------
  updateCustomer: async ({ userId, payload }) => {
    try {
      const response = await apiClient.put(
        `/api/user/updateCustomer?userId=${userId}`,
        payload
      );

      if (response?.statusFlag === "Ok" || response?.status === true) {
        return true;
      }

      throw new Error(JSON.stringify(response) || "Failed to update customer");
    } catch (error) {
      console.error("Error updating customer:", error);
      return false;
    }
  },

};