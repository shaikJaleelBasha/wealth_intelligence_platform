import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";
import { AxiosError } from "axios";
import { Shield, Mail, Lock, Eye, EyeOff, Loader2, Sparkles, AlertCircle } from "lucide-react";

interface FormData {
  email: string;
  password_hash: string;
}

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password_hash: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const response = await authApi.post("/api/auth/login", formData);
      const { user, profile, token } = response.data;

      localStorage.setItem("token", token);
      login(user, profile, token);

      if (user.role_name === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/investor/dashboard");
      }
    } catch (error) {
      console.error(error);
      const err = error as AxiosError<any>;
      const message = err.response?.data?.message;
      setErrorMessage(message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    } 
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans relative overflow-hidden selection:bg-indigo-500/30 selection:text-white">
      {/* Decorative Aura Glow Backgrounds */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-violet-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="flex w-full max-w-[1000px] min-h-[600px] bg-slate-900/30 backdrop-blur-xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl z-10">
        
        {/* Left Side: Cinematic Branding Panel */}
        <div className="hidden md:flex flex-col justify-between w-1/2 bg-slate-950 p-12 relative overflow-hidden text-white border-r border-slate-800/60">
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-35" />
          
          {/* Brand Header */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-650/15 animate-pulse">
              <Shield className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              WealthAI
            </span>
          </div>

          {/* Main Slogan Hook */}
          <div className="relative z-10 max-w-sm space-y-4 my-auto">
            <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-semibold">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              <span>Premium Private Wealth Terminal</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight text-white">
              Unified Wealth Intelligence.
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Consolidate your global stock portfolios, systematic investment plans (SIP), alternative assets, and gateway diagnostics into a secure private workspace.
            </p>
          </div>

          {/* Bottom stats details */}
          <div className="relative z-10 grid grid-cols-3 gap-4 border-t border-slate-850 pt-6">
            <div>
              <div className="text-lg font-black text-slate-100">12.4%</div>
              <div className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold mt-0.5">
                Avg. Yield
              </div>
            </div>
            <div>
              <div className="text-lg font-black text-slate-100">$2.4B+</div>
              <div className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold mt-0.5">
                AUM Volume
              </div>
            </div>
            <div>
              <div className="text-lg font-black text-slate-100">ISO-27k</div>
              <div className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold mt-0.5">
                Secured
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Login Panel */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-slate-900/40">
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-3xl font-black text-white tracking-tight">
              Welcome back
            </h2>
            <p className="text-xs text-slate-400 mt-2 mb-8">
              Authenticate your identity to access your private wealth cabinet.
            </p>

            {/* Error Message banner */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-semibold flex items-center gap-2.5">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Interactive Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Registered Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@wealthai.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-2.5 text-xs bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-white placeholder:text-slate-600 transition font-medium"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Cabinet Password
                  </label>
                  <a
                    href="#forgot"
                    className="text-[10px] text-slate-500 hover:text-indigo-400 font-semibold transition"
                  >
                    Forgot key?
                  </a>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password_hash"
                    placeholder="••••••••••••"
                    value={formData.password_hash}
                    onChange={handleChange}
                    className="w-full pl-11 pr-11 py-2.5 text-xs bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-white placeholder:text-slate-650 transition font-bold tracking-widest font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-slate-800 bg-slate-950 focus:ring-0 accent-indigo-650 cursor-pointer"
                />
                <label
                  htmlFor="remember"
                  className="text-xs text-slate-400 cursor-pointer select-none"
                >
                  Authorize token for 30 days
                </label>
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-650/15 transition-all hover:scale-[1.01] text-xs flex items-center justify-center gap-1.5 disabled:opacity-75"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Opening Cabinet...
                  </>
                ) : (
                  <>
                    <span>Decrypt & Sign In</span>
                  </>
                )}
              </button>
            </form>

            {/* Create Account footer */}
            <div className="text-center mt-10">
              <p className="text-xs text-slate-500">
                New user listing?{" "}
                <a
                  href="/register"
                  className="text-indigo-400 font-bold underline underline-offset-2 hover:text-indigo-300 transition"
                >
                  Create credentials
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
