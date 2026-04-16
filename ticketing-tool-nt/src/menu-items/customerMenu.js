import {
  List,
  SquareUser,
  Edit,
   UserPlus,
} from "lucide-react";

const customerMenu = {
  title: "Customer Management",
  description: "Manage customers, interactions, and relationships",
  icon: SquareUser,
  gradient: "bg-gradient-to-br from-violet-600 to-indigo-500",

  items: [

    {
      name: "Create Customer",
      path: "/newcustomer",
      icon: UserPlus,
      color: "blue"
    },

    {
      name: "All Customers",
      path: "/allcustomers",
      icon: List,
      color: "bule"
    },
    
    {
      name: "Update Customers",
      path: "/editCustomer",
      icon: Edit,
      color: "blue"
    }
  ]
};

export default customerMenu;