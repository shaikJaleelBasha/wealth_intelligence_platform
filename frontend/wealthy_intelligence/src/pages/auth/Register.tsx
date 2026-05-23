import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import api from "../../api/axios";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

    try {
      const response = await api.post("/api/auth/register", formData);
      console.log(response.data);
      navigate("/login");
      alert("Registered Successfully");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Registration Failed");
        console.log(error.response?.data);
      } else {
        alert("Something went wrong");
        console.log(error);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F8FAFC] font-sans selection:bg-slate-900 selection:text-white text-slate-800">
      {/* Global Header */}
      <header className="w-full bg-white px-6 py-4 md:px-12 flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-1.5 font-bold text-lg text-slate-900 tracking-tight">
          <span>WealthMatrix</span>
        </div>
        <div className="text-xs md:text-sm text-slate-500">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-slate-900 font-bold hover:underline transition"
          >
            Log In
          </a>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="flex w-full max-w-[1120px] min-h-[680px] bg-white rounded-xl shadow-md border border-slate-200/60 overflow-hidden">
          {/* Left Panel: Feature Highlights */}
          <div className="hidden lg:flex flex-col justify-between w-[40%] bg-[#0B1320] p-8 text-white relative">
            <div className="space-y-6 z-10">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-slate-100">
                  Unified Wealth Intelligence
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                  Empowering global investors with precision data and
                  institutional-grade tools.
                </p>
              </div>

              {/* Feature 1 */}
              <div className="flex items-start gap-4">
                <div className="p-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-slate-300">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">
                    Real-time Analytics
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Monitor market shifts and portfolio performance with
                    millisecond latency.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-4">
                <div className="p-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-slate-300">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">
                    Secure Asset Management
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Multi-layer encryption and biometric security for your
                    digital wealth.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-4">
                <div className="p-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-slate-300">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">
                    Institutional Access
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Unlock private markets and alternative assets usually
                    reserved for the elite.
                  </p>
                </div>
              </div>
            </div>

            {/* Embedded laptop mockup representation */}
            <div className="mt-6 relative rounded-lg overflow-hidden border border-slate-800">
              <img
                src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=500&q=80"
                alt="Analytics Presentation"
                className="w-full aspect-[4/3] object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition duration-500"
              />
            </div>
          </div>

          {/* Right Panel: Scrollable Registration Form */}
          <div className="w-full lg:w-[60%] p-6 sm:p-10 md:p-12 overflow-y-auto flex items-center bg-white">
            <div className="w-full max-w-xl mx-auto space-y-6">
              <div>
                <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-[#00F294]/20 text-[#008752] rounded uppercase tracking-wider mb-2">
                  {formData.role_name} Role
                </span>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Create your {formData.role_name} account
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete the professional onboarding to begin your wealth
                  journey.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* First Name & Last Name Group */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      placeholder="Enter first name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-slate-900 transition text-slate-900 placeholder:text-slate-400"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      placeholder="Enter last name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-slate-900 transition text-slate-900 placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                    Professional Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-slate-900 transition text-slate-900 placeholder:text-slate-400"
                    required
                  />
                </div>

                {/* Mobile Phone & PAN Number Group */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                      Mobile Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-slate-900 transition text-slate-900 placeholder:text-slate-400"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                      PAN Number
                    </label>
                    <input
                      type="text"
                      name="pan_number"
                      placeholder="ABCDE1234F"
                      value={formData.pan_number}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-slate-900 transition text-slate-900 placeholder:text-slate-400 uppercase"
                      required
                    />
                  </div>
                </div>

                {/* Date of Birth & Password Group */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-slate-900 transition text-slate-900 cursor-pointer"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                      Secure Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-slate-900 transition text-slate-900 placeholder:text-slate-400"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                      >
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
                      </button>
                    </div>
                  </div>
                </div>

                {/* Role Switcher Option (Preserved cleanly from your code structure) */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                    Account Access Role
                  </label>
                  <select
                    name="role_name"
                    value={formData.role_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md outline-none focus:border-slate-900 transition text-slate-900 cursor-pointer capitalize"
                  >
                    <option value="investor">Investor</option>
                    <option value="admin">Admin</option>
                    <option value="support">Support</option>
                  </select>
                </div>

                {/* Disclaimer Checkbox */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 accent-slate-900 cursor-pointer"
                  />
                  <label
                    htmlFor="terms"
                    className="text-[11px] text-slate-500 leading-normal select-none cursor-pointer"
                  >
                    I agree to the{" "}
                    <span className="text-slate-900 font-semibold underline">
                      Terms of Service
                    </span>{" "}
                    and{" "}
                    <span className="text-slate-900 font-semibold underline">
                      Privacy Policy
                    </span>
                    . I understand that WealthMatrix maintains strict compliance
                    with international financial regulations.
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-[#111827] text-white py-2.5 rounded-md font-semibold text-xs uppercase tracking-wider hover:bg-slate-800 transition active:scale-[0.99] mt-2"
                >
                  Register Account
                </button>
              </form>

             
              
            </div>
          </div>
        </div>
      </main>

      {/* Global Footer */}
      <footer className="w-full bg-white border-t border-slate-100 px-6 py-4 md:px-12 flex flex-col sm:flex-row gap-2 justify-between items-center text-[11px] text-slate-400">
        <div>© 2026 WealthMatrix Institutional. All rights reserved.</div>
        <div className="flex gap-4 font-medium text-slate-500">
          <a href="#security" className="hover:text-slate-900 transition">
            Security
          </a>
          <a href="#compliance" className="hover:text-slate-900 transition">
            Compliance
          </a>
          <a href="#help" className="hover:text-slate-900 transition">
            Help Center
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Register;
