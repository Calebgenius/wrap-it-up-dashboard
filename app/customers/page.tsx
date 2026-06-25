"use client";
import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { supabase, Customer } from "../../lib/supabase";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });
      setCustomers(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-UG", { day:"numeric", month:"short", year:"numeric" });

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <div className="topbar">
          <h1 className="topbar-title">Customers</h1>
          <input
            className="form-input"
            style={{width:"220px"}}
            placeholder="Search name or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="page-content">
          <div className="table-card">
            <div className="table-header">
              <h2 className="table-title">
                All Customers
                <span style={{fontSize:"14px",color:"var(--text-muted)",marginLeft:"0.75rem",fontFamily:"Jost"}}>
                  ({filtered.length})
                </span>
              </h2>
            </div>
            {loading ? (
              <div className="empty"><p>Loading...</p></div>
            ) : filtered.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">👥</div>
                <p>No customers yet. They appear automatically when you add orders.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>WhatsApp</th>
                    <th>Total Orders</th>
                    <th>First Order</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id}>
                      <td><strong>{c.name}</strong></td>
                      <td>
                        <a href={`https://wa.me/${c.phone.replace(/\D/g,"")}`}
                          target="_blank" rel="noopener noreferrer" className="wa-link">
                          {c.phone}
                        </a>
                      </td>
                      <td>{c.total_orders || 0}</td>
                      <td>{fmt(c.created_at)}</td>
                      <td>
                        <a href={`https://wa.me/${c.phone.replace(/\D/g,"")}?text=${encodeURIComponent("Hi "+c.name+"! 🎁 Thank you for choosing Wrap It Up.")}`}
                          target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                          WhatsApp
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