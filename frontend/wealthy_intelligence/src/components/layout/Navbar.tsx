import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { LogOut, User as UserIcon, Shield } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const profilePath = user?.role_name === "ADMIN" ? "/admin/profile" : "/investor/profile";

  return (
    <div className="h-16 bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/80 flex items-center justify-between px-6 md:px-8 relative z-20">
      
      {/* LEFT: System title */}
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-indigo-400 animate-pulse" />
        <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Wealth Intelligence Platform
        </h1>
      </div>

      {/* RIGHT: User Profile & Logout */}
      <div className="flex items-center gap-6">
        
        {/* PROFILE CARD */}
        <Link to={profilePath} className="flex items-center gap-3 bg-slate-800/35 hover:bg-slate-800/60 border border-slate-800/70 py-1.5 pl-3.5 pr-1.5 rounded-xl transition cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="font-extrabold text-xs text-slate-100">{user?.email}</p>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mt-0.5">{user?.role_name}</p>
          </div>

          {/* PROFILE AVATAR */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-650/15">
            {user?.email ? user.email.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>
        </Link>

        {/* LOGOUT BUTTON */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 bg-red-650/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/15 hover:border-red-500 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/5 hover:scale-[1.02]"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
