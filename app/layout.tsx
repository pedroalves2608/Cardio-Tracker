import type { Metadata, Viewport } from "next";
import "./globals.css";
import { NavWrapper } from "@/components/NavWrapper";
import { RegisterSW } from "@/components/RegisterSW";
import { ClientToaster } from "@/components/ClientToaster";

export const metadata: Metadata = {
  title: "Cardio Tracker",
  description: "Registre treinos de cardio e acompanhe seu progresso",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#556B2F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col items-center bg-sand-50">
        <RegisterSW />
        <ClientToaster />
        <NavWrapper />
        <main className="w-full max-w-app flex-1 flex flex-col mx-auto pb-safe">
          {children}
        </main>
      </body>
    </html>
  );
}
