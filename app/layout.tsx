import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Facebook Ads Content Score — Chấm điểm content trước khi đốt tiền quảng cáo",
  description:
    "AI chấm điểm content quảng cáo Facebook, dự đoán CTR Potential, cảnh báo rủi ro chính sách và viết lại bản tối ưu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
