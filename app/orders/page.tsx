"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { supabase } from "../../lib/supabase";

const STATUSES = ["all","new","sourcing","wrapping","out_for_delivery","delivered","cancelled"];
const STATUS_LABELS: Record<string,string> = {
  all:"All", new:"New", sourcing:"Sourcing Gift",
  wrapping:"Wrapping", out_for_delivery:"Out for Delivery",
  delivered:"Delivered", cancelled:"Cancelled"
};
const STATUS_COLORS: Record<string,{bg:string;text:string}> = {
  new:              {bg:"rgba(91,141,239,0.12)",  text:"#185FA5"},
  sourcing:         {bg:"rgba(232,148,58,0.12)",  text:"#854F0B"},
  wrapping:         {bg:"rgba(201,169,110,0.15)", text:"#A07840"},
  out_for_delivery: {bg:"rgba(91,141,239,0.12)",  text:"#185FA5"},
  delivered:        {bg:"rgba(76,175,130,0.12)",  text:"#0F6E56"},
  cancelled:        {bg:"rgba(224,92,92,0.12)",   text:"#B03030"},
};
const PAY_COLORS: Record<string,{bg:string;text:string}> = {
  unpaid:  {bg:"rgba(224,92,92,0.12)",  text:"#B03030"},
  partial: {bg:"rgba(232,148,58,0.12)", text:"#854F0B"},
  paid:    {bg:"rgba(76,175,130,0.12)", text:"#0F6E56"},
};
const SITE_URL = "https://wrap-it-up-weld.vercel.app";

// ── PHONE CLEANER ── handles 0750..., +256750..., 256750...
function cleanPhone(phone: string): string {
  let p = (phone || "").replace(/\D/g, "");
  if (p.startsWith("0")) p = "256" + p.slice(1);
  if (!p.startsWith("256")) p = "256" + p;
  return p;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders]           = useState<any[]>([]);
  const [filter, setFilter]           = useState("all");
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [confirming, setConfirming]   = useState<string|null>(null);
  const [priceInputs, setPriceInputs] = useState<Record<string,string>>({});

  useEffect(() => {
    if (!localStorage.getItem("wiu_auth")) { router.push("/login"); }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setOrders(data || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [filter]);

  const filtered = orders.filter(o =>
    o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.phone?.includes(search) ||
    o.order_ref?.includes(search.toUpperCase())
  );

  async function updateStatus(id: string, status: string) {
    await supabase.from("orders").update({ status }).eq("id", id);
    if (status === "delivered") {
      const order = orders.find(o => o.id === id);
      if (order) {
        const msg = encodeURIComponent(
          `Hi ${order.customer_name?.split(" ")[0]}! 🎁\n\nYour gift has been delivered!\nWe hope they absolutely loved it. 🎀\n\nThank you for choosing Wrap It Up!\n\n— Wrap It Up, Kampala`
        );
        window.open(`https://wa.me/${cleanPhone(order.phone)}?text=${msg}`, "_blank");
      }
    }
    load();
  }

  async function confirmPrice(order: any) {
    const price = parseInt(priceInputs[order.id] || "0") || order.total_price || order.price || 0;
    if (!price) { alert("Please enter a price first."); return; }
    setConfirming(order.id);
    await supabase.from("orders").update({
      confirmed_price: price, total_price: price,
      price: price, price_confirmed: true,
    }).eq("id", order.id);
    const ref  = order.order_ref || order.id.slice(0,8).toUpperCase();
    const name = order.customer_name?.split(" ")[0] || "there";
    const msg  = encodeURIComponent(
      `Hi ${name}! 🎁\n\nYour Wrap It Up order is confirmed!\n\n` +
      `📋 Order: ${ref}\n💰 Total: UGX ${price.toLocaleString()}\n🎀 Service: ${order.service}\n\n` +
      `Track your order & pay here:\n${SITE_URL}/track\n\n` +
      `Enter your phone number on that page to see your order.\n\nQuestions? Just reply here! 😊`
    );
    window.open(`https://wa.me/${cleanPhone(order.phone)}?text=${msg}`, "_blank");
    setConfirming(null);
    load();
  }

  async function resendLink(order: any) {
    const ref   = order.order_ref || order.id.slice(0,8).toUpperCase();
    const price = order.confirmed_price || order.total_price || order.price || 0;
    const name  = order.customer_name?.split(" ")[0] || "there";
    const msg   = encodeURIComponent(
      `Hi ${name}! 🎀\nHere is your Wrap It Up tracking link:\n📋 Order: ${ref}\n💰 Total: UGX ${price.toLocaleString()}\n\nTrack & pay: ${SITE_URL}/track`
    );
    window.open(`https://wa.me/${cleanPhone(order.phone)}?text=${msg}`, "_blank");
  }

  async function deleteOrder(id: string) {
    if (!confirm("Delete this order?")) return;
    await supabase.from("orders").delete().eq("id", id);
    load();
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-UG", { day:"numeric", month:"short", year:"numeric" });

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <div className="topbar">
          <h1 className="topbar-title">Orders</h1>
          <div className="topbar-actions">
            <input className="form-input" style={{width:"200px"}} placeholder="Search name, phone, ref..."
              value={search} onChange={e => setSearch(e.target.value)}/>
            <a href="/orders/new" className="btn btn-gold">+ New Order</a>
          </div>
        </div>
        <div className="page-content">
          <div style={{display:"flex",gap:"0.5rem",marginBottom:"1.5rem",flexWrap:"wrap"}}>
            {STATUSES.map(s => (
              <button key={s} className={`btn btn-sm ${filter===s?"btn-gold":"btn-outline"}`}
                onClick={() => setFilter(s)}>{STATUS_LABELS[s]}</button>
            ))}
          </div>
          <div className="table-card">
            <div className="table-header">
              <h2 className="table-title">
                {STATUS_LABELS[filter]} Orders
                <span style={{fontSize:"14px",color:"var(--text-muted)",marginLeft:"0.75rem",fontFamily:"Jost"}}>({filtered.length})</span>
              </h2>
            </div>
            {loading ? <div className="empty"><p>Loading...</p></div>
            : filtered.length === 0 ? (
              <div className="empty"><div className="empty-icon">🎁</div><p>No orders found.</p></div>
            ) : filtered.map(order => {
              const st  = STATUS_COLORS[order.status] || STATUS_COLORS.new;
              const pay = PAY_COLORS[order.payment_status || "unpaid"];
              const price = order.confirmed_price || order.total_price || order.price || 0;
              const paid  = order.paid_amount || 0;
              const owed  = Math.max(0, price - paid);
              const ref   = order.order_ref || "Pending";
              const priceConfirmed = order.price_confirmed;

              return (
                <div key={order.id} style={{borderBottom:"0.5px solid rgba(201,169,110,0.1)",padding:"1.25rem 1.5rem"}}>

                  {/* CUSTOMER INFO */}
                  <div style={{display:"flex",alignItems:"flex-start",gap:"1rem",marginBottom:"0.75rem",flexWrap:"wrap"}}>
                    <div style={{flex:1,minWidth:"200px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.3rem",flexWrap:"wrap"}}>
                        <strong style={{fontSize:"15px"}}>{order.customer_name}</strong>
                        <span style={{fontSize:"12px",color:"var(--gold)",fontFamily:"monospace",fontWeight:600,background:"rgba(201,169,110,0.1)",padding:"2px 8px",borderRadius:"3px"}}>
                          {ref}
                        </span>
                      </div>
                      <div style={{fontSize:"12px",color:"var(--text-muted)",marginBottom:"2px"}}>
                        {order.service} · {order.occasion} · {fmt(order.created_at)}
                      </div>
                      {order.phone && (
                        <a href={`https://wa.me/${cleanPhone(order.phone)}`}
                          target="_blank" rel="noopener noreferrer" className="wa-link" style={{fontSize:"12px"}}>
                          📱 {order.phone}
                        </a>
                      )}
                      {order.delivery_zone && <div style={{fontSize:"12px",color:"var(--text-muted)",marginTop:"2px"}}>📍 {order.delivery_zone}{order.delivery_address ? ` — ${order.delivery_address}` : ""}</div>}
                      {order.gift_description && <div style={{fontSize:"12px",color:"var(--text-muted)",marginTop:"2px"}}>🎁 {order.gift_description}</div>}
                      {(order.notes || order.message) && <div style={{fontSize:"12px",color:"var(--text-muted)",marginTop:"2px",fontStyle:"italic"}}>📝 {order.notes || order.message}</div>}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:"0.5rem",alignItems:"flex-end"}}>
                      <select className="status-select" value={order.status}
                        style={{background:st.bg,color:st.text,fontWeight:500}}
                        onChange={e => updateStatus(order.id, e.target.value)}>
                        <option value="new">⭐ New</option>
                        <option value="sourcing">🛍️ Sourcing Gift</option>
                        <option value="wrapping">🎁 Wrapping</option>
                        <option value="out_for_delivery">🚗 Out for Delivery</option>
                        <option value="delivered">✅ Delivered</option>
                        <option value="cancelled">❌ Cancelled</option>
                      </select>
                      <span className="badge" style={{background:pay.bg,color:pay.text,fontSize:"11px"}}>
                        💳 {order.payment_status || "unpaid"}
                      </span>
                      {price > 0 && <span style={{fontSize:"13px",fontWeight:600,color:"var(--gold)"}}>UGX {price.toLocaleString()}</span>}
                      {paid > 0 && owed > 0 && <span style={{fontSize:"11px",color:"#E05C5C"}}>Owed: UGX {owed.toLocaleString()}</span>}
                    </div>
                  </div>

                  {/* PRICE CONFIRM BAND */}
                  <div style={{
                    background: priceConfirmed ? "rgba(76,175,130,0.06)" : "rgba(201,169,110,0.06)",
                    border:`0.5px solid ${priceConfirmed ? "rgba(76,175,130,0.25)" : "rgba(201,169,110,0.25)"}`,
                    padding:"0.85rem 1rem", marginBottom:"0.75rem",
                    display:"flex", alignItems:"center", gap:"0.75rem", flexWrap:"wrap",
                  }}>
                    {priceConfirmed ? (
                      <>
                        <span style={{fontSize:"13px",color:"#0F6E56",fontWeight:500}}>✅ Price confirmed — UGX {price.toLocaleString()}</span>
                        <span style={{fontSize:"12px",color:"var(--text-muted)"}}>Customer sent tracking link via WhatsApp</span>
                        <button className="btn btn-outline btn-sm" style={{marginLeft:"auto"}} onClick={() => resendLink(order)}>
                          🔁 Resend link
                        </button>
                      </>
                    ) : (
                      <>
                        <span style={{fontSize:"13px",color:"var(--text-muted)",whiteSpace:"nowrap"}}>⏳ Set final price:</span>
                        <input type="number"
                          placeholder={price > 0 ? `Current: ${price.toLocaleString()}` : "Enter UGX amount..."}
                          value={priceInputs[order.id] || ""}
                          onChange={e => setPriceInputs(p => ({...p,[order.id]:e.target.value}))}
                          style={{flex:1,minWidth:"150px",maxWidth:"200px",background:"var(--white)",border:"1px solid rgba(201,169,110,0.3)",padding:"0.45rem 0.7rem",fontSize:"13px",color:"var(--dark)",outline:"none"}}
                        />
                        <button className="btn btn-gold btn-sm" disabled={confirming === order.id}
                          onClick={() => confirmPrice(order)}>
                          {confirming === order.id ? "Sending..." : "✦ Confirm & notify customer"}
                        </button>
                      </>
                    )}
                  </div>

                  {/* ACTIONS */}
                  <div style={{display:"flex",gap:"0.6rem",flexWrap:"wrap"}}>
                    <a href={`https://wa.me/${cleanPhone(order.phone || "")}`}
                      target="_blank" rel="noopener noreferrer"
                      className="btn btn-outline btn-sm" style={{color:"#25D366",borderColor:"rgba(37,211,102,0.4)"}}>
                      💬 WhatsApp
                    </a>
                    <a href={`tel:${cleanPhone(order.phone || "")}`} className="btn btn-outline btn-sm">📞 Call</a>
                    {order.status !== "delivered" && (
                      <button className="btn btn-outline btn-sm" style={{color:"#0F6E56",borderColor:"rgba(76,175,130,0.4)"}}
                        onClick={() => updateStatus(order.id, "delivered")}>
                        ✅ Mark Delivered
                      </button>
                    )}
                    <button className="btn btn-danger btn-sm" style={{marginLeft:"auto"}} onClick={() => deleteOrder(order.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}