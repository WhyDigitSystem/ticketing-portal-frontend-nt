import {
  PlusCircle,
  List,
  Tag,
} from "lucide-react";

const ticketMenu = {
  title: "Ticket Management",
  description: "Create and manage ticket details before submission",
  icon: 
  Tag,
  gradient: "from-cyan-600 to-blue-700",

  items: [
    {
      name: "Create Ticket",
      path: "/newticket",
      icon: PlusCircle,
      color: "blue",
      roles: ["admin","customer"] // only admin can see
    },
    {
      name: "All Tickets List",
      path: "/alltickets",
      icon: List,
      color: "blue",
      roles: ["admin", "employee","customer"] 
    }
  ]
};

export default ticketMenu;