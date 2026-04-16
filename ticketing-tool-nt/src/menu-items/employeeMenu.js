import {
  IdCardLanyard,
  List,
  UserPlus,
  Edit
} from "lucide-react";

const employeeMenu = {
  title: "Employee Management",
  description: "Manage employees data",
  icon: IdCardLanyard,
  gradient: "bg-gradient-to-br from-emerald-600 to-teal-500",

  items: [
    {
      name: "Create Employee",
      path: "/newemployee",
      icon: UserPlus,
      color: "blue"
    },
    {
      name: "All Employees",
      path: "/allemployees",
      icon: List,
      color: "blue"
    },
    {
      name: "Update Employee",
      path: "/editemployee",
      icon: Edit,
      color: "blue"
    }
  ]
};

export default employeeMenu;