"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { supabase, Order } from "../../lib/supabase";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState("");

  useEffect(() => {
    const auth = localStorage.getItem("wiu_auth");
    if (!auth) { router.push("/login"); return; }
    setUser(localStorage.getItem("wiu_user") || "");
    load();
  }, []);

  async function load() {
    const { data } = await supabase.from("orders").select("*")
      .order("created_at", { ascending: false }).limit(8);
    setOrders(data || []);
    setLoading(false);
  }

  function logout() {
    localStorage.removeItem("wiu_auth");
    localStorage.removeItem("wiu_user");
    router.push("/login");
  }

  const newOrders  = orders.filter(o => o.status === "new").length;
  const delivered  = orders.filter(o => o.status === "delivered").length;
  const inProgress = orders.filter(o => o.status === "in_progress").length;
  const revenue    = orders.reduce((s, o) => s + (o.price || 0), 0);
  const fmt = (d: string) => new Date(d).toLocaleDateString("en-UG", { day:"numeric", month:"short" });

  async function updateStatus(id: string, status: string) {
    await supabase.from("orders").update({ status }).eq("id", id);
    load();
  }

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <div className="topbar">
          <h1 className="topbar-title">Good morning ✨</h1>
          <div className="topbar-actions">
            <span style={{fontSize:"12px",color:"var(--text-muted)"}}>{user}</span>
            <Link href="/orders/new" className="btn btn-gold">+ New Order</Link>
            <button className="btn btn-outline btn-sm" onClick={logout}>Logout</button>
          </div>
        </div>
        <div className="page-content">
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">New Orders</div>
              <div className="stat-value stat-accent">{loading ? "—" : newOrders}</div>
              <div className="stat-sub">Need attention</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">In Progress</div>
              <div className="stat-value">{loading ? "—" : inProgress}</div>
              <div className="stat-sub">Being wrapped</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Delivered</div>
              <div className="stat-value">{loading ? "—" : delivered}</div>
              <div className="stat-sub">Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Revenue</div>
              <div className="stat-value stat-accent">{loading ? "—" : `${(revenue/1000).toFixed(0)}k`}</div>
              <div className="stat-sub">UGX total</div>
            </div>
          </div>
          <div className="table-card">
            <div className="table-header">
              <h2 className="table-title">Recent Orders</h2>
              <Link href="/orders" className="btn btn-outline btn-sm">View all</Link>
            </div>
            {loading ? <div className="empty"><p>Loading...</p></div>
            : orders.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">🎁</div>
                <p>No orders yet. <Link href="/orders/new" style={{color:"var(--gold)"}}>Create the first one!</Link></p>
              </div>
            ) : (
              <table>
                <thead><tr>
                  <th>Customer</th><th>Service</th><th>Occasion</th>
                  <th>Status</th><th>Date</th><th>WhatsApp</th>
                </tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td><strong>{o.customer_name}</strong></td>
                      <td>{o.service}</td>
                      <td>{o.occasion}</td>
                      <td>
                        <select className="status-select" value={o.status}
                          onChange={e => updateStatus(o.id, e.target.value)}>
                          <option value="new">New</option>
                          <option value="in_progress">In Progress</option>
                          <option value="wrapped">Wrapped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                      <td>{fmt(o.created_at)}</td>
                      <td><a href={`https://wa.me/${o.phone.replace(/\D/g,"")}`}
                        target="_blank" rel="noopener noreferrer" className="wa-link">Chat →</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}