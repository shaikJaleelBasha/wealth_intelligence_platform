import { Link } from "react-router-dom";
import {useAuth} from '../../hooks/useAuth'

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <div className="w-64 h-screen bg-slate-900 text-white p-5">
      <h1 className="text-2xl font-bold mb-10">Wealth System</h1>

      <div className="mb-10">
        <p className="font-semibold">{user?.email}</p>
        <p className="text-sm text-gray-400 capitalize">{user?.role_name}</p>
      </div>

      <nav className="flex flex-col gap-4">
        {user?.role_name === "ADMIN" && (
          <>
            <Link to="/admin/dashboard">Dashboard</Link>
            <Link to="/admin/investors">Investors</Link>
            <Link to="/admin/stocks">Stocks</Link>
          </>
        )}

        {user?.role_name === "INVESTOR" && (
          <>
            <Link to="/investor/dashboard">Dashboard</Link>
            <Link to="/investor/portfolio">Portfolio</Link>
            <Link to="/investor/stocks">Stocks</Link>
          </>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
