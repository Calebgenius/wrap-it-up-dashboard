"use client";
import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { supabase, Order } from "../../lib/supabase";
import Link from "next/link";

const STATUSES = ["all", "new", "in_progress", "wrapped", "delivered"];

export default function OrdersPage() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [filter, setFilter]   = useState("all");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    let q = supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setOrders(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]);

  async function updateStatus(id: string, status: string) {
    await supabase.from("orders").update({ status }).eq("id", id);
    load();
  }

  async function deleteOrder(id: string) {
    if (!confirm("Delete this order?")) return;
    setDeleting(id);
    await supabase.from("orders").delete().eq("id", id);
    load();
    setDeleting(null);
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-UG", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <div className="topbar">
          <h1 className="topbar-title">Orders</h1>
          <Link href="/orders/new" className="btn btn-gold">+ New Order</Link>
        </div>
        <div className="page-content">

          {/* FILTER TABS */}
          <div style={{ display:"flex", gap:"0.5rem", marginBottom:"1.5rem", flexWrap:"wrap" }}>
            {STATUSES.map(s => (
              <button key={s} className={`btn btn-sm ${filter===s?"btn-gold":"btn-outline"}`}
                onClick={() => setFilter(s)}>
                {s.replace("_"," ")}
              </button>
            ))}
          </div>

          <div className="table-card">
            <div className="table-header">
              <h2 className="table-title">
                {filter === "all" ? "All Orders" : filter.replace("_"," ")} 
                <span style={{fontSize:"14px",color:"var(--text-muted)",marginLeft:"0.75rem",fontFamily:"Jost"}}>
                  ({orders.length})
                </span>
              </h2>
            </div>
            {loading ? (
              <div className="empty"><p>Loading...</p></div>
            ) : orders.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">🎁</div>
                <p>No orders found.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Service</th>
                    <th>Occasion</th>
                    <th>Price (UGX)</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td><strong>{o.customer_name}</strong></td>
                      <td>
                        <a href={`https://wa.me/${o.phone.replace(/\D/g,"")}`}
                          target="_blank" rel="noopener noreferrer" className="wa-link">
                          {o.phone}
                        </a>
                      </td>
                      <td>{o.service}</td>
                      <td>{o.occasion}</td>
                      <td>{o.price ? o.price.toLocaleString() : <span style={{color:"var(--text-muted)"}}>—</span>}</td>
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
                      <td>
                        <button className="btn btn-danger btn-sm"
                          onClick={() => deleteOrder(o.id)}
                          disabled={deleting === o.id}>
                          {deleting === o.id ? "..." : "Delete"}
                        </button>
                      </td>
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