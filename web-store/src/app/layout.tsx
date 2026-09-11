import type { Metadata } from "next";
import "./globals.css";
import ChatBox from "@/components/ChatBox";

export const metadata: Metadata = {
  title: "LÀNH — Nông sản hữu cơ minh bạch",
  description: "Nông sản hữu cơ minh bạch",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" data-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Public+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <ChatBox />
      </body>
    </html>
  );
}
