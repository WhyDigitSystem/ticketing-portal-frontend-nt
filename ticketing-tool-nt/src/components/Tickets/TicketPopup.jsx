import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { X, Download, Check, Edit, Trash2, Save } from "lucide-react";
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
  const [editingComment, setEditingComment] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);




  const user = useSelector((state) => state.auth.user);

  const type = user?.type?.toLowerCase();
  const isCustomer = type === "customer";

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

  const normalizeComments = (list = []) => {
    return list.map((c) => {
      const rawTime =
        c?.commentsTime ||
        c?.commondate?.createdon ||
        c?.commondate?.modifiedon;

      return {
        ...c,
        createdAt: rawTime,
      };
    });
  };


  const parseDate = (timestamp) => {
    if (!timestamp) return null;

    const normalized = timestamp.replace(" ", "T");

    const date = new Date(normalized);
    return isNaN(date.getTime()) ? null : date;
  };

  const timeAgo = (timestamp) => {
    const date = parseDate(timestamp);
    if (!date) return "just now";

    const diff = Math.floor((Date.now() - date.getTime()) / 1000);

    if (diff < 5) return "just now";
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await ticketAPI.getCommentsByTicketId(ticket.id);
      setComments(normalizeComments(data || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
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

          // upload image first (if any)
          if (image) {
            await ticketAPI.uploadCommentImage(newCommentData.id, image);
          }

          // ensure safe normalization (createdon/modifiedon handling)
          const normalized = normalizeComments([
            {
              ...newCommentData,
              commondate: newCommentData.commondate || {
                createdon: new Date().toISOString(),
                modifiedon: new Date().toISOString(),
              },
            },
          ])[0];

          // instant insert (no refetch)
          setComments((prev) => [...prev, normalized]);

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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 animate-fadeIn"
      onClick={onClose}
    >
      {successMessage && (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-6 py-3 rounded shadow flex items-center gap-2 animate-scaleIn">
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
        className="w-full max-w-xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center px-5 py-3 border-b bg-gray-50 dark:bg-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">Ticket Details</h2>
          <button onClick={onClose} className="text-gray-600 dark:text-gray-300">
            <X />
          </button>
        </div>

        {/* BODY */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {ticketData && (
            <>
              {/* Ticket Info */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <p><b>Title:</b> {ticketData.title}</p>
                  <select
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={isCustomer}
                    className="px-2 py-1 rounded border bg-white dark:bg-gray-700"
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
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
                    Attachment
                  </h3>

                  <div className="relative inline-block">
                    <img
                      src={
                        ticketData.imageData.startsWith("data:")
                          ? ticketData.imageData
                          : `data:image/png;base64,${ticketData.imageData}`
                      }
                      alt="Ticket Attachment"
                      className="w-32 h-20 object-cover rounded-lg shadow-sm cursor-pointer hover:opacity-80 transition"
                      onClick={() =>
                        setPreviewImage(
                          ticketData.imageData.startsWith("data:")
                            ? ticketData.imageData
                            : `data:image/png;base64,${ticketData.imageData}`
                        )
                      }
                    />

                    <button
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = ticketData.imageData.startsWith("data:")
                          ? ticketData.imageData
                          : `data:image/png;base64,${ticketData.imageData}`;
                        link.download = ticketData.title || "ticket-image.png";
                        link.click();
                      }}
                      className="absolute top-1 right-1 bg-white dark:bg-gray-800 p-1 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      title="Download"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* COMMENTS */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                <h3 className="font-semibold mb-3">Comments</h3>
                {loading ? (
                  <p className="text-sm text-gray-500">Loading...</p>
                ) : comments.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center">No comments</p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((c) => {
                      const name = getDisplayName(c.commentName);
                      const initial = name.charAt(0).toUpperCase();
                      const canEditOrDelete = c.commentName?.toLowerCase() === currentUserEmail;

                      return (
                        <div key={c.id} className="flex gap-3 items-start">
                          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
                            {initial}
                          </div>
                          <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-3 relative">
                            <div className="flex justify-between items-center">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{name}</p>
                              <div className="flex items-center gap-2">
                                {/* TIME AGO */}
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {timeAgo(c.createdAt)}
                                </span>

                                {/* ACTION BUTTONS */}
                                {canEditOrDelete && editingComment?.id !== c.id && (
                                  <div className="flex items-center gap-2">
                                    {/* EDIT */}
                                    <button
                                      onClick={() => handleEditComment(c)}
                                      title="Edit"
                                      className="px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 
        hover:bg-blue-100 dark:hover:bg-blue-900/40 
        hover:scale-105 active:scale-95 
        transition-all duration-200 flex items-center gap-1"
                                    >
                                      <Edit size={14} />
                                    </button>

                                    {/* DELETE */}
                                    <button
                                      onClick={() => handleDeleteComment(c.id)}
                                      title="Delete"
                                      className="px-2 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 
        hover:bg-red-100 dark:hover:bg-red-900/40 
        hover:scale-105 active:scale-95 
        transition-all duration-200 flex items-center gap-1"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {editingComment?.id === c.id ? (
                              <div className="mt-1 flex items-start gap-2">

                                {/* TEXTAREA */}
                                <textarea
                                  className="flex-1 text-sm px-2 py-1 
                 bg-transparent 
                 border-b border-gray-300 dark:border-gray-600
                 focus:outline-none focus:border-blue-500
                 text-gray-900 dark:text-white 
                 resize-none"
                                  value={editingComment.text}
                                  onChange={(e) =>
                                    setEditingComment((prev) => ({ ...prev, text: e.target.value }))
                                  }
                                  rows={2}
                                  autoFocus
                                  placeholder="Edit..."
                                />

                                {/* ACTION ICONS */}
                                <div className="flex items-center gap-1 mt-1">

                                  {/* SAVE */}
                                  <button
                                    onClick={handleAddOrUpdateComment}
                                    className="p-1.5 rounded-md text-blue-600 
                   hover:bg-blue-50 dark:hover:bg-blue-900/20 
                   hover:scale-105 active:scale-95 
                   transition-all"
                                    title="Save"
                                  >
                                    <Save size={14} />
                                  </button>

                                  {/* CANCEL */}
                                  <button
                                    onClick={() => setEditingComment(null)}
                                    className="p-1.5 rounded-md text-gray-500 
                   hover:bg-gray-100 dark:hover:bg-gray-700 
                   hover:scale-105 active:scale-95 
                   transition-all"
                                    title="Cancel"
                                  >
                                    <X size={17} />
                                  </button>

                                </div>
                              </div>
                            ) : (
                              <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                                {c.comment}
                              </p>
                            )}

                            {c.ticketCommentImageVO?.map((img) => (
                              <div key={img.id} className="relative w-32 h-32 mt-2 rounded overflow-hidden">
                                <img
                                  src={img.commentImage}
                                  alt="comment-img"
                                  className="w-32 h-32 object-cover rounded cursor-pointer hover:opacity-80"
                                  onClick={() => setPreviewImage(img.commentImage)}
                                />
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
                          {previewImage && (
                            <div
                              className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animate-fadeIn"
                              onClick={() => setPreviewImage(null)}
                            >
                              <div
                                className="relative max-w-4xl w-full flex justify-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => setPreviewImage(null)}
                                  className="absolute top-2 right-2 bg-white text-black rounded-full p-1 shadow"
                                >
                                  <X size={20} />
                                </button>

                                <img
                                  src={previewImage}
                                  alt="Preview"
                                  className="max-h-[85vh] w-auto rounded-lg shadow-lg"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ADD NEW COMMENT */}
              {!editingComment && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2">
                  <textarea
                    className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <div className="flex justify-end items-center">
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