import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Happy Pocket - Smart UPI Banking & Financial Visibility",
  description: "Seamless UPI payments, expense tracking, bank statement intelligence, and hidden savings with Happy Pocket",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#eef2f6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body 
        className="min-h-full flex flex-col bg-[#eef2f6] text-slate-900 antialiased selection:bg-orange-500 selection:text-white"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
