import {
  Logo,
  AiBadge,
  FeatureCard,
  StepCard,
  CompetitorRow,
  StatCard,
  SectionHeading,
  Nav,
  Footer,
} from "./components";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav />

      {/* ─── HERO ─── */}
      <section
        id="hero"
        className="relative flex flex-col items-center justify-center px-6 pt-32 pb-24 overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#3B82F6] opacity-[0.07] blur-[120px] pointer-events-none" />

        <div className="animate-float mb-8">
          <Logo size={120} />
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center max-w-3xl leading-tight mb-6">
          Never Lose a Conversation{" "}
          <span className="gradient-text">Again</span>
        </h1>

        <p className="text-lg sm:text-xl text-[#C0C8D8] text-center max-w-2xl mb-4 leading-relaxed">
          MakoBot gives your AI tools a permanent memory. It runs quietly on
          your PC and automatically records everything — code changes,
          conversations, notes — into one central brain that every AI tool can
          read.
        </p>

        <p className="text-base text-[#8B95A8] text-center mb-8">
          When you start a new session, the AI already knows who you are, what
          you&apos;ve been working on, and where you left off.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <a
            href="#download"
            className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-lg transition-colors"
          >
            Download Free for Windows
          </a>
          <a
            href="#features"
            className="inline-flex items-center justify-center px-8 py-4 rounded-lg border border-[#374151] hover:border-[#4B5563] text-[#C0C8D8] font-medium text-lg transition-colors"
          >
            See Features
          </a>
        </div>

        {/* AI tool badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <AiBadge name="Claude" color="#3B82F6" />
          <AiBadge name="Antigravity" color="#8B5CF6" />
          <AiBadge name="Cursor" color="#F59E0B" />
          <AiBadge name="Windsurf" color="#10B981" />
          <AiBadge name="Gemini" color="#EC4899" />
          <AiBadge name="ChatGPT" color="#6366F1" />
        </div>

        <p className="text-sm text-[#6B7280]">
          Works with every AI coding tool. Windows 10/11.
        </p>
      </section>

      {/* ─── THE PROBLEM ─── */}
      <section className="px-6 py-20 bg-[#252B3B]/50">
        <div className="max-w-4xl mx-auto text-center">
          <SectionHeading
            title="Sound Familiar?"
            subtitle="Every AI coder hits these walls"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-[#252B3B] rounded-xl p-6 border border-[#374151]">
              <div className="text-3xl mb-4">💬</div>
              <p className="text-[#E8EDF3] text-base font-medium mb-2">
                &quot;Where did I leave off?&quot;
              </p>
              <p className="text-[#8B95A8] text-sm">
                Every new AI session starts from zero. You spend 10 minutes
                re-explaining your project before you can do any actual work.
              </p>
            </div>
            <div className="bg-[#252B3B] rounded-xl p-6 border border-[#374151]">
              <div className="text-3xl mb-4">🔌</div>
              <p className="text-[#E8EDF3] text-base font-medium mb-2">
                &quot;Session crashed — everything&apos;s gone&quot;
              </p>
              <p className="text-[#8B95A8] text-sm">
                Hours of decisions, progress, and context vanish when a session
                disconnects or hits a context limit.
              </p>
            </div>
            <div className="bg-[#252B3B] rounded-xl p-6 border border-[#374151]">
              <div className="text-3xl mb-4">🔀</div>
              <p className="text-[#E8EDF3] text-base font-medium mb-2">
                &quot;I use 3 AI tools and none of them talk&quot;
              </p>
              <p className="text-[#8B95A8] text-sm">
                Claude doesn&apos;t know what you told ChatGPT. Cursor
                doesn&apos;t know what Gemini decided. Each tool is an island.
              </p>
            </div>
          </div>

          <p className="mt-10 text-xl text-[#3B82F6] font-semibold">
            MakoBot fixes all of this.
          </p>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <SectionHeading
            title="How It Works"
            subtitle="Three steps, zero configuration"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <StepCard
              step={1}
              title="Install and Add Projects"
              description="Run MakoBot and point it at your project folders. That's it. It starts watching automatically."
            />
            <StepCard
              step={2}
              title="Work Like Normal"
              description="Use any AI tool — Claude, ChatGPT, Cursor, Gemini. MakoBot silently records commits, conversations, and decisions in the background."
            />
            <StepCard
              step={3}
              title="Every Session Knows Everything"
              description="When you start a new AI session, MakoBot has already written the context. The AI knows your projects, your preferences, and where you left off."
            />
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="px-6 py-20 bg-[#252B3B]/50">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            title="Everything You Need"
            subtitle="Built by someone who lost too many AI sessions"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <FeatureCard
              icon="🧠"
              title="Central Brain"
              description="One brain.md file knows everything across all your projects. Every AI tool reads the same source of truth."
            />
            <FeatureCard
              icon="📂"
              title="Project Watching"
              description="Add folders, MakoBot watches them. Git commits are captured automatically with diff summaries. Pause or remove projects any time."
            />
            <FeatureCard
              icon="💉"
              title="Auto-Injection"
              description="MakoBot writes context directly into CLAUDE.md, AGENTS.md, and .cursorrules. Zero-friction for Claude Code, Antigravity, Cursor, and Windsurf."
            />
            <FeatureCard
              icon="📋"
              title="One-Click Clipboard"
              description="For ChatGPT, Gemini, or any web AI — one click copies your project context and opens the browser. Paste and go."
            />
            <FeatureCard
              icon="🔵"
              title="Floating Widget"
              description="A small draggable circle on your desktop. Hover to see project cards with instant Copy, ChatGPT, Claude, Gemini, and Cursor buttons."
            />
            <FeatureCard
              icon="📊"
              title="Live Dashboard"
              description="Activity feed, storage breakdown, context budget meter, project management, settings — all in one clean dark interface with 10 tabs."
            />
            <FeatureCard
              icon="📸"
              title="Screen Capture + OCR"
              description="Global hotkey to capture any screen region across all monitors. Built-in OCR extracts the text. Save as a note or import to brain."
            />
            <FeatureCard
              icon="🎤"
              title="Voice-to-Text Notes"
              description="Click the mic button, speak your note, and it's saved to your brain. Uses Windows Speech Recognition — no cloud, no API key."
            />
            <FeatureCard
              icon="🛠️"
              title="Skills Library"
              description="Create, import, and manage AI skills. Assign them per-project or globally. Auto-injected into your AI tools alongside context."
            />
            <FeatureCard
              icon="🔌"
              title="MCP Server"
              description="Built-in MCP server on localhost:7777. Any MCP-compatible tool can search your memory, read your brain, add notes — programmatically."
            />
            <FeatureCard
              icon="⚙️"
              title="Preferences Sync"
              description="Write your working preferences once. MakoBot pushes them to Claude, Antigravity, Cursor, and Windsurf config files simultaneously."
            />
            <FeatureCard
              icon="🔒"
              title="100% Private"
              description="Everything stays on your computer. No cloud, no accounts, no telemetry. Your data never leaves your machine."
            />
          </div>
        </div>
      </section>

      {/* ─── AI TOOL COMPATIBILITY ─── */}
      <section id="compatibility" className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <SectionHeading
            title="Works With Every AI Tool"
            subtitle="Automatic injection for local tools, one-click clipboard for web tools"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {/* Fully Automatic */}
            <div className="bg-[#252B3B] rounded-xl p-6 border border-[#374151]">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-[#10B981] animate-pulse-dot" />
                <h3 className="text-lg font-semibold text-[#E8EDF3]">
                  Fully Automatic
                </h3>
              </div>
              <p className="text-sm text-[#8B95A8] mb-4">
                MakoBot writes context directly into their config files. No
                manual steps.
              </p>
              <div className="flex flex-col gap-2">
                <AiBadge name="Claude Code" color="#3B82F6" />
                <AiBadge name="Antigravity" color="#8B5CF6" />
                <AiBadge name="Cursor" color="#F59E0B" />
                <AiBadge name="Windsurf" color="#10B981" />
              </div>
            </div>

            {/* One-Click */}
            <div className="bg-[#252B3B] rounded-xl p-6 border border-[#374151]">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#3B82F6] text-lg">⚡</span>
                <h3 className="text-lg font-semibold text-[#E8EDF3]">
                  One Click
                </h3>
              </div>
              <p className="text-sm text-[#8B95A8] mb-4">
                Click the button in MakoBot&apos;s widget. It copies context and
                opens the browser.
              </p>
              <div className="flex flex-col gap-2">
                <AiBadge name="ChatGPT" color="#6366F1" />
                <AiBadge name="Claude Web" color="#3B82F6" />
                <AiBadge name="Google Gemini" color="#EC4899" />
              </div>
            </div>

            {/* Any Tool */}
            <div className="bg-[#252B3B] rounded-xl p-6 border border-[#374151]">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#8B95A8] text-lg">📋</span>
                <h3 className="text-lg font-semibold text-[#E8EDF3]">
                  Any Tool
                </h3>
              </div>
              <p className="text-sm text-[#8B95A8] mb-4">
                Copy context to clipboard and paste into any AI tool. Import
                conversations back with one click.
              </p>
              <div className="text-sm text-[#C0C8D8]">
                <p>Copy Context → paste anywhere</p>
                <p>Import Clipboard → save conversations back</p>
                <p className="mt-2 text-[#8B95A8]">
                  Works with literally any AI tool
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="px-6 py-16 bg-[#252B3B]/50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard value="77 MB" label="Single exe, no installer needed" />
            <StatCard value="0" label="Cloud dependencies" />
            <StatCard value="6+" label="AI tools supported" />
            <StatCard value="∞" label="Sessions remembered" />
          </div>
        </div>
      </section>

      {/* ─── COMPETITOR COMPARISON ─── */}
      <section id="compare" className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <SectionHeading
            title="Nothing Else Does This"
            subtitle="Other tools exist, but none are a simple desktop app that works passively across multiple AI tools"
          />

          <div className="mt-12 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#374151]">
                  <th className="py-4 px-4 text-[#8B95A8] font-medium text-sm">
                    Feature
                  </th>
                  <th className="py-4 px-4 text-[#3B82F6] font-semibold text-sm">
                    MakoBot
                  </th>
                  <th className="py-4 px-4 text-[#8B95A8] font-medium text-sm">
                    Mem0
                  </th>
                  <th className="py-4 px-4 text-[#8B95A8] font-medium text-sm">
                    Letta
                  </th>
                  <th className="py-4 px-4 text-[#8B95A8] font-medium text-sm">
                    Others
                  </th>
                </tr>
              </thead>
              <tbody>
                <CompetitorRow
                  feature="Desktop app with GUI"
                  mako={true}
                  others={[false, false, false]}
                />
                <CompetitorRow
                  feature="Works across multiple AI tools"
                  mako={true}
                  others={[false, false, false]}
                />
                <CompetitorRow
                  feature="Zero configuration"
                  mako={true}
                  others={[false, false, false]}
                />
                <CompetitorRow
                  feature="100% local / private"
                  mako={true}
                  others={[false, false, false]}
                />
                <CompetitorRow
                  feature="Auto-captures git commits"
                  mako={true}
                  others={[false, false, false]}
                />
                <CompetitorRow
                  feature="Floating widget"
                  mako={true}
                  others={[false, false, false]}
                />
                <CompetitorRow
                  feature="Built-in MCP server"
                  mako={true}
                  others={[true, true, false]}
                />
                <CompetitorRow
                  feature="No API key or cloud account needed"
                  mako={true}
                  others={[false, false, false]}
                />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── WHAT'S INSIDE ─── */}
      <section className="px-6 py-20 bg-[#252B3B]/50">
        <div className="max-w-4xl mx-auto">
          <SectionHeading
            title="What's Inside the Dashboard"
            subtitle="10 tabs, zero clutter"
          />

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-12">
            {[
              { name: "Activity", desc: "Live event feed" },
              { name: "Projects", desc: "Folder management" },
              { name: "Notes", desc: "Manual + voice notes" },
              { name: "Skills", desc: "AI skill library" },
              { name: "Guide", desc: "Built-in docs" },
              { name: "Config", desc: "AI tool config" },
              { name: "Prefs", desc: "Working preferences" },
              { name: "Settings", desc: "App settings" },
              { name: "Privacy", desc: "Data control" },
              { name: "About", desc: "Version info" },
            ].map((tab) => (
              <div
                key={tab.name}
                className="bg-[#252B3B] rounded-lg p-4 border border-[#374151] text-center feature-card"
              >
                <p className="text-[#3B82F6] font-semibold text-base mb-1">
                  {tab.name}
                </p>
                <p className="text-[#8B95A8] text-xs">{tab.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DOWNLOAD CTA ─── */}
      <section id="download" className="px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <Logo size={80} />
          <h2 className="text-3xl sm:text-4xl font-bold mt-8 mb-4">
            Ready to Give Your AI a Memory?
          </h2>
          <p className="text-lg text-[#C0C8D8] mb-8 max-w-xl mx-auto">
            Download MakoBot, add your project folders, and never re-explain
            your work to an AI again. Free. Private. No account needed.
          </p>

          <a
            href="#"
            className="inline-flex items-center justify-center px-10 py-5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-xl transition-colors blue-glow"
          >
            Download MakoBot for Windows
          </a>

          <p className="mt-4 text-sm text-[#6B7280]">
            Windows 10/11 · .NET 8 · Single exe · ~77 MB · No installer needed
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <AiBadge name="Claude" color="#3B82F6" />
            <AiBadge name="Antigravity" color="#8B5CF6" />
            <AiBadge name="Cursor" color="#F59E0B" />
            <AiBadge name="Windsurf" color="#10B981" />
            <AiBadge name="Gemini" color="#EC4899" />
            <AiBadge name="ChatGPT" color="#6366F1" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
