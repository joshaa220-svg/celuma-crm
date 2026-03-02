import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Celuma CRM",
  description: "CRM local para gestionar clientes y proveedores",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
