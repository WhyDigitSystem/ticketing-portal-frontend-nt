import {
  Users,
  Edit,
} from "lucide-react";

const customerMenu = {
  title: "Customer Management",
  description: "Manage customers, interactions, and relationships",
  icon: Users,
  gradient: "from-cyan-500 to-blue-600",

  items: [
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
      color: "orange"
    }
  ]
};

export default customerMenu;