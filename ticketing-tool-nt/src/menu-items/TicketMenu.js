import {
  PlusCircle,
  List,
} from "lucide-react";

const ticketMenu = {
  title: "Ticket Management",
  description: "Create and manage ticket details before submission",
  icon: PlusCircle,
  gradient: "from-orange-500 to-amber-600",

  items: [
    {
      name: "Create Ticket",
      path: "/newticket",
      icon: PlusCircle,
      color: "green",
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