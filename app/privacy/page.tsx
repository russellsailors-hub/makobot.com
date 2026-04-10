import { Logo } from "../components";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen px-6 py-20">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <Logo size={48} />
          <h1 className="text-3xl font-bold mt-6 mb-2">Privacy Policy</h1>
          <p className="text-sm text-[#6B7280]">Last updated: April 10, 2026</p>
        </div>

        <div className="space-y-8 text-[#C0C8D8] text-base leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-[#E8EDF3] mb-3">What We Collect</h2>
            <p>
              When you sign in with Google to get a license key, we collect your
              name, email address, and profile picture. This information is used
              solely to generate your license key and provide access to your
              account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#E8EDF3] mb-3">The MakoBot Desktop App</h2>
            <p>
              MakoBot (the Windows desktop application) is 100% local. It does
              not send any data to our servers or any third party. All your
              project data, notes, conversations, and memory files stay on your
              computer. The app does not phone home, track usage, or collect
              telemetry.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#E8EDF3] mb-3">Website Analytics</h2>
            <p>
              We track basic page views on makobot.com (page path, referrer, and
              IP address) to understand how people find and use the site. This
              data is stored in our own database and is not shared with third
              parties. We do not use cookies for tracking.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#E8EDF3] mb-3">How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To generate and manage your license key</li>
              <li>To track downloads for internal analytics</li>
              <li>To communicate with you about MakoBot (only if you contact us first)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#E8EDF3] mb-3">Data Sharing</h2>
            <p>
              We do not sell, rent, or share your personal information with third
              parties. Your data is stored securely and accessed only by Mako
              Logics for the purposes described above.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#E8EDF3] mb-3">Data Deletion</h2>
            <p>
              You can request deletion of your account and associated data by
              contacting us. We will remove your information from our database
              within 30 days.
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
