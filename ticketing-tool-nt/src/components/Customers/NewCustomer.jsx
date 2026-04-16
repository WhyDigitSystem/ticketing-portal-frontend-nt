import React, { useState } from "react";
import { ArrowLeft, Save, X, UserPlus, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { customerAPI } from "../../api/customerAPI";
import { encryptPassword } from "../../utils/PasswordEnc";

const NewCustomer = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    userName: "",
    email: "",
    company: "",
  });

  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFormData({
      firstName: "",
      userName: "",
      email: "",
      company: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { firstName, userName, email, company } = formData;

    if (!firstName || !userName || !email || !company) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const payload = {
        active:true,
        firstName,
        userName,
        email,
        company,
        type: "Customer",
        password: encryptPassword("Wds@2022"), // hidden default password
      };

      const res = await customerAPI.createCustomer(payload);

      if (res?.statusFlag === "Ok" || res?.status === true) {
        setSuccessMessage(`Customer "${firstName}" created successfully!`);
        handleClear();

        setTimeout(() => {
          setSuccessMessage("");
          navigate("/allcustomers");
        }, 2000);
      } else {
        alert(
          res?.paramObjectsMap?.errorMessage || "Failed to create customer"
        );
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="px-6 py-6 animate-fadeIn">
      {/* Success Popup */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded shadow-md flex items-center gap-2 animate-fadeIn z-50">
          <Check className="w-5 h-5 bg-white text-green-500 rounded-full p-1" />
          <span className="font-medium text-sm">{successMessage}</span>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => navigate("/menu/customer")}
        className="group inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-3 transition-all duration-200"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">
          Back to Customer Management
        </span>
      </button>

      {/* Header */}
      <div className="relative mb-6 overflow-hidden rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-green-500/10 to-teal-500/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-md">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                New Customer
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Create and add a new customer
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
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700"
            >
              <Save size={16} /> Save
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex animate-slideUp">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <Input
            label="Customer Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />

          <Input
            label="Username"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
          />

          <Input
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
          />

          <Input
            label="Company"
            name="company"
            value={formData.company}
            onChange={handleChange}
          />
        </form>
      </div>
    </div>
  );
};

// Reusable Input
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

export default NewCustomer;