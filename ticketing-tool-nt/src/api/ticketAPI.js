import apiClient from "./apiClient";
import axios from "axios";

export const ticketAPI = {
  // Get all tickets
  getAllTickets: async () => {
    try {
      const data = await apiClient.get("/api/ticket/getAllTicket");

      if (data?.statusFlag === "Ok") {
        return data.paramObjectsMap?.ticketVO || [];
      }

      throw new Error(JSON.stringify(data));
    } catch (error) {
      console.error("Error fetching tickets:", error);
      throw error;
    }
  },

  // Create ticket
  createTicket: async (payload) => {
    try {
      const response = await apiClient.post("/api/ticket/createticket", payload);

      if (response?.statusFlag === "Ok" || response?.status === true) {
        return response;
      }

      return null;
    } catch (error) {
      console.error("Error creating ticket:", error);
      return null;
    }
  },

  // Upload file (BYPASS apiClient to avoid JSON header issue)
  uploadTicketFile: async (ticketId, file) => {
    try {
      const formData = new FormData();
      formData.append("file", file); // must match backend key

      const response = await axios.post(
        `http://139.5.190.244:8061/api/ticket/upload?id=${ticketId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // browser sets boundary automatically
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error uploading file:", error.response?.data || error);
      return null;
    }
  },

  // Assign a ticket to an employee
  assignTicket: async ({ id, assignedToEmployee, email, modifiedBy }) => {
    try {
      const payload = {
        id,
        assignedTo: assignedToEmployee, 
        assignedToEmployee,
        email,
        modifiedBy, 
      };

      const response = await apiClient.put("/api/ticket/assignTicket", payload);

      if (response?.status === true) {
        return {
          success: true,
          message: "Ticket assigned successfully",
          errors: response.errors || [],
        };
      }

      return {
        success: false,
        message: "Failed to assign ticket",
        errors: response.errors || [],
      };
    } catch (error) {
      console.error("Error assigning ticket:", error);
      return {
        success: false,
        message: error.message || "Unexpected error occurred",
        errors: [],
      };
    }
  },

  // Get ticket priority status count
  getTicketPriorityStatusCount: async () => {
    try {
      const data = await apiClient.get("/api/ticket/getTicketPriorityStatusCount");

      if (data?.statusFlag === "Ok") {
        return (
          data.paramObjectsMap?.ticketPriorityStatusDetails?.[0] || {
            normal: 0,
            high: 0,
            medium: 0,
            total: 0,
          }
        );
      }

      throw new Error(JSON.stringify(data) || "Failed to fetch ticket priority status count");
    } catch (error) {
      console.error("Error fetching ticket priority status count:", error);
      throw error;
    }
  },

  // Get employee ticket status counts
  getEmployeeTicketStatusCounts: async () => {
    try {
      const data = await apiClient.get("/api/ticket/getEmployeeTicketStatusCounts");

      if (data?.statusFlag === "Ok") {
        return data.paramObjectsMap?.ticketStatusDetails || [];
      }

      throw new Error(JSON.stringify(data) || "Failed to fetch employee ticket status counts");
    } catch (error) {
      console.error("Error fetching employee ticket status counts:", error);
      throw error;
    }
  },

  // Get all tickets assigned to a specific employee
  getAllTicketsByAssignedTo: async ({ empCode, userType }) => {
    try {
      const data = await apiClient.get("/api/ticket/getAllTicketByAssignedTo", {
        params: { empCode, userType },
      });

      if (data?.statusFlag === "Ok" || data?.status === true) {
        return data.paramObjectsMap?.ticketVO || [];
      }

      throw new Error(JSON.stringify(data) || "Failed to fetch tickets");
    } catch (error) {
      console.error("Error fetching tickets by assigned employee:", error);
      throw error;
    }
  },

  // Add this inside your ticketAPI object
getCommentsByTicketId: async (ticketId) => {
  try {
    const response = await apiClient.get("/api/ticket/getCommentsByTicketId", {
      params: { ticketId },
    });
    // API returns an array of comment objects
    return response || [];
  } catch (error) {
    console.error("Error fetching comments for ticket", ticketId, error);
    return [];
  }
},
// getTicketById
getTicketById: async (id) => {
  try {
    const response = await apiClient.get(`/api/ticket/${id}`);

    if (response?.status === true && response?.statusFlag === "Ok") {
      return response.paramObjectsMap?.ticketVO || null;
    }

    console.warn("Ticket not found or invalid response", response);
    return null;
  } catch (error) {
    console.error("Error fetching ticket by ID:", id, error);
    return null;
  }
},


// Change ticket status
changeTicketStatus: async ({ id, status, empCode }) => {
  try {
    const payload = {
      id,
      status,
      empCode, // MUST be email (based on your API response)
      createdon: new Date().toISOString(),
    };

    const response = await apiClient.put(
      "/api/ticket/ChangeTicketStatus",
      payload
    );

    if (response?.status === true && response?.statusFlag === "Ok") {
      return {
        success: true,
        ticket: response.paramObjectsMap?.ticketAssign, 
        message: response.paramObjectsMap?.message || "Status updated",
      };
    }

    return {
      success: false,
      message: "Failed to update status",
      errors: response?.errors || [],
    };
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return {
      success: false,
      message: error.message || "Unexpected error",
      errors: [],
    };
  }
},

//createComment
createComment: async ({ ticketId, comment, commentName }) => {
  try {
    const payload = {
      ticketId,
      comment,
      commentName,
      id: 0, // backend expects this
    };

    const response = await apiClient.post(
      "/api/ticket/createComments",
      payload
    );

    if (response && response.id) {
      return {
        success: true,
        data: response,
      };
    }

    return {
      success: false,
      message: "Failed to create comment",
    };
  } catch (error) {
    console.error("Error creating comment:", error);
    return {
      success: false,
      message: error.message || "Error creating comment",
    };
  }
},
// deleteComment
deleteComment: async (commentId) => {
  try {
    const response = await apiClient.delete(`/api/ticket/deleteCommentsById/${commentId}`);
    // API returns plain text message
    return {
      success: true,
      message: response || "Comment deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting comment:", error.response?.data || error);
    return {
      success: false,
      message: error.response?.data || error.message || "Error deleting comment",
    };
  }
},

// updateComment
updateComment: async ({ id, ticketId, commentName, comment }) => {
  try {
    const payload = {
      id,           // comment ID to update
      ticketId,     // ticket this comment belongs to
      commentName,  // user updating the comment
      comment,      // new comment text
    };

    const response = await apiClient.put("/api/ticket/updateComments", payload);

    if (response?.id) {
      return {
        success: true,
        data: response,
        message: "Comment updated successfully",
      };
    }

    return {
      success: false,
      message: "Failed to update comment",
      data: response,
    };
  } catch (error) {
    console.error("Error updating comment:", error.response?.data || error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Error updating comment",
    };
  }
},

};