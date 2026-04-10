import { Logo } from "../components";

export default function TermsPage() {
  return (
    <div className="min-h-screen px-6 py-20">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <Logo size={48} />
          <h1 className="text-3xl font-bold mt-6 mb-2">Terms of Service</h1>
          <p className="text-sm text-[#6B7280]">Last updated: April 10, 2026</p>
        </div>

        <div className="space-y-8 text-[#C0C8D8] text-base leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-[#E8EDF3] mb-3">Acceptance</h2>
            <p>
              By downloading MakoBot or using makobot.com, you agree to these
              terms. If you do not agree, do not use the software or website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#E8EDF3] mb-3">License</h2>
            <p>
              MakoBot is provided as a free desktop application. You are granted
              a non-exclusive, non-transferable license to use MakoBot on your
              personal computers. You may not redistribute, sell, or reverse
              engineer the software.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#E8EDF3] mb-3">License Keys</h2>
            <p>
              Each license key is personal to the Google account used to generate
              it. Keys may not be shared, sold, or transferred. Mako Logics
              reserves the right to revoke keys that are misused.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#E8EDF3] mb-3">The Software</h2>
            <p>
              MakoBot is provided &quot;as is&quot; without warranty of any kind.
              Mako Logics is not liable for any damages arising from the use of
              the software. MakoBot stores all data locally on your computer —
              you are responsible for backing up your own data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#E8EDF3] mb-3">Changes</h2>
            <p>
              We may update these terms from time to time. Continued use of
              MakoBot after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#E8EDF3] mb-3">Contact</h2>
            <p>
              Mako Logics<br />
              Email: russell.sailors@gmail.com
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-[#374151]/30">
          <a href="/" className="text-sm text-[#6B7280] hover:text-[#8B95A8]">
            &larr; Back to makobot.com
          </a>
        </div>
      </div>
    </div>
  );
}
