import Link from "next/link";

const sections = [
  {
    title: "Overview",
    body: "This Cookie Policy explains how Tact0 uses cookies and similar technologies to operate the client interface, maintain security, and understand service usage. It does not cover all personal data processing. Please refer to our Privacy Policy for details.",
  },
  {
    title: "What are cookies",
    body: "Cookies are small text files stored on your device. We also use similar technologies such as local storage and device identifiers for comparable purposes. We refer to these collectively as cookies in this policy.",
  },
  {
    title: "Necessary cookies",
    body: "These cookies are required for core functionality such as authentication, security protections, and feature enablement. They cannot be disabled without impacting service availability.",
  },
  {
    title: "Analytics cookies",
    body: "Analytics cookies help us understand usage patterns and improve performance. They do not directly identify you, but may collect aggregated usage signals.",
  },
  {
    title: "Marketing cookies",
    body: "Marketing cookies help us measure the effectiveness of outreach and campaigns. If used, they are configured to minimize data collection and focus on campaign performance.",
  },
  {
    title: "Managing cookies",
    body: "You can control cookie settings in your browser. Disabling cookies may affect how the application functions. If you use multiple devices or browsers, update settings for each.",
  },
  {
    title: "Contact",
    body: "For questions about this policy, contact privacy@tact0.com.",
  },
];

export const dynamic = "force-static";

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Last updated: January 02, 2026
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold">Cookie Policy</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Transparent, security-first cookie usage for the Tact0 client
            interface.
          </p>
        </div>

        <div className="mt-8 max-h-[60vh] space-y-6 overflow-y-auto pr-2">
          {sections.map((section) => (
            <section key={section.title} className="space-y-2">
              <h2 className="text-lg md:text-xl font-semibold">
                {section.title}
              </h2>
              <p className="text-sm md:text-base text-muted-foreground">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-10 text-sm text-muted-foreground">
          <span>Related: </span>
          <Link
            href="/privacy"
            className="underline hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
