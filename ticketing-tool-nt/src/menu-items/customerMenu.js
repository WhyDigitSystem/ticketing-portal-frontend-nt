import {
  Users,
  Edit,
   UserPlus,
} from "lucide-react";

const customerMenu = {
  title: "Customer Management",
  description: "Manage customers, interactions, and relationships",
  icon: Users,
  gradient: "from-cyan-600 to-blue-700",

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
      icon: Users,
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