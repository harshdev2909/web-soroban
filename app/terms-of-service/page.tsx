"use client"

import { LegalPage, Section, Bullets } from "@/components/legal-page"

export default function TermsOfServicePage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="June 8, 2026"
      intro="These Terms govern your use of WebSoroban, a browser-based IDE for writing, compiling, and deploying Stellar/Soroban smart contracts on testnet. By using the service, you agree to these Terms."
    >
      <Section title="1. Acceptance of terms">
        <p>
          By accessing or using WebSoroban (the "Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
        </p>
      </Section>

      <Section title="2. The service">
        <p>
          The Service provides an in-browser environment to write Rust, compile to WASM, and deploy and invoke Soroban smart contracts on the Stellar <strong className="font-medium text-foreground">testnet</strong>. The Service is provided on an "as is" and "as available" basis and may change, be suspended, or be discontinued at any time.
        </p>
      </Section>

      <Section title="3. Accounts and eligibility">
        <p>
          You must sign in through a supported provider to use most features. You are responsible for activity that occurs under your account and for keeping your access credentials secure. You must be old enough to form a binding contract in your jurisdiction.
        </p>
      </Section>

      <Section title="4. Acceptable use">
        <p>You agree not to:</p>
        <Bullets
          items={[
            "Use the Service for unlawful, harmful, or fraudulent purposes.",
            "Deploy or distribute malicious code, or attempt to compromise the Service or other users.",
            "Abuse, overload, or attempt to circumvent rate limits, plan limits, or security controls.",
            "Reverse engineer, resell, or misrepresent the Service.",
          ]}
        />
      </Section>

      <Section title="5. Blockchain and testnet disclaimer">
        <p>
          The Service operates on the Stellar testnet. Testnet assets have no monetary value. Blockchain transactions are public, immutable, and irreversible. You are solely responsible for the smart contracts you write, deploy, and invoke, and for understanding their behavior and risks. We do not custody mainnet funds and provide no assurances about on-chain outcomes.
        </p>
      </Section>

      <Section title="6. Wallets">
        <p>
          The Service provisions a server-managed testnet wallet for signing your deployments and contract calls. You are responsible for the contracts and transactions initiated from your account. The wallet is for testnet use only.
        </p>
      </Section>

      <Section title="7. Payments and subscriptions">
        <p>
          Certain plans and templates may require payment in XLM. Prices and limits are shown at the point of purchase. Except where required by law, payments are non-refundable. Failure to complete a valid payment may limit access to paid features.
        </p>
      </Section>

      <Section title="8. Intellectual property">
        <p>
          You retain ownership of the contract code and content you create. You grant us a limited license to host, process, and display that content solely to operate the Service. The Service itself — including its software, design, and trademarks — remains our property. Templates are licensed for use within the Service and may not be redistributed except as permitted.
        </p>
      </Section>

      <Section title="9. Disclaimer of warranties">
        <p>
          The Service is provided without warranties of any kind, whether express or implied, including merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the Service will be uninterrupted, error-free, or secure, or that compilation or deployment results will meet your requirements.
        </p>
      </Section>

      <Section title="10. Limitation of liability">
        <p>
          To the maximum extent permitted by law, we will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss of data, assets, or profits, arising from your use of the Service. Our total liability for any claim is limited to the greater of the amount you paid us in the prior twelve months or USD 100.
        </p>
      </Section>

      <Section title="11. Indemnification">
        <p>
          You agree to indemnify and hold us harmless from claims, damages, and expenses arising out of your use of the Service, your content, or your violation of these Terms or applicable law.
        </p>
      </Section>

      <Section title="12. Termination">
        <p>
          We may suspend or terminate your access at any time for any reason, including violation of these Terms. You may stop using the Service at any time. Provisions that by their nature should survive termination will survive.
        </p>
      </Section>

      <Section title="13. Changes to these terms">
        <p>
          We may update these Terms from time to time. Material changes will be reflected by updating the "Last updated" date above. Your continued use of the Service after changes take effect constitutes acceptance.
        </p>
      </Section>

      <Section title="14. Governing law">
        <p>
          These Terms are governed by the laws applicable to the operator of the Service, without regard to conflict-of-laws principles. Any disputes will be resolved in the competent courts of that jurisdiction.
        </p>
      </Section>

      <Section title="15. Contact">
        <p>
          Questions about these Terms? Reach us at{" "}
          <a href="mailto:support@websoroban.in" className="text-brand hover:underline">
            support@websoroban.in
          </a>
          .
        </p>
      </Section>
    </LegalPage>
  )
}
