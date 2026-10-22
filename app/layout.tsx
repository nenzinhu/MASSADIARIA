import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Massa Diária — Calorias e progresso",
  description: "Diário pessoal para acompanhar calorias, macronutrientes e evolução no ganho de massa.",
};

export const viewport: Viewport = {
  themeColor: "#102a43",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
