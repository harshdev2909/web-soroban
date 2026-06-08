"use client"

import { LegalPage, Section, Bullets } from "@/components/legal-page"

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="June 8, 2026"
      intro="This Privacy Policy explains what information WebSoroban collects when you use the service, how it is used, and the choices you have. WebSoroban is a browser-based IDE for writing, compiling, and deploying Stellar/Soroban smart contracts on testnet."
    >
      <Section title="1. Information we collect">
        <p>We collect only what we need to operate the service:</p>
        <Bullets
          items={[
            <><strong className="font-medium text-foreground">Account information</strong> — when you sign in through a third-party provider (e.g. Google), we receive your email address, name, and profile picture.</>,
            <><strong className="font-medium text-foreground">Project data</strong> — the contract source files and project metadata you create or import.</>,
            <><strong className="font-medium text-foreground">Usage data</strong> — counts and timestamps of actions such as compiles, deployments, and function tests.</>,
            <><strong className="font-medium text-foreground">Wallet data</strong> — the public key of the testnet wallet generated for your account, and the transaction hashes of any deployments or payments.</>,
            <><strong className="font-medium text-foreground">Technical data</strong> — basic log and device information needed for security and reliability.</>,
          ]}
        />
      </Section>

      <Section title="2. How we use information">
        <Bullets
          items={[
            "To provide, maintain, and improve the IDE, compiler, and deployment pipeline.",
            "To track usage against plan limits and process optional payments.",
            "To secure the service, prevent abuse, and debug issues.",
            "To communicate with you about your account or important changes.",
          ]}
        />
      </Section>

      <Section title="3. Wallets and keys">
        <p>
          Each account is issued a Stellar <strong className="font-medium text-foreground">testnet</strong> wallet used to sign deployments and contract calls. The wallet's secret key is encrypted at rest and is only ever decrypted in memory at signing time — it is never logged, displayed, or shared. These are testnet keys and hold no real-world value.
        </p>
      </Section>

      <Section title="4. Cookies and analytics">
        <p>
          We use strictly necessary cookies to keep you signed in. We use privacy-respecting product analytics to understand aggregate usage and improve the service. We do not use advertising trackers and we do not sell your data.
        </p>
      </Section>

      <Section title="5. How information is shared">
        <p>We do not sell personal information. We share data only:</p>
        <Bullets
          items={[
            "With service providers that host our infrastructure, authentication, email, and analytics, under appropriate confidentiality obligations.",
            "When required by law, regulation, or valid legal process.",
            "To protect the rights, safety, and security of users and the service.",
          ]}
        />
        <p>
          Note that any contract you deploy and any transaction you submit are recorded on the public Stellar network and are outside our control.
        </p>
      </Section>

      <Section title="6. Data retention">
        <p>
          We retain account and project data for as long as your account is active or as needed to provide the service. You may request deletion of your account and associated data at any time, subject to legal record-keeping obligations.
        </p>
      </Section>

      <Section title="7. Security">
        <p>
          We use industry-standard measures — including encryption of sensitive data at rest and in transit — to protect your information. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.
        </p>
      </Section>

      <Section title="8. Your rights">
        <p>
          Depending on your location, you may have the right to access, correct, export, or delete your personal data, and to object to or restrict certain processing. To exercise these rights, contact us using the details below.
        </p>
      </Section>

      <Section title="9. Third-party services">
        <p>
          The service integrates with third parties such as authentication providers and the Stellar network. Their handling of your data is governed by their own privacy policies, which we encourage you to review.
        </p>
      </Section>

      <Section title="10. Children's privacy">
        <p>
          The service is not directed to individuals under the age of 13 (or the minimum age required in your jurisdiction), and we do not knowingly collect their personal information.
        </p>
      </Section>

      <Section title="11. Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. Material changes will be reflected by updating the "Last updated" date above and, where appropriate, by additional notice.
        </p>
      </Section>

      <Section title="12. Contact">
        <p>
          Questions about this policy? Reach us at{" "}
          <a href="mailto:support@websoroban.in" className="text-brand hover:underline">
            support@websoroban.in
          </a>
          .
        </p>
      </Section>
    </LegalPage>
  )
}
