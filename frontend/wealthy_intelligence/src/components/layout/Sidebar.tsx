import { Link, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  Briefcase,
  TrendingUp,
  Landmark,
  ArrowLeftRight,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const investorMenus = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/investor/dashboard",
    },
    {
      name: "Portfolio",
      icon: <Briefcase size={20} />,
      path: "/investor/portfolio",
    },
    {
      name: "Stocks",
      icon: <TrendingUp size={20} />,
      path: "/investor/stocks",
    },
    {
      name: "Mutual Funds",
      icon: <Landmark size={20} />,
      path: "/investor/mutual-funds",
    },
    {
      name: "Transactions",
      icon: <ArrowLeftRight size={20} />,
      path: "/investor/transactions",
    },
  ];

  return (
    <div className="w-72 min-h-screen bg-slate-950 text-white p-6 flex flex-col">
      <h1 className="text-3xl font-bold mb-10">WealthAI</h1>

      <div className="mb-10 border-b border-slate-700 pb-5">
        <p className="font-semibold text-lg">{user?.email}</p>
        <p className="text-sm text-gray-400">{user?.role_name}</p>
      </div>

      <nav className="flex flex-col gap-3">
        {user?.role_name === "INVESTOR" &&
          investorMenus.map((menu) => (
            <Link
              key={menu.path}
              to={menu.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                location.pathname.startsWith(menu.path)
                  ? "bg-green-600"
                  : "hover:bg-slate-800"
              }`}
            >
              {menu.icon}
              {menu.name}
            </Link>
          ))}
      </nav>
    </div>
  );
};

export default Sidebar;
