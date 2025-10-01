import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Random Private Key Generator",
  description: "Generate random Bitcoin and Ethereum keys with style.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-dvh bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 bg-no-repeat bg-fixed text-foreground antialiased selection:bg-indigo-500/30 selection:text-indigo-100">
        {children}
      </body>
    </html>
  );
}
