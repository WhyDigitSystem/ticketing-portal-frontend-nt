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
  gradient: "from-cyan-600 to-blue-700",

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