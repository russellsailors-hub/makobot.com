import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Skills Exchange | MakoBot",
  description:
    "Browse, share, and download AI skills, prompts, configs, and tools across Claude, ChatGPT, Gemini, Cursor, and more. The universal hub for AI productivity.",
  openGraph: {
    title: "AI Skills Exchange | MakoBot",
    description:
      "The universal marketplace for AI skills, prompts, global configs, MCP servers, hooks, and agents.",
  },
};

export default function ExchangeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
