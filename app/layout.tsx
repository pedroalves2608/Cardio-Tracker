import type { Metadata } from "next";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Cardio Tracker",
  description: "Registre treinos de cardio e acompanhe seu progresso",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col items-center">
        <main className="w-full max-w-app flex-1 flex flex-col pb-20 pb-safe">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
