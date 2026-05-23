import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";
import { AxiosError } from "axios";

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

      console.log("API RESPONSE:", response.data);

      const { user, profile, token } = response.data;

      // SAVE TOKEN IN LOCAL STORAGE
      localStorage.setItem("token", token);

      console.log("TOKEN SAVED:", token);

      login(user, profile, token);

      if (user.role_name === "ADMIN") {
        console.log("USER ROLE:", user.role_name);
        navigate("/admin/dashboard");
      } else {
        navigate("/investor/dashboard");
      }
    } catch (error) {
      console.log(error);

      const err = error as AxiosError<any>;
      const message = err.response?.data?.message;

      setErrorMessage(message || "Login failed");
    } finally {
      setLoading(false);
    } 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6] p-4 font-sans selection:bg-slate-800 selection:text-white">
      <div className="flex w-full max-w-[1000px] min-h-[600px] bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Left Side: Cinematic Branding Panel */}
        <div className="hidden md:flex flex-col justify-between w-1/2 bg-[#0B131F] p-10 relative overflow-hidden text-white border-r border-slate-800">
          {/* Subtle Dark Dashboard Background Overlay */}
          <div
            className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600')`,
            }}
          />

          {/* Header/Logo */}
          <div className="relative z-10 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-slate-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span className="font-semibold text-lg tracking-wide">
              WealthMatrix
            </span>
          </div>

          {/* Main Hook */}
          <div className="relative z-10 max-w-sm space-y-4 my-auto">
            <h1 className="text-3xl font-bold tracking-tight leading-tight text-slate-100">
              Unified Intelligence for Private Wealth.
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Access your global portfolio, alternative investments, and
              real-time analytics in one secure interface.
            </p>
          </div>

          {/* Bottom Metrics Grid */}
          <div className="relative z-10 grid grid-cols-3 gap-4 border-t border-slate-800/60 pt-6">
            <div>
              <div className="text-lg font-bold text-slate-100">12.4%</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mt-0.5">
                Avg. Yield
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-100">$2.4B+</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mt-0.5">
                Assets Managed
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-100">AAA</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mt-0.5">
                Security Rating
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Login Panel */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-slate-500 mt-1 mb-8">
              Please enter your credentials to access your portal.
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium flex items-center gap-2">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 tracking-wide">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    placeholder="name@wealthmatrix.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-slate-800 transition pr-10 text-slate-900 placeholder:text-slate-400"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <span className="text-sm">@</span>
                  </div>
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-700 tracking-wide">
                    Password
                  </label>
                  <a
                    href="#forgot"
                    className="text-xs text-slate-500 hover:text-slate-800 hover:underline transition"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password_hash"
                    placeholder="••••••••"
                    value={formData.password_hash}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-slate-800 transition pr-10 text-slate-900 placeholder:text-slate-400 tracking-widest font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me Option */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-slate-300 accent-slate-950 focus:ring-0 cursor-pointer"
                />
                <label
                  htmlFor="remember"
                  className="text-xs text-slate-600 cursor-pointer select-none"
                >
                  Remember me for 30 days
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-950 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-slate-800 transition flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none mt-2"
              >
                <span>{loading ? "SIGNING IN..." : "SIGN IN"}</span>
                {!loading && (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                )}
              </button>
            </form>

           
            {/* Create Account footer */}
            <div className="text-center mt-8">
              <p className="text-xs text-slate-500">
                New to WealthMatrix?{" "}
                <a
                  href="/register"
                  className="text-slate-800 font-semibold underline underline-offset-2 hover:text-black transition"
                >
                  Create an account
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
