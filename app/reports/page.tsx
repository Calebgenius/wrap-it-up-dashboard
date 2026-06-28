"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { supabase } from "../../lib/supabase";

export default function ReportsPage() {
  const router = useRouter();
  const [orders, setOrders]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod]   = useState("all");

  useEffect(() => {
    if (!localStorage.getItem("wiu_auth")) { router.push("/login"); return; }
    load();
  }, [period]);

  async function load() {
    setLoading(true);
    let q = supabase.from("orders").select("*").neq("status","cancelled");
    if (period === "today") {
      const today = new Date().toISOString().split("T")[0];
      q = q.gte("created_at", today);
    } else if (period === "week") {
      const week = new Date(Date.now() - 7*24*60*60*1000).toISOString();
      q = q.gte("created_at", week);
    } else if (period === "month") {
      const month = new Date(Date.now() - 30*24*60*60*1000).toISOString();
      q = q.gte("created_at", month);
    }
    const { data } = await q.order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }

  const totalRevenue  = orders.filter(o => o.payment_status === "paid").reduce((s,o) => s + (o.confirmed_price || o.total_price || o.price || 0), 0);
  const totalPending  = orders.filter(o => o.payment_status !== "paid").reduce((s,o) => s + ((o.confirmed_price || o.total_price || o.price || 0) - (o.paid_amount || 0)), 0);
  const totalOrders   = orders.length;
  const delivered     = orders.filter(o => o.status === "delivered").length;
  const newOrders     = orders.filter(o => o.status === "new").length;
  const convRate      = totalOrders > 0 ? Math.round((delivered/totalOrders)*100) : 0;

  // Service breakdown
  const serviceMap: Record<string,{count:number;revenue:number}> = {};
  orders.forEach(o => {
    const svc = o.service || "Unknown";
    if (!serviceMap[svc]) serviceMap[svc] = {count:0,revenue:0};
    serviceMap[svc].count++;
    serviceMap[svc].revenue += o.payment_status === "paid" ? (o.confirmed_price || o.total_price || o.price || 0) : 0;
  });
  const services = Object.entries(serviceMap).sort((a,b) => b[1].count - a[1].count);

  // Occasion breakdown
  const occasionMap: Record<string,number> = {};
  orders.forEach(o => {
    const occ = o.occasion || "Unknown";
    occasionMap[occ] = (occasionMap[occ] || 0) + 1;
  });
  const occasions = Object.entries(occasionMap).sort((a,b) => b[1] - a[1]);

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <div className="topbar">
          <h1 className="topbar-title">Reports</h1>
          <div className="topbar-actions">
            {["today","week","month","all"].map(p => (
              <button key={p} className={`btn btn-sm ${period===p?"btn-gold":"btn-outline"}`}
                onClick={() => setPeriod(p)}>
                {p === "all" ? "All time" : `This ${p}`}
              </button>
            ))}
          </div>
        </div>
        <div className="page-content">

          {/* TOP STATS */}
          <div className="stat-grid" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
            <div className="stat-card" style={{borderTop:"3px solid #4CAF82"}}>
              <div className="stat-label">Revenue collected</div>
              <div className="stat-value" style={{color:"#4CAF82",fontSize:"28px"}}>UGX {(totalRevenue/1000).toFixed(0)}k</div>
              <div className="stat-sub">{orders.filter(o=>o.payment_status==="paid").length} paid orders</div>
            </div>
            <div className="stat-card" style={{borderTop:"3px solid #E8943A"}}>
              <div className="stat-label">Pending payment</div>
              <div className="stat-value" style={{color:"#E8943A",fontSize:"28px"}}>UGX {(totalPending/1000).toFixed(0)}k</div>
              <div className="stat-sub">{orders.filter(o=>o.payment_status!=="paid").length} unpaid orders</div>
            </div>
            <div className="stat-card" style={{borderTop:"3px solid var(--gold)"}}>
              <div className="stat-label">Delivery rate</div>
              <div className="stat-value" style={{color:"var(--gold)",fontSize:"28px"}}>{convRate}%</div>
              <div className="stat-sub">{delivered} of {totalOrders} delivered</div>
            </div>
          </div>

          <div className="two-col">
            {/* SERVICE BREAKDOWN */}
            <div className="table-card">
              <div className="table-header">
                <h2 className="table-title">By Service</h2>
              </div>
              <table>
                <thead><tr>
                  <th>Service</th><th>Orders</th><th>Revenue</th>
                </tr></thead>
                <tbody>
                  {services.map(([svc, data]) => (
                    <tr key={svc}>
                      <td style={{fontSize:"13px"}}>{svc}</td>
                      <td><strong>{data.count}</strong></td>
                      <td style={{color:"var(--gold)"}}>
                        {data.revenue > 0 ? `UGX ${data.revenue.toLocaleString()}` : "—"}
                      </td>
                    </tr>
                  ))}
                  {services.length === 0 && (
                    <tr><td colSpan={3} style={{textAlign:"center",color:"var(--text-muted)"}}>No data yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* OCCASION BREAKDOWN */}
            <div className="table-card">
              <div className="table-header">
                <h2 className="table-title">By Occasion</h2>
              </div>
              <table>
                <thead><tr>
                  <th>Occasion</th><th>Orders</th><th>%</th>
                </tr></thead>
                <tbody>
                  {occasions.map(([occ, count]) => (
                    <tr key={occ}>
                      <td style={{fontSize:"13px"}}>{occ}</td>
                      <td><strong>{count}</strong></td>
                      <td style={{color:"var(--text-muted)"}}>
                        {Math.round((count/totalOrders)*100)}%
                      </td>
                    </tr>
                  ))}
                  {occasions.length === 0 && (
                    <tr><td colSpan={3} style={{textAlign:"center",color:"var(--text-muted)"}}>No data yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RECENT PAID ORDERS */}
          <div className="table-card section-gap">
            <div className="table-header">
              <h2 className="table-title">Paid Orders</h2>
              <span style={{fontSize:"13px",color:"var(--gold)",fontWeight:500}}>
                Total: UGX {totalRevenue.toLocaleString()}
              </span>
            </div>
            <table>
              <thead><tr>
                <th>Customer</th><th>Service</th><th>Amount</th><th>Method</th><th>Date</th>
              </tr></thead>
              <tbody>
                {orders.filter(o => o.payment_status === "paid").map(o => (
                  <tr key={o.id}>
                    <td><strong>{o.customer_name}</strong></td>
                    <td style={{fontSize:"12px"}}>{o.service}</td>
                    <td style={{color:"var(--gold)",fontWeight:500}}>
                      UGX {(o.confirmed_price || o.total_price || o.price || 0).toLocaleString()}
                    </td>
                    <td style={{fontSize:"12px",color:"var(--text-muted)"}}>{o.payment_method || "—"}</td>
                    <td style={{fontSize:"12px",color:"var(--text-muted)"}}>
                      {new Date(o.created_at).toLocaleDateString("en-UG",{day:"numeric",month:"short"})}
                    </td>
                  </tr>
                ))}
                {orders.filter(o=>o.payment_status==="paid").length === 0 && (
                  <tr><td colSpan={5} style={{textAlign:"center",color:"var(--text-muted)",padding:"2rem"}}>No paid orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}