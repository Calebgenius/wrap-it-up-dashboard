"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const USERS = [
  { email: "admin@wrapitup.ug",  password: "WrapAdmin2026!" },
  { email: "sis@wrapitup.ug",    password: "WrapSis2026!" },
];

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const match = USERS.find(u => u.email === form.email && u.password === form.password);
    if (match) {
      localStorage.setItem("wiu_auth", "true");
      localStorage.setItem("wiu_user", form.email);
      router.push("/dashboard");
    } else {
      setError("Incorrect email or password.");
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight:"100vh", background:"#1E1A16",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"Jost, sans-serif"
    }}>
      <div style={{ width:"380px" }}>

        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
          <div style={{
            fontFamily:"Georgia, serif", fontSize:"32px",
            color:"#FFFFFF", marginBottom:"0.5rem"
          }}>
            wrap <span style={{color:"#C9A96E"}}>it</span> up
          </div>
          <div style={{
            fontSize:"11px", letterSpacing:"0.2em",
            textTransform:"uppercase", color:"rgba(255,255,255,0.3)"
          }}>Admin Dashboard</div>
        </div>

        {/* Card */}
        <div style={{
          background:"#FAF7F2", padding:"2.5rem",
          borderTop:"3px solid #C9A96E"
        }}>
          <h1 style={{
            fontFamily:"Georgia, serif", fontSize:"24px",
            color:"#1E1A16", marginBottom:"0.5rem"
          }}>Welcome back</h1>
          <p style={{ fontSize:"13px", color:"#6B5F50", marginBottom:"2rem" }}>
            Sign in to manage your orders
          </p>

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem" }}>
              <label style={{ fontSize:"11px", letterSpacing:"0.15em", textTransform:"uppercase", color:"#6B5F50", fontWeight:500 }}>
                Email
              </label>
              <input
                type="email" required
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                placeholder="admin@wrapitup.ug"
                style={{
                  background:"#F5F0E8", border:"1px solid rgba(201,169,110,0.3)",
                  padding:"0.7rem 0.9rem", fontFamily:"Jost, sans-serif",
                  fontSize:"14px", color:"#1E1A16", outline:"none", width:"100%"
                }}
              />
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem" }}>
              <label style={{ fontSize:"11px", letterSpacing:"0.15em", textTransform:"uppercase", color:"#6B5F50", fontWeight:500 }}>
                Password
              </label>
              <input
                type="password" required
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                placeholder="••••••••"
                style={{
                  background:"#F5F0E8", border:"1px solid rgba(201,169,110,0.3)",
                  padding:"0.7rem 0.9rem", fontFamily:"Jost, sans-serif",
                  fontSize:"14px", color:"#1E1A16", outline:"none", width:"100%"
                }}
              />
            </div>

            {error && (
              <p style={{ fontSize:"13px", color:"#E05C5C", background:"rgba(224,92,92,0.08)", padding:"0.6rem 0.9rem" }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} style={{
              background:"#C9A96E", color:"#FFFFFF", border:"none",
              padding:"0.85rem", fontFamily:"Jost, sans-serif",
              fontSize:"13px", letterSpacing:"0.12em", textTransform:"uppercase",
              cursor:"pointer", fontWeight:500, marginTop:"0.5rem"
            }}>
              {loading ? "Signing in..." : "Sign in ✦"}
            </button>
          </form>
        </div>

        <p style={{ textAlign:"center", marginTop:"1.5rem", fontSize:"12px", color:"rgba(255,255,255,0.2)" }}>
          Wrap It Up · Kampala, Uganda
        </p>
      </div>
    </div>
  );
}