import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import api from "../../api/axios";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Shield, Sparkles, Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2, User, Phone, Calendar, Landmark, TrendingUp } from "lucide-react";

interface FormData {
  email: string;
  password: string;
  role_name: string;
  first_name: string;
  last_name: string;
  phone: string;
  dob: string;
  pan_number: string;
}

const Register = () => {
  const navigate = useNavigate(); 
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    role_name: "investor", // default value
    first_name: "",
    last_name: "",
    phone: "",
    dob: "",
    pan_number: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.post("/api/auth/register", formData);
      setSuccessMsg("Onboarding Registration Successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMsg(error.response?.data?.message || "Registration Failed. Check fields.");
      } else {
        setErrorMsg("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between font-sans selection:bg-indigo-500/30 selection:text-white text-slate-100 relative overflow-hidden">
      {/* Glow backgrounds */}
      <div className="absolute top-[-150px] right-[-100px] w-[600px] h-[600px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-150px] left-[-100px] w-[600px] h-[600px] bg-violet-600/10 blur-[130px] rounded-full pointer-events-none z-0" />

      {/* Global Header */}
      <header className="w-full bg-slate-900/40 backdrop-blur-md px-6 py-4 md:px-12 flex justify-between items-center border-b border-slate-900/60 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg">
            <Shield className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            WealthAI
          </span>
        </div>
        <div className="text-xs md:text-sm text-slate-400">
          Already have credentials?{" "}
          <a
            href="/login"
            className="text-indigo-400 font-extrabold hover:text-indigo-300 transition hover:underline"
          >
            Sign In
          </a>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-grow flex items-center justify-center p-4 md:p-8 z-10">
        <div className="flex w-full max-w-[1120px] min-h-[640px] bg-slate-900/30 backdrop-blur-xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Left Panel: Feature Highlights */}
          <div className="hidden lg:flex flex-col justify-between w-[40%] bg-slate-950 p-8 text-white relative border-r border-slate-800/60">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-25" />
            
            <div className="space-y-6 z-10 relative">
              <div className="space-y-2 pl-2">
                <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-semibold mb-1">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>Onboarding Portal</span>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Unified Intelligence.
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                  Empowering private and corporate investors with unified market access and institutional-grade analytics.
                </p>
              </div>

              {/* Feature 1 */}
              <div className="flex items-start gap-4 p-3 bg-slate-900/40 rounded-2xl border border-slate-800/50">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">
                    Real-time Market Analytics
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    Stream market data points, historical NAV points, and live transaction execution values with millisecond response latency.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-4 p-3 bg-slate-900/40 rounded-2xl border border-slate-800/50">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">
                    Secure Cryptographic Cabinet
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    Industry-grade secure JWT encryption and password hashes to protect private wealth indices.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-4 p-3 bg-slate-900/40 rounded-2xl border border-slate-800/50">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">
                    SIP & Alternate Markets Access
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    Unlock private equity networks, alternate index markets, and systematic SIP allocations in one consolidated portfolio.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Registration Form */}
          <div className="w-full lg:w-[60%] p-6 sm:p-10 md:p-12 overflow-y-auto flex items-center bg-slate-900/40">
            <div className="w-full max-w-xl mx-auto space-y-6">
              <div>
                <span className="inline-block px-2.5 py-0.5 text-[9px] font-bold bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20 uppercase tracking-wider mb-2">
                  {formData.role_name} Registration Mode
                </span>
                <h1 className="text-3xl font-black text-white tracking-tight">
                  Create Credentials
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Submit the onboarding form below to list your portfolio in the secure registry.
                </p>
              </div>

              {successMsg && (
                <div className="flex items-center gap-3 bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 p-4 rounded-2xl text-xs animate-pulse font-semibold">
                  <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="flex items-center gap-3 bg-red-500/10 text-red-450 border border-red-500/20 p-4 rounded-2xl text-xs font-semibold">
                  <Shield className="w-4.5 h-4.5 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* First Name & Last Name Group */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      First Name
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                        <User className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="text"
                        name="first_name"
                        placeholder="John"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-white font-medium"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Last Name
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                        <User className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="text"
                        name="last_name"
                        placeholder="Doe"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-white font-medium"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Onboarding Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                      <Mail className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="email"
                      name="email"
                      placeholder="name@wealthai.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-white font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Mobile Phone & PAN Number Group */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Mobile Phone
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                        <Phone className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="text"
                        name="phone"
                        placeholder="+91 99999 99999"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-white font-medium"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      PAN Identifier
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                        <Shield className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="text"
                        name="pan_number"
                        placeholder="ABCDE1234F"
                        value={formData.pan_number}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-white uppercase font-bold"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Date of Birth & Password Group */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                        <Calendar className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-white cursor-pointer font-medium"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Secure Access Password
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="••••••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-9 pr-10 py-2 text-xs bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-white font-bold tracking-widest font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 transition"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Role Switcher */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Onboarding Platform Role
                  </label>
                  <select
                    name="role_name"
                    value={formData.role_name}
                    onChange={handleChange}
                    className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 cursor-pointer capitalize outline-none"
                  >
                    <option value="investor">Investor</option>
                    <option value="admin">Admin</option>
                    <option value="support">Support</option>
                  </select>
                </div>

                {/* Terms checkbox */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="mt-0.5 w-4 h-4 rounded border-slate-800 bg-slate-950 focus:ring-0 accent-indigo-650 cursor-pointer"
                  />
                  <label
                    htmlFor="terms"
                    className="text-[10px] text-slate-500 leading-normal select-none cursor-pointer"
                  >
                    I agree to the <span className="text-indigo-400 font-bold hover:underline">Terms of Service</span> and <span className="text-indigo-400 font-bold hover:underline">Privacy Policy</span>. I understand that WealthAI maintains strict compliance with financial auditing regulations.
                  </label>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-650/15 transition-all hover:scale-[1.01] text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 mt-4 disabled:opacity-75"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Registering Credentials...
                    </>
                  ) : (
                    <span>Register Account</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Global Footer */}
      <footer className="w-full bg-slate-950 border-t border-slate-900/60 px-6 py-4 md:px-12 flex flex-col sm:flex-row gap-2 justify-between items-center text-[10px] text-slate-500 z-10">
        <div>© 2026 WealthAI Institutional private wealth. All rights reserved.</div>
        <div className="flex gap-4 font-bold text-slate-450">
          <a href="#security" className="hover:text-white transition">Security Compliance</a>
          <a href="#compliance" className="hover:text-white transition">Regulatory Disclosures</a>
          <a href="#help" className="hover:text-white transition">Help Desk</a>
        </div>
      </footer>
    </div>
  );
};

export default Register;
