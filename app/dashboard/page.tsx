"use client";
import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { supabase, Order } from "../../lib/supabase";
import Link from "next/link";

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      setOrders(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const total     = orders.length;
  const newOrders = orders.filter(o => o.status === "new").length;
  const delivered = orders.filter(o => o.status === "delivered").length;
  const revenue   = orders.filter(o => o.price).reduce((s, o) => s + (o.price || 0), 0);

  const statusBadge = (s: string) => (
    <span className={`badge badge-${s}`}>{s.replace("_", " ")}</span>
  );

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-UG", { day: "numeric", month: "short" });

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <div className="topbar">
          <h1 className="topbar-title">Good morning ✨</h1>
          <div className="topbar-actions">
            <Link href="/orders/new" className="btn btn-gold">+ New Order</Link>
          </div>
        </div>
        <div className="page-content">

          {/* STATS */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Total Orders</div>
              <div className="stat-value">{loading ? "—" : total}</div>
              <div className="stat-sub">All time</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">New</div>
              <div className="stat-value stat-accent">{loading ? "—" : newOrders}</div>
              <div className="stat-sub">Awaiting action</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Delivered</div>
              <div className="stat-value">{loading ? "—" : delivered}</div>
              <div className="stat-sub">Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Revenue</div>
              <div className="stat-value stat-accent">{loading ? "—" : `${(revenue/1000).toFixed(0)}k`}</div>
              <div className="stat-sub">UGX (recent orders)</div>
            </div>
          </div>

          {/* RECENT ORDERS */}
          <div className="table-card">
            <div className="table-header">
              <h2 className="table-title">Recent Orders</h2>
              <Link href="/orders" className="btn btn-outline btn-sm">View all</Link>
            </div>
            {loading ? (
              <div className="empty"><p>Loading...</p></div>
            ) : orders.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">🎁</div>
                <p>No orders yet. <Link href="/orders/new" style={{color:"var(--gold)"}}>Create the first one!</Link></p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Occasion</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>WhatsApp</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td><strong>{o.customer_name}</strong></td>
                      <td>{o.service}</td>
                      <td>{o.occasion}</td>
                      <td>{statusBadge(o.status)}</td>
                      <td>{fmt(o.created_at)}</td>
                      <td>
                        <a href={`https://wa.me/${o.phone.replace(/\D/g,"")}`}
                          target="_blank" rel="noopener noreferrer" className="wa-link">
                          Chat →
                        </a>
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