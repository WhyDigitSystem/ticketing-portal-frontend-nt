import React, { useState } from "react";
import { ArrowLeft, Save, X, PlusCircle, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { employeeAPI } from "../../api/employeeAPI";
import { encryptPassword } from "../../utils/PasswordEnc";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const NewEmployee = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employee: "",
    code: "",
    email: "",
    department: "",
    branch: "",
    designation: "",
    dob: null,
    doj: null,
    gender: "",
  });

  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
  };

  const handleClear = () => {
    setFormData({
      employee: "",
      code: "",
      email: "",
      department: "",
      branch: "",
      designation: "",
      dob: null,
      doj: null,
      gender: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      employee,
      code,
      email,
      department,
      branch,
      designation,
      dob,
      doj,
      gender,
    } = formData;

    if (
      !employee ||
      !code ||
      !email ||
      !department ||
      !branch ||
      !designation ||
      !dob ||
      !doj ||
      !gender
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const payload = {
        active: true,
        branch,
        code,
        createdBy: "admin",
        department,
        designation,
        dob,
        doj,
        email,
        employee,
        gender,
        password: encryptPassword("Wds@2022"),
      };

      const res = await employeeAPI.createEmployee(payload);

      if (res.success) {
        setSuccessMessage(`Employee "${employee}" created successfully!`);
        handleClear();

        setTimeout(() => {
          setSuccessMessage("");
          navigate("/allemployees");
        }, 2000);
      } else {
        alert(res.error || "Failed to create employee");
      }
    } catch (err) {
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
        onClick={() => navigate("/menu/employee")}
        className="group inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-3 transition-all duration-200"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">Back to Employee Management</span>
      </button>

      {/* Header */}
      <div className="relative mb-6 overflow-hidden rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-green-500/10 to-teal-500/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-3">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-md">
              <PlusCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                New Employee
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Create and add a new employee
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

      {/* Form Grid */}
      <div className="flex animate-slideUp">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Input
            label="Employee"
            name="employee"
            value={formData.employee}
            onChange={handleChange}
          />
          <Input
            label="Code"
            name="code"
            value={formData.code}
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
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
          />
          <Input
            label="Branch"
            name="branch"
            value={formData.branch}
            onChange={handleChange}
          />
          <Input
            label="Designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
          />

          {/* DatePickers */}
          <DatePickerInput
            label="DOB"
            selected={formData.dob}
            onChange={(date) => handleDateChange("dob", date)}
          />
          <DatePickerInput
            label="DOJ"
            selected={formData.doj}
            onChange={(date) => handleDateChange("doj", date)}
          />

          {/* Gender */}
          <div className="col-span-1 lg:col-span-4">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </form>
      </div>
    </div>
  );
};

// Text Input Component
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

// DatePicker Input with fast month/year navigation
const DatePickerInput = ({ label, selected, onChange }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
      {label}
    </label>
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

export default NewEmployee;