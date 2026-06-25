import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wrap It Up — Admin Dashboard",
  description: "Order management dashboard for Wrap It Up",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}