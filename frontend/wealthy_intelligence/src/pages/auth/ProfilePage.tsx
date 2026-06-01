import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import api from "../../api/axios";
import { 
  User, Mail, Phone, MapPin, ShieldCheck, AlertCircle, Loader2, Sparkles, CheckCircle2, Award 
} from "lucide-react";

const ProfilePage = () => {
  const { user, profile, token, login } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  
  // Investor specific fields
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [riskProfile, setRiskProfile] = useState("HIGH");
  
  // Admin specific fields
  const [department, setDepartment] = useState("STOCK_MANAGEMENT");

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setPhone(profile.phone || "");
      
      if (user?.role_name === "INVESTOR") {
        setAddress(profile.address || "");
        setCity(profile.city || "");
        setState(profile.state || "");
        setCountry(profile.country || "");
        setRiskProfile(profile.risk_profile || "HIGH");
      } else if (user?.role_name === "ADMIN") {
        setDepartment(profile.department || "STOCK_MANAGEMENT");
      }
    }
  }, [profile, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = user?.role_name === "INVESTOR" 
      ? { first_name: firstName, last_name: lastName, phone, address, city, state, country, risk_profile: riskProfile }
      : { first_name: firstName, last_name: lastName, phone, department };

    try {
      const response = await api.put("/api/auth/profile", payload);
      const updatedProfile = response.data.profile;

      // Update context and local storage by calling login again with updated profile
      if (user && token) {
        login(user, updatedProfile, token);
      }

      setSuccessMsg("Onboarding Profile updated successfully in real-time!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span>Personal Cabinet Management</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Profile Settings
        </h1>
        <p className="text-slate-400 mt-2">
          View your private cabinet, verify onboarding details, and manage risk parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl shadow-lg flex flex-col items-center justify-between h-fit text-center">
          
          {/* Avatar representation */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center font-black text-3xl shadow-lg shadow-indigo-650/20 mb-4 border-2 border-indigo-400/20">
            {user?.email?.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-100">
              {firstName && lastName ? `${firstName} ${lastName}` : "User Cabinet Reference"}
            </h2>
            <p className="text-xs text-slate-400 mt-1">{user?.email}</p>
            <span className="inline-block mt-3 text-[10px] bg-slate-950 border border-slate-800 text-indigo-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              {user?.role_name} Access Level
            </span>
          </div>

          <div className="w-full mt-6 pt-6 border-t border-slate-700/50 text-left space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">KYC Status:</span>
              <span className="flex items-center gap-1 font-bold text-emerald-450 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                VERIFIED
              </span>
            </div>
            
            {user?.role_name === "INVESTOR" && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Risk Profile:</span>
                <span className="font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20 uppercase">
                  {riskProfile} RISK
                </span>
              </div>
            )}

            {user?.role_name === "ADMIN" && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Department:</span>
                <span className="font-bold text-indigo-400 uppercase">
                  {department}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Update Profile Form */}
        <div className="bg-slate-800/30 border border-slate-750 p-6 sm:p-8 rounded-3xl lg:col-span-2 shadow-md">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 border-b border-slate-750 pb-4 mb-6">
            <User className="w-5 h-5 text-indigo-400" />
            Update Cabinet Credentials
          </h2>

          {successMsg && (
            <div className="flex items-center gap-3 bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 p-4 rounded-xl text-xs mb-6 animate-pulse font-semibold">
              <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-3 bg-red-500/10 text-red-450 border border-red-500/20 p-4 rounded-xl text-xs mb-6 font-semibold">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">First Name</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <User className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-white font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Last Name</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <User className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-white font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Registered Phone</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <Phone className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-white font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Cabinet Email (Unchangeable)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-650">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950/20 border border-slate-800/40 rounded-xl outline-none text-slate-500 cursor-not-allowed font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Investor Specific Address block */}
            {user?.role_name === "INVESTOR" && (
              <>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Residential Address</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <MapPin className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-white font-medium"
                      placeholder="Street name and unit number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-white font-medium"
                      placeholder="e.g. Mumbai"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">State / Province</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-white font-medium"
                      placeholder="e.g. Maharashtra"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-white font-medium"
                      placeholder="e.g. India"
                    />
                  </div>
                </div>

                {/* Risk Parameters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Risk Tolerability Profile</label>
                    <select
                      value={riskProfile}
                      onChange={(e) => setRiskProfile(e.target.value)}
                      className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none cursor-pointer capitalize"
                    >
                      <option value="LOW">Low Risk (Capital Preservation)</option>
                      <option value="MODERATE">Moderate Risk (Balanced growth)</option>
                      <option value="HIGH">High Risk (Maximum compounding)</option>
                      <option value="VERY HIGH">Very High Risk (Aggressive speculation)</option>
                    </select>
                  </div>
                  <div className="bg-slate-900/40 border border-slate-800/40 p-4 rounded-2xl flex items-center gap-3">
                    <Award className="w-5 h-5 text-indigo-400 shrink-0" />
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Your chosen risk parameters dynamically adjust platform algorithms and portfolio health index scores.
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Admin Specific blocks */}
            {user?.role_name === "ADMIN" && (
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Administrative Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none cursor-pointer"
                >
                  <option value="STOCK_MANAGEMENT">Stock & Trading Audit</option>
                  <option value="MUTUAL_FUNDS_AUDIT">Mutual Funds & SIP Control</option>
                  <option value="SECURITY_INTELLIGENCE">Central Security & Traffic</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-650/15 transition-all hover:scale-[1.01] text-xs flex items-center justify-center gap-1.5 disabled:opacity-75 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Cabinet Settings...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Save Cabinet Profile
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
