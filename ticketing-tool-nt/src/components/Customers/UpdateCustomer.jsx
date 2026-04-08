import React, { useState } from "react";
import { ArrowLeft, Save, X, User, Search, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { customerAPI } from "../../api/customerAPI";
import { encryptPassword } from "../../utils/PasswordEnc";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const UpdateCustomer = () => {
  const navigate = useNavigate();

  const [emailSearch, setEmailSearch] = useState("");
  const [userId, setUserId] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    userName: "",
    password: "",
    company: "",
    type: "Customer",
    active: true,
    dob: null, // example date field
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
  };

  const handleSearch = async () => {
    if (!emailSearch) {
      alert("Enter customer email");
      return;
    }
    try {
      const customers = await customerAPI.getAllCustomers();
      const user = customers.find(
        (c) => c.email?.toLowerCase() === emailSearch.toLowerCase()
      );
      if (!user) {
        alert("Customer not found");
        return;
      }
      const extractedId = user.id || user.userId || user.user_id;
      if (!extractedId) {
        alert("User ID not found in response");
        return;
      }
      setUserId(extractedId);
      setFormData({
        firstName: user.firstName || "",
        email: user.email || "",
        userName: user.userName || "",
        password: "",
        company: user.company || "",
        type: user.type || "Customer",
        active: user.active ?? true,
        dob: user.dob ? new Date(user.dob) : null,
      });
      setIsLoaded(true);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch customer");
    }
  };

  const handleClear = () => {
    setEmailSearch("");
    setUserId(null);
    setIsLoaded(false);
    setFormData({
      firstName: "",
      email: "",
      userName: "",
      password: "",
      company: "",
      type: "Customer",
      active: true,
      dob: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert("No customer selected");
      return;
    }
    try {
      const payload = {
        firstName: formData.firstName,
        email: formData.email,
        userName: formData.userName,
        company: formData.company,
        type: formData.type,
        active: formData.active,
        ...(formData.password && { password: encryptPassword(formData.password) }),
        dob: formData.dob,
      };
      const success = await customerAPI.updateCustomer({ userId, payload });
      if (success) {
        setSuccessMessage(`Customer "${formData.firstName}" updated successfully!`);
        setTimeout(() => {
          setSuccessMessage("");
          navigate("/allcustomers");
        }, 2000);
      } else {
        alert("Update failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="px-6 py-6 animate-fadeIn bg-white dark:bg-gray-900 min-h-screen">
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded shadow-md flex items-center gap-2 z-50 animate-slideUp">
          <Check className="w-5 h-5 bg-white text-green-500 rounded-full p-1" />
          <span className="font-medium text-sm">{successMessage}</span>
        </div>
      )}

      <button
        onClick={() => navigate("/menu/customer")}
        className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mb-3 animate-slideUp"
      >
        <ArrowLeft size={14} />
        <span className="text-xs">Back to Customer Management</span>
      </button>

      <div className="mb-6 p-4 rounded-xl bg-gray-100 dark:bg-gray-800 flex justify-between items-center animate-slideUp">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500 rounded-lg text-white">
            <User size={18} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Update Customer</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Search and update customer details</p>
          </div>
        </div>

        <button
          onClick={handleClear}
          className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 animate-slideUp"
        >
          <X size={14} /> Clear
        </button>
      </div>

      {!isLoaded && (
        <div className="flex animate-slideUp">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-300 dark:border-gray-700 space-y-4">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Enter Customer Email</h2>
            <input
              type="email"
              value={emailSearch}
              onChange={(e) => setEmailSearch(e.target.value)}
              placeholder="Enter Email"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={handleSearch}
              className="w-full bg-blue-600 text-white py-2 rounded-lg flex justify-center items-center gap-2 hover:bg-blue-700"
            >
              <Search size={16} /> Fetch Customer
            </button>
          </div>
        </div>
      )}

      {isLoaded && (
        <div className="flex animate-slideUp">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-5xl bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-300 dark:border-gray-700 grid grid-cols-1 lg:grid-cols-4 gap-4"
          >
            {["firstName", "email", "userName", "company", "password"].map((field, index) => (
              <Input
                key={field}
                label={
                  field === "firstName"
                    ? "Name"
                    : field === "userName"
                    ? "Username"
                    : field === "password"
                    ? "Password (optional)"
                    : field.charAt(0).toUpperCase() + field.slice(1)
                }
                name={field}
                value={formData[field]}
                onChange={handleChange}
              />
            ))}

            <DatePickerInput
              label="DOB"
              selected={formData.dob}
              onChange={(date) => handleDateChange("dob", date)}
            />

            <button className="w-full lg:col-span-4 bg-green-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 animate-slideUp">
              <Save size={16} /> Update Customer
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

const Input = ({ label, name, value, onChange }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{label}</label>
    <input
      type={name === "password" ? "password" : "text"}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
    />
  </div>
);

const DatePickerInput = ({ label, selected, onChange }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{label}</label>
    <DatePicker
      selected={selected}
      onChange={onChange}
      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
      dateFormat="dd/MM/yyyy"
      placeholderText="Select date"
      showMonthDropdown
      showYearDropdown
      dropdownMode="select"
    />
  </div>
);

export default UpdateCustomer;