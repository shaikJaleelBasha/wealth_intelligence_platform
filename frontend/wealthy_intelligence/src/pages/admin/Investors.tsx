import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Sparkles, ShieldAlert, Award, Loader2, Search, Mail, Phone, MapPin, CheckCircle2 } from "lucide-react";

const Investors = () => {
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchInvestors = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/investors");
      setInvestors(response.data);
    } catch (error) {
      console.error("Error fetching investors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestors();
  }, []);

  const toggleKyc = async (investorId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "VERIFIED" ? "PENDING" : "VERIFIED";
    setUpdatingId(investorId);

    try {
      await api.put(`/api/investors/${investorId}/kyc`, { kyc_status: nextStatus });
      setInvestors((prev) =>
        prev.map((inv) =>
          inv.investor_id === investorId ? { ...inv, kyc_status: nextStatus } : inv
        )
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update KYC status");
    } finally {
      setUpdatingId(null);
    }
  };

  const totalActive = investors.length;
  const verifiedCount = investors.filter((i) => i.kyc_status === "VERIFIED").length;
  const verifiedRatio = totalActive > 0 ? (verifiedCount / totalActive) * 100 : 0;
  const highRiskCount = investors.filter((i) => i.risk_profile?.includes("HIGH")).length;

  const filteredInvestors = investors.filter(
    (inv: any) =>
      `${inv.first_name || ""} ${inv.last_name || ""}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8 relative overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Glow backgrounds */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-indigo-650/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-violet-650/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="mb-8 relative z-10">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span>Central Registry and Compliance Control</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Investor Accounts & Audits
        </h1>
        <p className="text-slate-400 mt-2">
          Verify investor identities, monitor capital risk allocations, and audit platform account KYC statuses.
        </p>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 relative z-10">
        
        {/* TOTAL INVESTORS */}
        <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Registered Investors</span>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-slate-100">{totalActive}</h2>
            <p className="text-[10px] text-slate-500 mt-1 font-semibold">Active wealth portfolios listed</p>
          </div>
        </div>

        {/* KYC RATIO */}
        <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Compliance KYC Ratio</span>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-emerald-450">{verifiedRatio.toFixed(1)}%</h2>
            <p className="text-[10px] text-slate-500 mt-1 font-semibold">{verifiedCount} of {totalActive} verified listings</p>
          </div>
        </div>

        {/* RISK SPLIT */}
        <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">High Risk Profiles</span>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-indigo-400">{highRiskCount}</h2>
            <p className="text-[10px] text-slate-500 mt-1 font-semibold">Aggressive compounding profiles</p>
          </div>
        </div>

      </div>

      {/* Search Bar */}
      <div className="mb-6 relative z-10 max-w-md">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search investors by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-900/40 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-white transition placeholder:text-slate-650 font-medium"
          />
        </div>
      </div>

      {/* Investors Table */}
      <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/40 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-4 pl-6">Investor Cabinet</th>
                <th className="p-4">Contact Details</th>
                <th className="p-4">Location</th>
                <th className="p-4">Risk Profile</th>
                <th className="p-4 text-center">KYC Audit</th>
                <th className="p-4 text-center pr-6">Central Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60 text-xs font-semibold">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                    Fetching investor registries...
                  </td>
                </tr>
              ) : filteredInvestors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    No investor accounts matched the query.
                  </td>
                </tr>
              ) : (
                filteredInvestors.map((inv: any) => (
                  <tr key={inv.investor_id} className="hover:bg-slate-900/20 transition-all">
                    
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-sm">
                          {inv.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-100">
                            {inv.first_name || inv.last_name ? `${inv.first_name || ""} ${inv.last_name || ""}` : "Unconfigured Profile"}
                          </div>
                          <div className="text-[9px] text-slate-500 font-medium mt-0.5">Joined: {new Date(inv.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>{inv.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[10px] mt-1 font-medium">
                        <Phone className="w-3.5 h-3.5 text-slate-650" />
                        <span>{inv.phone || "No registry phone"}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1 text-slate-350">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {inv.city || inv.state || inv.country ? (
                            `${inv.city || ""}${inv.city && inv.state ? ", " : ""}${inv.state || ""}${inv.state && inv.country ? " - " : ""}${inv.country || ""}`
                          ) : (
                            "Unregistered Location"
                          )}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-bold bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20 uppercase tracking-wide">
                        <Award className="w-3 h-3" />
                        {inv.risk_profile || "HIGH"} RISK
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[9px] font-bold border ${
                          inv.kyc_status === "VERIFIED"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-450"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-450"
                        }`}
                      >
                        {inv.kyc_status === "VERIFIED" ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-450" />
                            VERIFIED
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3 h-3 text-amber-400" />
                            PENDING
                          </>
                        )}
                      </span>
                    </td>

                    <td className="p-4 text-center pr-6">
                      <button
                        onClick={() => toggleKyc(inv.investor_id, inv.kyc_status)}
                        disabled={updatingId === inv.investor_id}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                          inv.kyc_status === "VERIFIED"
                            ? "bg-red-500/10 border-red-500/15 text-red-400 hover:bg-red-650 hover:text-white"
                            : "bg-emerald-500/10 border-emerald-500/15 text-emerald-450 hover:bg-emerald-600 hover:text-white"
                        }`}
                      >
                        {updatingId === inv.investor_id ? (
                          <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                        ) : inv.kyc_status === "VERIFIED" ? (
                          "Suspend KYC"
                        ) : (
                          "Approve KYC"
                        )}
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Investors;
