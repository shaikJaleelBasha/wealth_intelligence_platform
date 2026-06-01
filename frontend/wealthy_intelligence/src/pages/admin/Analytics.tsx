import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Sparkles, Activity, ShieldAlert, Cpu, RefreshCw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const Analytics = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/admin/logs");
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching admin logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const totalRequests = logs.length;
  
  const avgLatency = totalRequests > 0 
    ? Math.round(logs.reduce((acc, l) => acc + Number(l.duration_ms || 0), 0) / totalRequests)
    : 0;

  const successCount = logs.filter((l) => Number(l.status) >= 200 && Number(l.status) < 300).length;
  const successRatio = totalRequests > 0 ? (successCount / totalRequests) * 100 : 0;

  const errorCount = logs.filter((l) => Number(l.status) >= 400).length;

  const chartData = [...logs].reverse().map((l, index) => ({
    name: `Req ${index + 1}`,
    latency: Number(l.duration_ms || 0),
    status: Number(l.status),
  }));

  const methodCounts: Record<string, number> = {};
  logs.forEach((l) => {
    methodCounts[l.method] = (methodCounts[l.method] || 0) + 1;
  });

  const pieData = Object.keys(methodCounts).map((key) => ({
    name: key,
    value: methodCounts[key],
  }));

  const COLORS = ["#6366f1", "#a855f7", "#ec4899", "#10b981", "#f59e0b"];

  const highLatencyAlerts = logs.filter((l) => Number(l.duration_ms) > 100 || Number(l.status) >= 400).slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8 relative overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Glow backgrounds */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-indigo-650/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-violet-650/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span>Operational Telemetry & Diagnostics</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            System Infrastructure Analytics
          </h1>
          <p className="text-slate-400 mt-2">
            Deconstruct network response times, analyze resource method frequencies, and pinpoint route anomalies.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="p-3 bg-slate-900/40 hover:bg-slate-800/60 text-slate-400 hover:text-white rounded-xl border border-slate-800/80 transition flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 mb-8">
        
        {/* NETWORK LATENCY */}
        <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Avg Latency</span>
            <span className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <Cpu className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-slate-100">{avgLatency} ms</h2>
            <p className="text-[10px] text-slate-500 mt-1 font-semibold">Average gateway response lag</p>
          </div>
        </div>

        {/* TRAFFIC VOLUME */}
        <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Total Traffic</span>
            <span className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-slate-100">{totalRequests}</h2>
            <p className="text-[10px] text-slate-500 mt-1 font-semibold">Logged gateway proxy operations</p>
          </div>
        </div>

        {/* COMPLIANCE RATIO */}
        <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Success Ratio</span>
            <span className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-emerald-450">{successRatio.toFixed(1)}%</h2>
            <p className="text-[10px] text-slate-500 mt-1 font-semibold">{successCount} successful responses</p>
          </div>
        </div>

        {/* SYSTEM ERRORS */}
        <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Route Errors</span>
            <span className={`p-2 rounded-xl border ${errorCount > 0 ? "bg-red-500/15 border-red-500/25 text-red-450" : "bg-slate-800 border-slate-700 text-slate-500"}`}>
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h2 className={`text-3xl font-black ${errorCount > 0 ? "text-red-450 animate-pulse" : "text-slate-100"}`}>{errorCount}</h2>
            <p className="text-[10px] text-slate-500 mt-1 font-semibold">Logged 4xx / 5xx responses</p>
          </div>
        </div>

      </div>

      {/* Charts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10 mb-8">
        
        {/* Network Latency Plot */}
        <div className="lg:col-span-2 bg-slate-900/30 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl">
          <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
            <Activity className="text-indigo-400 w-5 h-5 animate-pulse" />
            Route Latency History
          </h2>
          {chartData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} unit="ms" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px", fontSize: "11px" }}
                    itemStyle={{ color: "#f8fafc" }}
                    labelStyle={{ color: "#64748b", fontWeight: "bold" }}
                  />
                  <Area type="monotone" dataKey="latency" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorLatency)" name="Latency" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
              <p className="text-slate-500 text-xs font-semibold">No operational traffic logged. Interact with APIs to feed logs.</p>
            </div>
          )}
        </div>

        {/* Methods Split PieChart */}
        <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
            <Cpu className="text-indigo-400 w-5 h-5" />
            HTTP Methods Split
          </h2>
          {pieData.length > 0 ? (
            <div className="h-[220px] w-full flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px", fontSize: "11px" }}
                    itemStyle={{ color: "#f8fafc" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[180px] flex items-center justify-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/20 mb-4">
              <p className="text-slate-500 text-xs">No methods logged.</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 border-t border-slate-850 pt-4">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span>{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Route Bottle-necks / Alerts Table */}
      <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl relative z-10">
        <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
          <ShieldAlert className="text-red-450 w-5 h-5 animate-pulse" />
          Critical Operational Bottle-necks & Errors
        </h2>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-4 border-b border-slate-800 pb-3">
          Queries exceeding 100ms latency threshold or returning 4xx/5xx anomalies
        </p>

        <div className="space-y-3 font-mono text-[10px]">
          {highLatencyAlerts.length === 0 ? (
            <div className="py-6 text-center text-slate-500 font-sans font-semibold">
              Platform stable. Zero high-latency operations or errors flagged.
            </div>
          ) : (
            highLatencyAlerts.map((l: any) => {
              const latencyColor = Number(l.duration_ms) > 300 ? "text-red-450 font-bold" : "text-amber-450 font-semibold";
              const statusColor = Number(l.status) >= 400 ? "text-red-450 font-bold" : "text-slate-400";
              
              return (
                <div key={l.log_id} className="bg-slate-950/50 border border-slate-900/50 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-block px-1.5 py-0.5 font-bold bg-indigo-500/10 text-indigo-400 rounded uppercase">
                      {l.method}
                    </span>
                    <span className="text-slate-300">{l.path}</span>
                    <span className="text-slate-500">({l.user_email})</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={statusColor}>Status: {l.status}</span>
                    <span className={latencyColor}>Duration: {l.duration_ms}ms</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};

export default Analytics;
