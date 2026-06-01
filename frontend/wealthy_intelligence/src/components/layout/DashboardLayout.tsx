import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* SIDEBAR */}
      <Sidebar />

      {/* RIGHT SECTION */}
      <div className="flex flex-col flex-1 relative overflow-hidden">
        
        {/* Glowing aura effect behind layout content */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none z-0" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/5 blur-[100px] rounded-full pointer-events-none z-0" />

        {/* NAVBAR */}
        <Navbar />

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative z-10 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
