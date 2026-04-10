import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MakoBot — Never Lose a Conversation Again",
  description:
    "MakoBot gives your AI tools a permanent memory. It automatically records code changes, conversations, and notes into a central brain that every AI tool can read. Free Windows desktop app by Mako Logics.",
  keywords: [
    "AI memory",
    "Claude Code",
    "AI session persistence",
    "developer tools",
    "Windows app",
    "MakoBot",
    "Mako Logics",
  ],
  openGraph: {
    title: "MakoBot — Never Lose a Conversation Again",
    description:
      "Give your AI tools a permanent memory. MakoBot automatically records everything into a central brain that every AI tool can read.",
    url: "https://makobot.com",
    siteName: "MakoBot",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
