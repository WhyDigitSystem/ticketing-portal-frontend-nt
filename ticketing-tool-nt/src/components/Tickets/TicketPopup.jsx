import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { X, Upload, Download, Check, Edit, Trash2, Save } from "lucide-react";
import { ticketAPI } from "../../api/ticketAPI";

const TicketPopup = ({ isOpen, onClose, ticket, onUpdateTicket }) => {
  const loggedInUser = useSelector((state) => state.auth.user);
  const currentUserEmail = loggedInUser?.email?.toLowerCase() || "";

  const [ticketData, setTicketData] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingComment, setEditingComment] = useState(null); // {id, text}

  useEffect(() => {
    if (isOpen && ticket?.id) {
      loadTicketDetails();
      fetchComments();
    }
  }, [isOpen, ticket]);

  const loadTicketDetails = async () => {
    try {
      const details = await ticketAPI.getTicketById(ticket.id);
      if (details) {
        setTicketData(details);
        setStatus(details.status || "Inprogress");
      }
    } catch (err) {
      console.error("Error loading ticket details:", err);
      setErrorMessage("Failed to load ticket details");
      setTimeout(() => setErrorMessage(""), 2500);
    }
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await ticketAPI.getCommentsByTicketId(ticket.id);
      setComments(data || []);
    } catch (err) {
      console.error(err);
      setComments([]);
      setErrorMessage("Failed to fetch comments");
      setTimeout(() => setErrorMessage(""), 2500);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (name) => {
    if (!name) return "User";
    if (name.includes("@")) return name.split("@")[0];
    return name;
  };

  const timeAgo = (timestamp) => {
    if (!timestamp) return "";
    const now = new Date();
    const past = new Date(timestamp);
    const diff = Math.floor((now - past) / 1000);
    if (diff < 60) return `${diff} sec${diff > 1 ? "s" : ""} ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min${Math.floor(diff / 60) > 1 ? "s" : ""} ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? "s" : ""} ago`;
    return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? "s" : ""} ago`;
  };

  const handleStatusChange = async (newStatus) => {
    const oldStatus = status;
    setStatus(newStatus);
    try {
      const res = await ticketAPI.changeTicketStatus({
        id: ticket.id,
        status: newStatus,
        empCode: ticket.email,
      });

      if (res.success) {
        setStatus(res.ticket.status);
        setSuccessMessage("Status updated successfully");
        setTimeout(() => setSuccessMessage(""), 2500);
        onUpdateTicket?.(res.ticket);
        setErrorMessage("");
      } else {
        setStatus(oldStatus);
        setErrorMessage(res.message || "Failed to update status");
        setTimeout(() => setErrorMessage(""), 2500);
      }
    } catch (err) {
      setStatus(oldStatus);
      console.error(err);
      setErrorMessage("Unexpected error while updating status");
      setTimeout(() => setErrorMessage(""), 2500);
    }
  };

  const handleAddOrUpdateComment = async () => {
    if (editingComment) {
      if (!editingComment.text.trim()) return;
      try {
        const res = await ticketAPI.updateComment({
          id: editingComment.id,
          ticketId: ticket.id,
          comment: editingComment.text,
          commentName: loggedInUser?.email || "User",
        });
        if (res.success) {
          setSuccessMessage("Comment updated successfully");
          setTimeout(() => setSuccessMessage(""), 2500);
          setEditingComment(null);
          fetchComments();
        } else {
          setErrorMessage(res.message || "Failed to update comment");
          setTimeout(() => setErrorMessage(""), 2500);
        }
      } catch (err) {
        console.error(err);
        setErrorMessage("Unexpected error while updating comment");
        setTimeout(() => setErrorMessage(""), 2500);
      }
    } else if (newComment.trim() || image) {
      try {
        const res = await ticketAPI.createComment({
          ticketId: ticket.id,
          comment: newComment,
          commentName: loggedInUser?.email || "User",
        });
        if (res.success) {
          const newCommentData = res.data;
          if (image) {
            await ticketAPI.uploadCommentImage(newCommentData.id, image);
          }
          fetchComments();
          setSuccessMessage("Comment added successfully");
          setTimeout(() => setSuccessMessage(""), 2500);
          setNewComment("");
          setImage(null);
        } else {
          setErrorMessage("Failed to add comment");
          setTimeout(() => setErrorMessage(""), 2500);
        }
      } catch (err) {
        console.error(err);
        setErrorMessage("Unexpected error while adding comment");
        setTimeout(() => setErrorMessage(""), 2500);
      }
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment({ id: comment.id, text: comment.comment });
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await ticketAPI.deleteComment(commentId);
      if (res.success) {
        fetchComments();
        setSuccessMessage("Comment deleted successfully");
        setTimeout(() => setSuccessMessage(""), 2500);
        setErrorMessage("");
      } else {
        setErrorMessage(res.message || "Failed to delete comment");
        setTimeout(() => setErrorMessage(""), 2500);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Unexpected error while deleting comment");
      setTimeout(() => setErrorMessage(""), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center animate-fadeIn"
      onClick={onClose}
    >
      {successMessage && (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-6 py-3 rounded shadow flex items-center gap-2">
          <Check size={18} className="bg-white text-green-500 rounded-full" />
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="absolute top-4 right-4 bg-red-500 text-white px-6 py-3 rounded shadow flex items-center gap-2">
          <X size={18} className="bg-white text-red-500 rounded-full" />
          {errorMessage}
        </div>
      )}

      <div
        className="bg-white dark:bg-gray-800 w-[700px] max-h-[90vh] rounded-xl shadow flex flex-col animate-scaleIn overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center px-5 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Ticket Details</h2>
          <button onClick={onClose} className="text-gray-600 dark:text-gray-300">
            <X />
          </button>
        </div>

        {/* BODY */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4 text-gray-800 dark:text-gray-200">
          {ticketData && (
            <>
              {/* Ticket Info */}
              <div className="text-sm space-y-2">
                <p><b>Title:</b> {ticketData.title}</p>
                <div className="flex justify-between items-center">
                  <p><b>Status:</b> {status}</p>
                  <select
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 px-2 py-1 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Inprogress">Inprogress</option>
                    <option value="Completed">Completed</option>
                    <option value="YetToAssign">YetToAssign</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <p><b>customer:</b> {ticketData.customer || "-"}</p>
                <p><b>Description:</b> {ticketData.description}</p>
                <p><b>Priority:</b> {ticketData.priority}</p>
                <p><b>Assigned To:</b> {ticketData.assignedToEmp || "-"}</p>
              </div>

              {/* Ticket Image */}
              {ticketData.imageData && (
                <div className="my-3 relative">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Attachment</h4>
                  <img
                    src={ticketData.imageData.startsWith("data:") ? ticketData.imageData : `data:image/png;base64,${ticketData.imageData}`}
                    alt="Ticket Attachment"
                    className="w-48 h-48 object-cover rounded"
                  />
                  <button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = ticketData.imageData.startsWith("data:") ? ticketData.imageData : `data:image/png;base64,${ticketData.imageData}`;
                      link.download = ticketData.title || "ticket-image.png";
                      link.click();
                    }}
                    className="absolute top-2 right-2 bg-white dark:bg-gray-800 p-1 rounded-full shadow flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Download"
                  >
                    <Download size={20} />
                  </button>
                </div>
              )}

              {/* COMMENTS */}
              <div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Comments</h3>
                {loading ? (
                  <p>Loading...</p>
                ) : comments.length === 0 ? (
                  <p className="text-gray-400 dark:text-gray-500 text-center py-4">No comments</p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((c) => {
                      const name = getDisplayName(c.commentName);
                      const initial = name.charAt(0).toUpperCase();
                      const canEditOrDelete =c.commentName?.toLowerCase() === currentUserEmail;

                      return (
                        <div key={c.id} className="flex gap-3 items-start">
                          <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                            {initial}
                          </div>
                          <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-3 relative">
                            <div className="flex justify-between items-center">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{name}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(c.createdAt)}</span>
                                {canEditOrDelete && editingComment?.id !== c.id && (
                                  <>
                                    <button
                                      onClick={() => handleEditComment(c)}
                                      title="Edit"
                                      className="p-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center"
                                    >
                                      <Edit size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteComment(c.id)}
                                      title="Delete"
                                      className="p-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            {editingComment?.id === c.id ? (
                              <div className="mt-1 space-y-1">
                                <textarea
                                  className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  value={editingComment.text}
                                  onChange={(e) => setEditingComment((prev) => ({ ...prev, text: e.target.value }))}
                                  rows={3}
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={handleAddOrUpdateComment}
                                    className="bg-green-500 text-white px-3 py-1 rounded flex items-center gap-1"
                                  >
                                    <Save size={14} /> Save
                                  </button>
                                  <button
                                    onClick={() => setEditingComment(null)}
                                    className="bg-red-500 text-white px-3 py-1 rounded flex items-center gap-1"
                                  >
                                    <X size={14} /> Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">{c.comment}</p>
                            )}

                            {c.ticketCommentImageVO?.map((img) => (
                              <div key={img.id} className="relative w-32 h-32 mt-2 rounded overflow-hidden">
                                <img src={img.commentImage} alt="comment-img" className="w-32 h-32 object-cover rounded" />
                                <button
                                  onClick={() => {
                                    const link = document.createElement("a");
                                    link.href = img.commentImage;
                                    link.download = "comment-image.png";
                                    link.click();
                                  }}
                                  className="absolute top-1 right-1 bg-white dark:bg-gray-800 p-1 rounded-full shadow flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                                  title="Download"
                                >
                                  <Download size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ADD NEW COMMENT */}
              {!editingComment && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
                  <textarea
                    className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                      <Upload size={16} /> Upload
                      <input type="file" hidden onChange={(e) => setImage(e.target.files[0])} />
                    </label>
                    <button
                      onClick={handleAddOrUpdateComment}
                      className="bg-blue-500 text-white px-4 py-1 rounded flex items-center gap-1"
                    >
                      Send
                    </button>
                  </div>

                  {image && (
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Download size={16} /> {image.name}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* Animations */
const styles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.animate-fadeIn { animation: fadeIn 0.25s ease-out; }
.animate-scaleIn { animation: scaleIn 0.25s ease-out; }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default TicketPopup;