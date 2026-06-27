"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const links = [
  { href: "/dashboard", icon: "📊", label: "Overview" },
  { href: "/orders",    icon: "🎁", label: "Orders" },
  { href: "/customers", icon: "👥", label: "Customers" },
  { href: "/orders/new",icon: "➕", label: "New Order" },
];

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();

  function logout() {
    localStorage.removeItem("wiu_auth");
    localStorage.removeItem("wiu_user");
    router.push("/login");
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Image
          src="/logo.png"
          alt="Wrap It Up"
          width={120}
          height={120}
          style={{objectFit:"contain", filter:"brightness(0) invert(1)"}}
        />
        <div className="sidebar-subtitle" style={{marginTop:"0.5rem"}}>Admin Dashboard</div>
      </div>

      <nav className="sidebar-nav">
        {links.map((l) => (
          <Link key={l.href} href={l.href}
            className={`nav-item ${path === l.href ? "active" : ""}`}>
            <span className="nav-icon">{l.icon}</span>
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          onClick={logout}
          style={{background:"none",border:"none",color:"rgba(255,255,255,0.3)",fontSize:"12px",cursor:"pointer",padding:0,letterSpacing:"0.05em"}}>
          Sign out →
        </button>
      </div>
    </aside>
  );
}