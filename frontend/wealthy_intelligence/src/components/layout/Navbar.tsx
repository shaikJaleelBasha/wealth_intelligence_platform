import { useAuth } from "../../hooks/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="h-16 bg-white shadow flex items-center justify-between px-6">
      {/* LEFT */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Wealth Management System
        </h1>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {/* PROFILE */}
        <div className="text-right">
          <p className="font-semibold text-slate-700">{user?.email}</p>

          <p className="text-sm text-gray-500 capitalize">{user?.role_name}</p>
        </div>

        {/* PROFILE IMAGE */}
        <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">
          {user?.email?.charAt(0).toUpperCase()}
        </div>

        {/* LOGOUT */}
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
