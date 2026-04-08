import React, { useState } from "react";
import { Save, X, Ticket, Check } from "lucide-react";
import { ticketAPI } from "../../api/ticketAPI";

const NewTicket = () => {
  const [formData, setFormData] = useState({
    title: "",
    priority: "",
    description: "",
    file: null,
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const username = sessionStorage.getItem("username") || "User";
  const email = sessionStorage.getItem("email") || "user@mail.com";
  const client = sessionStorage.getItem("client") || "Client";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      file: e.target.files[0],
    }));
  };

  const handleClear = () => {
    setFormData({
      title: "",
      priority: "",
      description: "",
      file: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.priority || !formData.description) {
      alert("Fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        client,
        createdBy: username,
        modifiedBy: username,
        email,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
      };

      const createRes = await ticketAPI.createTicket(payload);

      if (!createRes) {
        alert("Ticket creation failed");
        return;
      }

      const ticketId =
        createRes?.paramObjectsMap?.ticketVO?.id;

      if (!ticketId) {
        alert("Ticket created but ID missing");
        return;
      }

      if (formData.file) {
        const uploadRes = await ticketAPI.uploadTicketFile(
          ticketId,
          formData.file
        );

        if (!uploadRes) {
          alert("File upload failed");
          return;
        }
      }

      setSuccessMessage(`Ticket "${formData.title}" created successfully!`);
      handleClear();

      setTimeout(() => {
        setSuccessMessage("");
      }, 2000);

    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 py-6 animate-fadeIn">

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded shadow-md flex items-center gap-2 animate-fadeIn z-50">
          <Check className="w-5 h-5 bg-white text-green-500 rounded-full p-1" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="relative mb-6 overflow-hidden rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4">

        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-green-500/10 to-teal-500/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-3">

          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
              <Ticket className="h-6 w-6 text-white" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                New Ticket
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Create a support ticket
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border hover:bg-gray-100"
            >
              <X size={16} /> Clear
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              <Save size={16} />
              {loading ? "Submitting..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="flex  animate-slideUp">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 space-y-5"
        >
          <Input label="Title" name="title" value={formData.title} onChange={handleChange} />

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select Priority</option>
              <option value="Low">Normal</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Attachment
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full text-sm"
            />
          </div>

        </form>
      </div>
    </div>
  );
};

const Input = ({ label, name, value, onChange, type = "text" }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
    />
  </div>
);

/* Animations */
const styles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn { animation: fadeIn 0.4s ease-out; }
.animate-slideUp { animation: slideUp 0.4s ease-out forwards; opacity: 0; }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default NewTicket;