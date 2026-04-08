import {
  Users,
  List,
  UserPlus,
  Edit
} from "lucide-react";

const employeeMenu = {
  title: "Employee Management",
  description: "Manage employees data",
  icon: Users,
  gradient: "from-emerald-500 to-green-600",

  items: [
    {
      name: "Create Employee",
      path: "/newemployee",
      icon: UserPlus,
      color: "green"
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
      color: "orange"
    }
  ]
};

export default employeeMenu;