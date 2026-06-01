import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  TrendingUp,
  Landmark,
  ArrowLeftRight,
  Shield,
  Users,
  Layers,
  Activity
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const investorMenus = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      path: "/investor/dashboard",
    },
    {
      name: "Portfolio",
      icon: <Briefcase size={18} />,
      path: "/investor/portfolio",
    },
    {
      name: "Stocks",
      icon: <TrendingUp size={18} />,
      path: "/investor/stocks",
    },
    {
      name: "Mutual Funds",
      icon: <Landmark size={18} />,
      path: "/investor/mutual-funds",
    },
    {
      name: "Transactions",
      icon: <ArrowLeftRight size={18} />,
      path: "/investor/transactions",
    },
  ];

  const adminMenus = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      path: "/admin/dashboard",
    },
    {
      name: "Manage Stocks",
      icon: <TrendingUp size={18} />,
      path: "/admin/stocks",
    },
    {
      name: "Investors",
      icon: <Users size={18} />,
      path: "/admin/investors",
    },
    {
      name: "Market Prices",
      icon: <Layers size={18} />,
      path: "/admin/market-prices",
    },
    {
      name: "Analytics",
      icon: <Activity size={18} />,
      path: "/admin/analytics",
    },
  ];

  const getActiveStyle = (path: string) => {
    const isActive = location.pathname.startsWith(path);
    return isActive
      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-lg shadow-indigo-650/20 border-l-4 border-indigo-400 pl-3.5"
      : "text-slate-400 hover:text-white hover:bg-slate-800/40 pl-4";
  };

  return (
    <div className="w-72 min-h-screen bg-slate-950 border-r border-slate-900/80 p-6 flex flex-col z-30">
      
      {/* BRAND HEADER */}
      <div className="flex items-center gap-2.5 mb-10 pl-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-650/15">
          <Shield className="w-4.5 h-4.5 text-white" />
        </div>
        <span className="text-xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tight">
          WealthAI
        </span>
      </div>

      {/* USER BRIEF */}
      <div className="mb-8 border-b border-slate-850 pb-5 pl-2">
        <p className="font-extrabold text-slate-200 truncate text-sm" title={user?.email}>
          {user?.email}
        </p>
        <span className="text-[10px] bg-slate-800 text-indigo-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-1.5 inline-block border border-slate-700/30">
          {user?.role_name} Workspace
        </span>
      </div>

      {/* NAVIGATION LINKS */}
      <nav className="flex flex-col gap-2 flex-1">
        {/* Investor Menus */}
        {user?.role_name === "INVESTOR" &&
          investorMenus.map((menu) => (
            <Link
              key={menu.path}
              to={menu.path}
              className={`flex items-center gap-3 py-3 pr-4 rounded-xl transition-all duration-200 ${getActiveStyle(
                menu.path
              )}`}
            >
              <div className="shrink-0">{menu.icon}</div>
              <span className="text-sm">{menu.name}</span>
            </Link>
          ))}

        {/* Admin Menus */}
        {user?.role_name === "ADMIN" &&
          adminMenus.map((menu) => (
            <Link
              key={menu.path}
              to={menu.path}
              className={`flex items-center gap-3 py-3 pr-4 rounded-xl transition-all duration-200 ${getActiveStyle(
                menu.path
              )}`}
            >
              <div className="shrink-0">{menu.icon}</div>
              <span className="text-sm">{menu.name}</span>
            </Link>
          ))}
      </nav>
    </div>
  );
};

export default Sidebar;
