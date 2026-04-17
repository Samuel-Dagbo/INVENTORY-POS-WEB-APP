import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "Inventory & POS System",
  description: "Full-featured inventory management and point-of-sale system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} ${jakarta.variable} font-sans m-0 p-0 h-full`}>{children}</body>
    </html>
  );
}
