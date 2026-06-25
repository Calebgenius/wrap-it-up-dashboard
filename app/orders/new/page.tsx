"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import { supabase } from "../../../lib/supabase";

const OCCASIONS = ["Birthday","Anniversary","Wedding / Introduction","Baby shower","Graduation","Corporate gift","Other"];
const SERVICES  = ["Gift wrapping only","Wrapping + delivery","Hamper curation","Full event package","Corporate gifting"];

export default function NewOrderPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    customer_name: "", phone: "", occasion: "", service: "",
    message: "", price: "", status: "new",
  });

  function set(e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      customer_name: form.customer_name,
      phone: form.phone,
      occasion: form.occasion,
      service: form.service,
      message: form.message,
      status: form.status,
      price: form.price ? parseInt(form.price) : null,
    };
    const { error } = await supabase.from("orders").insert([payload]);
    if (!error) {
      // upsert customer
      await supabase.from("customers").upsert(
        [{ name: form.customer_name, phone: form.phone }],
        { onConflict: "phone", ignoreDuplicates: false }
      );
      setSuccess(true);
      setTimeout(() => router.push("/orders"), 1500);
    }
    setSaving(false);
  }

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <div className="topbar">
          <h1 className="topbar-title">New Order</h1>
        </div>
        <div className="page-content">
          {success ? (
            <div className="form-card">
              <div style={{textAlign:"center",padding:"2rem"}}>
                <div style={{fontSize:"48px",marginBottom:"1rem"}}>🎁</div>
                <h2 style={{fontFamily:"Cormorant Garamond,serif",fontSize:"28px",marginBottom:"0.5rem"}}>Order saved!</h2>
                <p style={{color:"var(--text-muted)"}}>Redirecting to orders...</p>
              </div>
            </div>
          ) : (
            <form className="form-card" onSubmit={save}>
              <h2 style={{fontFamily:"Cormorant Garamond,serif",fontSize:"22px",marginBottom:"1.5rem"}}>Order Details</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Customer Name *</label>
                  <input className="form-input" name="customer_name" required value={form.customer_name} onChange={set} placeholder="e.g. Amara Nakato"/>
                </div>
                <div className="form-group">
                  <label className="form-label">WhatsApp Number *</label>
                  <input className="form-input" name="phone" required value={form.phone} onChange={set} placeholder="+256 ..."/>
                </div>
                <div className="form-group">
                  <label className="form-label">Occasion</label>
                  <select className="form-input" name="occasion" value={form.occasion} onChange={set}>
                    <option value="">Select...</option>
                    {OCCASIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Service</label>
                  <select className="form-input" name="service" value={form.service} onChange={set}>
                    <option value="">Select...</option>
                    {SERVICES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price (UGX)</label>
                  <input className="form-input" name="price" type="number" value={form.price} onChange={set} placeholder="e.g. 25000"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" name="status" value={form.status} onChange={set}>
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="wrapped">Wrapped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label className="form-label">Notes / Special Requests</label>
                  <textarea className="form-input" name="message" value={form.message} onChange={set} placeholder="Gift size, colours, delivery address..."/>
                </div>
              </div>
              <div style={{marginTop:"1.5rem",display:"flex",gap:"0.75rem"}}>
                <button type="submit" className="btn btn-gold" disabled={saving}>
                  {saving ? "Saving..." : "Save Order ✦"}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => router.push("/orders")}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}