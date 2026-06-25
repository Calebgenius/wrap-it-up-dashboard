"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

const links = [
  { href: "/dashboard", icon: "📊", label: "Overview" },
  { href: "/orders",    icon: "🎁", label: "Orders" },
  { href: "/customers", icon: "👥", label: "Customers" },
  { href: "/orders/new",icon: "➕", label: "New Order" },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-text">wrap <span>it</span> up</div>
        <div className="sidebar-subtitle">Admin Dashboard</div>
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
        © 2026 Wrap It Up · Kampala
      </div>
    </aside>
  );
}