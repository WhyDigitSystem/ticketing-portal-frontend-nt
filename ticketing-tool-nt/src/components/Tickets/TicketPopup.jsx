import React, { useEffect, useState,useRef  } from "react";
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
  const [initialLoad, setInitialLoad] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const [refreshComments, setRefreshComments] = useState(0);
  const user = useSelector((state) => state.auth.user);
  const type = user?.type?.toLowerCase();
  const isCustomer = type === "customer";

  useEffect(() => {
  if (!isOpen || !ticket?.id) return;

  loadTicketDetails();
}, [isOpen, ticket?.id]);

useEffect(() => {
  if (!isOpen || !ticket?.id) return;

  const fetchAll = async () => {
    try {
      setLoading(true);

      const ticketId = ticket?.sourceId || ticket?.id;

      const [myComments, customerComments] = await Promise.all([
        ticketAPI.getMyServerComments(ticketId),
        ticketAPI.getCustomerComments(ticketId),
      ]);

      const combined = [...myComments, ...customerComments];

      const normalized = normalizeComments(combined);

      setComments(
        normalized.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchAll();
}, [isOpen, ticket?.id, refreshComments]);

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


  useEffect(() => {
  const handleClickOutside = (event) => {
    const isClickInsideMenu = event.target.closest(".comment-menu");
    if (!isClickInsideMenu) {
      setActiveMenu(null);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

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

  const toggleMenu = (id) => {
    setActiveMenu((prev) => (prev === id ? null : id));
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
      if (initialLoad) setLoading(true);

      const ticketId = ticket?.sourceId || ticket?.id;

      const [myComments, customerComments] = await Promise.all([
        ticketAPI.getMyServerComments(ticketId),
        ticketAPI.getCustomerComments(ticketId),
      ]);

      const combined = [...myComments, ...customerComments];

      setComments((prev) => {
        const normalized = normalizeComments(combined);
        const existingIds = new Set(prev.map((c) => c.id));

        const newOnes = normalized.filter((c) => !existingIds.has(c.id));

        if (newOnes.length === 0) return prev;

        return [...prev, ...newOnes].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        );
      });
    } catch (err) {
      console.error(err);
    } finally {
      if (initialLoad) {
        setLoading(false);
        setInitialLoad(false);
      }
    }
  };

  const getDisplayName = (comment) => {
    const raw = comment?.sourceUserName || comment?.commentName || "User";

    if (raw.includes("@")) {
      return raw.split("@")[0];
    }

    return raw;
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
          ticketId: ticket.sourceId,
          comment: editingComment.text,
          commentName: loggedInUser?.email || "User",
        });
        if (res.success) {
          setSuccessMessage("Comment updated successfully");
          setTimeout(() => setSuccessMessage(""), 2500);
          setEditingComment(null);
          setRefreshComments((prev) => prev + 1);
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
          sourceId: ticket.sourceId,
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
        setRefreshComments((prev) => prev + 1);
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
     {(successMessage || errorMessage) && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-fadeIn">

    <div className="w-full max-w-xs sm:max-w-sm bg-white dark:bg-gray-900 rounded-xl shadow-xl p-5 text-center animate-scaleIn border border-gray-200 dark:border-gray-700">

      {/* Icon */}
      <div className="flex justify-center mb-3">
        <div
          className={`p-2.5 rounded-full ${
            successMessage
              ? "bg-green-50 dark:bg-green-500/10"
              : "bg-red-50 dark:bg-red-500/10"
          }`}
        >
          {successMessage ? (
            <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <X className="w-5 h-5 text-red-600 dark:text-red-400" />
          )}
        </div>
      </div>

      {/* Title */}
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
        {successMessage ? "Success" : "Error"}
      </h2>

      {/* Message */}
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
        {successMessage || errorMessage}
      </p>

      {/* Button */}
      <button
        onClick={() => {
          setSuccessMessage("");
          setErrorMessage("");
        }}
        className={`w-full py-2 rounded-lg text-sm font-medium transition ${
          successMessage
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-red-600 hover:bg-red-700 text-white"
        }`}
      >
        Close
      </button>

    </div>
  </div>
)}

      <div
        className="w-full max-w-xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center px-5 py-3 border-b bg-gray-50 dark:bg-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Ticket Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-300"
          >
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
                  <p>
                    <b>Title:</b> {ticketData.title}
                  </p>
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
                <p>
                  <b>customer:</b> {ticketData.customer || "-"}
                </p>
                <p>
                  <b>Description:</b> {ticketData.description}
                </p>
                <p>
                  <b>Priority:</b> {ticketData.priority}
                </p>
                <p>
                  <b>Assigned To:</b> {ticketData.assignedToEmp || "-"}
                </p>
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
                            : `data:image/png;base64,${ticketData.imageData}`,
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
                  <p className="text-sm text-gray-400 text-center">
                    No comments
                  </p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((c) => {
                      const name = getDisplayName(c);
                      const initial = name.charAt(0).toUpperCase();
                      const commentOwner =
                        c.sourceUserName?.toLowerCase() ||
                        c.commentName?.toLowerCase();
                      const isOwnMessage = commentOwner === currentUserEmail;
                      const canEditOrDelete = commentOwner === currentUserEmail;

                      return (
                        <div
                          key={c.id}
                          className={`flex gap-3 items-start ${isOwnMessage ? "justify-end" : "justify-start"
                            }`}
                        >
                          {!isOwnMessage && (
                            <div className="w-8 h-8 rounded-full bg-blue-500 dark:bg-blue-600 text-white flex items-center justify-center text-sm">
                              {initial}
                            </div>
                          )}

                          <div
                            className={`max-w-[75%] rounded-2xl px-3 py-2 relative ${isOwnMessage
                                ? "bg-blue-500 text-white dark:bg-blue-600"
                                : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                              } ${isOwnMessage ? "ml-auto" : "mr-auto"}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p
                                className={`text-sm font-medium ${isOwnMessage
                                    ? "text-white"
                                    : "text-gray-900 dark:text-gray-100"
                                  }`}
                              >
                                {name}
                              </p>
                              <div className="flex items-center gap-2">
                                {/* TIME AGO */}
                                <span
                                  className={`text-xs ${isOwnMessage
                                      ? "text-blue-100"
                                      : "text-gray-500 dark:text-gray-400"
                                    }`}
                                >
                                  {timeAgo(c.createdAt)}
                                </span>

                                {/* ACTION BUTTONS */}
                                {canEditOrDelete &&
                                  editingComment?.id !== c.id && (
                                    <div className="relative comment-menu">
  <button
    onClick={() => toggleMenu(c.id)}
    className={`p-1 rounded-full ${
      isOwnMessage
        ? "hover:bg-blue-400/30 text-white"
        : "hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
    }`}
  >
    ⋮
  </button>

  {activeMenu === c.id && (
    <div
      className={`absolute top-7 ${
        isOwnMessage ? "right-0" : "left-0"
      } bg-white dark:bg-gray-800 
      border border-gray-200 dark:border-gray-700 
      rounded-lg shadow-lg z-10 min-w-[130px] overflow-hidden`}
    >
      {/* EDIT */}
      <button
        onClick={() => {
          handleEditComment(c);
          setActiveMenu(null);
        }}
        className="w-full text-left px-4 py-2 text-sm 
        text-gray-700 dark:text-gray-200 
        hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        Edit
      </button>

      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* DELETE */}
      <button
        onClick={() => {
          handleDeleteComment(c.id);
          setActiveMenu(null);
        }}
        className="w-full text-left px-4 py-2 text-sm 
        text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        Delete
      </button>
    </div>
  )}
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
                                    setEditingComment((prev) => ({
                                      ...prev,
                                      text: e.target.value,
                                    }))
                                  }
                                  rows={2}
                                  autoFocus
                                  placeholder="Edit..."
                                />

                                {/* ACTION ICONS */}
                                <div className="flex items-center gap-1 mt-1">
                                  <button
                                    onClick={handleAddOrUpdateComment}
                                    className="flex items-center gap-1 px-2 py-1 text-xs rounded-full
bg-green-500 text-white
hover:bg-green-600
dark:bg-green-600 dark:hover:bg-green-400
transition"
                                  >
                                    Save
                                  </button>

                                  <button
                                    onClick={() => setEditingComment(null)}
                                    className="flex items-center gap-1 px-2 py-1 text-xs rounded-full
bg-red-500 text-white
hover:bg-red-600
dark:bg-red-600 dark:hover:bg-red-700
transition"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p
                                className={`text-sm mt-1 ${isOwnMessage
                                    ? "text-white"
                                    : "text-gray-700 dark:text-gray-300"
                                  }`}
                              >
                                {c.comment}
                              </p>
                            )}

                            {c.ticketCommentImageVO?.map((img) => (
                              <div
                                key={img.id}
                                className="relative w-32 h-32 mt-2 rounded overflow-hidden"
                              >
                                <img
                                  src={img.commentImage}
                                  alt="comment-img"
                                  className="w-32 h-32 object-cover rounded cursor-pointer hover:opacity-80"
                                  onClick={() =>
                                    setPreviewImage(img.commentImage)
                                  }
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
                          {isOwnMessage && (
                            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
                              {initial}
                            </div>
                          )}
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
                <div className="flex justify-center items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 ">
                  <textarea
                    className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
