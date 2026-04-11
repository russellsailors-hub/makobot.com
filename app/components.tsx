"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

/* ─── LOGO ─── */
export function Logo({ size = 64 }: { size?: number }) {
  const fontSize = Math.round(size * 0.45);
  return (
    <div
      className="relative rounded-full flex items-center justify-center logo-ring mx-auto"
      style={{
        width: size,
        height: size,
        background: "#1E2330",
        border: `${Math.max(3, Math.round(size * 0.04))}px solid #3B82F6`,
      }}
    >
      <span
        className="font-bold text-white select-none"
        style={{ fontSize, lineHeight: 1 }}
      >
        M
      </span>
    </div>
  );
}

/* ─── AI BADGE PILL ─── */
export function AiBadge({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="badge-pill"
      style={{ backgroundColor: color }}
    >
      {name}
    </span>
  );
}

/* ─── FEATURE CARD ─── */
export function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-[#252B3B] rounded-xl p-6 border border-[#374151] feature-card">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-[#E8EDF3] mb-2">{title}</h3>
      <p className="text-sm text-[#8B95A8] leading-relaxed">{description}</p>
    </div>
  );
}

/* ─── STEP CARD ─── */
export function StepCard({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div className="relative bg-[#252B3B] rounded-xl p-6 border border-[#374151]">
      <div className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center text-white font-bold text-lg mb-4">
        {step}
      </div>
      <h3 className="text-lg font-semibold text-[#E8EDF3] mb-2">{title}</h3>
      <p className="text-sm text-[#8B95A8] leading-relaxed">{description}</p>
    </div>
  );
}

/* ─── COMPETITOR ROW ─── */
export function CompetitorRow({
  feature,
  mako,
  others,
}: {
  feature: string;
  mako: boolean;
  others: boolean[];
}) {
  const Check = () => (
    <span className="text-[#10B981] font-bold text-lg">✓</span>
  );
  const Cross = () => (
    <span className="text-[#DC2626] font-bold text-lg">✗</span>
  );

  return (
    <tr className="border-b border-[#374151]/50">
      <td className="py-3 px-4 text-sm text-[#C0C8D8]">{feature}</td>
      <td className="py-3 px-4 text-center">
        {mako ? <Check /> : <Cross />}
      </td>
      {others.map((v, i) => (
        <td key={i} className="py-3 px-4 text-center">
          {v ? <Check /> : <Cross />}
        </td>
      ))}
    </tr>
  );
}

/* ─── STAT CARD ─── */
export function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl sm:text-4xl font-bold text-[#3B82F6]">{value}</p>
      <p className="text-sm text-[#8B95A8] mt-1">{label}</p>
    </div>
  );
}

/* ─── SECTION HEADING ─── */
export function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="text-center">
      <h2 className="text-3xl sm:text-4xl font-bold text-[#E8EDF3]">
        {title}
      </h2>
      <p className="mt-3 text-lg text-[#8B95A8]">{subtitle}</p>
    </div>
  );
}

/* ─── NAV ─── */
export function Nav() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1E2330]/90 backdrop-blur-md border-b border-[#374151]/50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        <a href="/" className="flex items-center gap-3">
          <Logo size={36} />
          <span className="text-lg font-bold text-[#E8EDF3]">MakoBot</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="/#how-it-works"
            className="text-sm text-[#8B95A8] hover:text-[#E8EDF3] transition-colors"
          >
            How It Works
          </a>
          <a
            href="/#features"
            className="text-sm text-[#8B95A8] hover:text-[#E8EDF3] transition-colors"
          >
            Features
          </a>
          <a
            href="/#compatibility"
            className="text-sm text-[#8B95A8] hover:text-[#E8EDF3] transition-colors"
          >
            Compatibility
          </a>
          <a
            href="/#compare"
            className="text-sm text-[#8B95A8] hover:text-[#E8EDF3] transition-colors"
          >
            Compare
          </a>
          <a
            href="/exchange"
            className="text-sm text-[#8B95A8] hover:text-[#E8EDF3] transition-colors"
          >
            Exchange
          </a>
          <a
            href="/#download"
            className="inline-flex items-center px-5 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold transition-colors"
          >
            Download
          </a>
          {session?.user?.isAdmin && (
            <a
              href="/admin"
              className="text-sm text-[#8B95A8] hover:text-[#E8EDF3] transition-colors"
            >
              Admin
            </a>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-[#8B95A8] hover:text-[#E8EDF3] p-2"
          aria-label="Toggle menu"
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            {open ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-[#252B3B] border-t border-[#374151] px-6 py-4 flex flex-col gap-4">
          <a
            href="/#how-it-works"
            onClick={() => setOpen(false)}
            className="text-sm text-[#C0C8D8]"
          >
            How It Works
          </a>
          <a
            href="/#features"
            onClick={() => setOpen(false)}
            className="text-sm text-[#C0C8D8]"
          >
            Features
          </a>
          <a
            href="/#compatibility"
            onClick={() => setOpen(false)}
            className="text-sm text-[#C0C8D8]"
          >
            Compatibility
          </a>
          <a
            href="/#compare"
            onClick={() => setOpen(false)}
            className="text-sm text-[#C0C8D8]"
          >
            Compare
          </a>
          <a
            href="/exchange"
            onClick={() => setOpen(false)}
            className="text-sm text-[#C0C8D8]"
          >
            Exchange
          </a>
          <a
            href="/#download"
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center px-5 py-2 rounded-lg bg-[#3B82F6] text-white text-sm font-semibold"
          >
            Download
          </a>
          {session?.user?.isAdmin && (
            <a
              href="/admin"
              onClick={() => setOpen(false)}
              className="text-sm text-[#8B95A8]"
            >
              Admin
            </a>
          )}
        </div>
      )}
    </nav>
  );
}

/* ─── FOOTER ─── */
export function Footer() {
  return (
    <footer className="border-t border-[#374151]/50 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <Logo size={32} />
            <div>
              <p className="text-sm font-semibold text-[#E8EDF3]">MakoBot</p>
              <p className="text-xs text-[#6B7280]">by Mako Logics</p>
            </div>
          </div>

          <div className="text-center md:text-right">
            <p className="text-sm text-[#8B95A8] mb-1">
              Part of the{" "}
              <span className="text-[#E8EDF3] font-medium">MakoBytes</span>{" "}
              product family
            </p>
            <div className="flex gap-4 text-xs text-[#6B7280]">
              <a href="https://www.makobytes.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#C0C8D8] transition-colors">PromptPixel</a>
              <span>·</span>
              <a href="https://aipromptshive.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#C0C8D8] transition-colors">AI Prompt Hive</a>
              <span>·</span>
              <span className="text-[#3B82F6]">MakoBot</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#374151]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#4B5563]">
            &copy; {new Date().getFullYear()} Mako Logics. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-[#6B7280]">
            <a href="/privacy" className="hover:text-[#C0C8D8] transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-[#C0C8D8] transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
