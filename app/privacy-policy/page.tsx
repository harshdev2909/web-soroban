"use client"

import { LegalPage, Section, Bullets, LegalTable } from "@/components/legal-page"

const CONTACT_EMAIL = "hello@websoroban.in"

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      effective="April 25, 2026"
      updated="August 19, 2026"
      intro='This Privacy Policy explains how WebSoroban ("WebSoroban," "we," "us," or "our") collects, uses, discloses, and protects information in connection with the WebSoroban browser-based development environment for building, testing, compiling, and deploying Soroban smart contracts on the Stellar network (the "Service"), accessible at websoroban.in.'
    >
      <Section title="1. Introduction">
        <p>
          This policy applies to your use of the WebSoroban website and IDE. By using the Service, you agree to the
          collection and use of information as described here.
        </p>
      </Section>

      <Section title="2. Who We Are">
        <p>
          WebSoroban is operated by <strong className="font-medium text-foreground">BayLeaf OÜ</strong>, registered at
          Kesklinna linnaosa, Ahtri tn 12, Estonia.
        </p>
        <p>
          For the purposes of applicable data protection law, BayLeaf OÜ acts as the data controller for personal data
          processed through the Service, except where a specific processing activity is described otherwise in this policy
          (blockchain networks operate independently of our control — see Section 10).
        </p>
      </Section>

      <Section title="3. Scope of This Policy">
        <p>This policy applies to the WebSoroban website and the WebSoroban IDE/Service. It does not apply to:</p>
        <Bullets
          items={[
            "Public blockchain networks (Stellar testnet and mainnet), which operate independently of WebSoroban and are governed by their own decentralized protocol rules.",
            "Third-party wallets (such as Freighter, xBull, Albedo, Lobstr, or Hana) that you connect to WebSoroban. Those wallets have their own privacy practices.",
            "Third-party websites or services linked from WebSoroban.",
          ]}
        />
      </Section>

      <Section title="4. Information We Collect">
        <p>
          We collect only what is needed to operate the Service. Each category below reflects our current understanding
          of actual practice.
        </p>

        <h3 className="font-medium text-foreground">4.A Account information</h3>
        <p>If account creation is required or offered, we may collect:</p>
        <Bullets
          items={[
            "Name and email address, provided by you at signup or via OAuth",
            "Username and account ID, generated or provided by you",
            "Authentication credentials or authentication tokens from a third-party sign-in provider (Google, GitHub, or Discord)",
          ]}
        />
        <p>This information is provided directly by you and is necessary to create and secure your account.</p>

        <h3 className="font-medium text-foreground">4.B Developer and project data</h3>
        <p>Depending on how you use the IDE, we may process:</p>
        <Bullets
          items={[
            "Smart-contract source code and project files you write or upload, where you choose to save a project to our servers rather than keep it only in your local browser session",
            "Build, compilation, and test logs generated when you run or compile a contract",
            "Deployment records, including which network (testnet or mainnet) a contract was deployed to and the associated transaction outcome",
            "Prompts and code snippets you submit to the AI Copilot (see Section 9 for AI-specific handling)",
          ]}
        />
        <p>
          We treat your source code and project files as confidential developer content. We do not claim ownership of
          your code, and we do not use your project data for purposes beyond operating, securing, and improving the
          Service, unless you separately and explicitly agree otherwise.
        </p>

        <h3 className="font-medium text-foreground">4.C Blockchain and wallet information</h3>
        <p>
          <strong className="font-medium text-foreground">Wallet connection.</strong> When you connect a browser wallet
          (such as Freighter, xBull, Albedo, Lobstr, or Hana) to deploy or interact with mainnet, WebSoroban receives
          your public wallet address (a Stellar G… address). Your wallet&apos;s private key is held and used by your
          wallet extension, not transmitted to or stored by WebSoroban, when you use connected-wallet (non-custodial)
          mode.
        </p>
        <p>
          <strong className="font-medium text-foreground">Custodial signing.</strong> WebSoroban&apos;s default signer
          for testnet is a wallet generated and held by WebSoroban on your behalf, so that you can test contracts
          without first installing a wallet extension. Separately, WebSoroban offers an opt-in custodial mode for
          mainnet, which you must explicitly enable and acknowledge as carrying risk, in which WebSoroban stores a
          private key on its infrastructure and signs mainnet transactions using that key at your instruction.
        </p>
        <p>
          We do not collect, and you should never submit to us, your seed phrase or recovery phrase, or the private key
          of any wallet you intend to keep self-custodied. Where custodial signing is used, key handling is limited to
          what the custodial feature technically requires, and is described further in Section 14 (Security).
        </p>
        <p>
          <strong className="font-medium text-foreground">On-chain data.</strong> Transaction hashes, contract addresses,
          invocation data, and any other data you submit to the Stellar network through WebSoroban become part of the
          public, immutable Stellar ledger once confirmed. See Section 10.
        </p>

        <h3 className="font-medium text-foreground">4.D Technical information</h3>
        <p>Collected automatically as you use the Service:</p>
        <Bullets
          items={["Browser type and version", "Device type (e.g., desktop or mobile)", "Operating system", "Referrer URL", "Session identifiers and log data"]}
        />

        <h3 className="font-medium text-foreground">4.E Usage and analytics information</h3>
        <p>
          We may collect information about which pages and IDE features you use, session duration, and general
          interaction patterns, in order to understand how the product performs and where it breaks.
        </p>

        <h3 className="font-medium text-foreground">4.F Communications</h3>
        <p>
          If you contact support, submit feedback, report a bug, or otherwise message us, we collect the content of that
          communication and your contact details, in order to respond to you.
        </p>

        <h3 className="font-medium text-foreground">4.G Payment information</h3>
        <p>
          WebSoroban offers paid features today, including <strong className="font-medium text-foreground">Pro</strong> and{" "}
          <strong className="font-medium text-foreground">Premium</strong> subscription tiers (higher deploy and function-test
          limits, verified via testnet XLM payment) and <strong className="font-medium text-foreground">AI Copilot credit
          packs</strong> (purchased with fiat via our payment processor). There is no separate Enterprise tier at this time.
        </p>
        <p>
          For AI credit purchases, payment card details are collected and processed directly by our third-party payment
          processor <strong className="font-medium text-foreground">Dodo Payments</strong>. WebSoroban does not receive or
          store your full card number. We may retain limited billing information, such as your email address, billing
          name, Dodo customer ID, and transaction/invoice references, to maintain your account and issue receipts.
        </p>
      </Section>

      <Section title="5. Sources of Data">
        <p>We receive personal data from:</p>
        <Bullets
          items={[
            "You, directly (account details, code you save, support messages, payment setup)",
            "Your browser and device, automatically (technical and usage data)",
            "Third-party wallet applications you choose to connect (public wallet address)",
            "The Stellar network itself, which is a public, decentralized ledger (on-chain transaction data)",
            "Third-party authentication providers (Google, GitHub, Discord OAuth)",
            "Analytics and error-monitoring providers (Vercel Analytics, Google Analytics when enabled, and Sentry when configured)",
          ]}
        />
      </Section>

      <Section title="6. How We Use Your Information">
        <LegalTable
          headers={["Purpose", "Description"]}
          rows={[
            ["Operate the Service", "Run the IDE, compile and test code, execute deployments you request"],
            ["Account management", "Create, authenticate, and secure your account"],
            ["Custodial signing (where applicable)", "Sign testnet transactions by default, and mainnet transactions only if you opt in"],
            ["AI Copilot functionality", "Process prompts/code you submit to generate suggestions or debug output"],
            ["Product improvement", "Understand feature usage and diagnose errors"],
            ["Security and abuse prevention", "Detect and respond to suspicious account activity or platform misuse"],
            ["Customer support", "Respond to your questions, bug reports, and feedback"],
            ["Billing", "Process payments for paid tiers and AI credit packs"],
            ["Service communications", "Send account, security, or transactional notices"],
            ["Marketing communications", "Send product updates or newsletters, only if you opt in"],
            ["Legal compliance", "Comply with applicable law or respond to lawful requests"],
          ]}
        />
        <p className="mt-3">We do not use your data for advertising, and we do not sell personal data.</p>
      </Section>

      <Section title="7. Legal Bases for Processing (Where GDPR Applies)">
        <p>
          If and to the extent EU/UK data protection law applies to our processing, we rely on the following legal bases:
        </p>
        <LegalTable
          headers={["Processing activity", "Personal data", "Purpose", "Legal basis"]}
          rows={[
            ["Account creation and authentication", "Name, email, credentials", "Provide the Service", "Performance of a contract"],
            ["Custodial key signing", "Wallet key material (custodial mode only)", "Execute your requested transaction", "Performance of a contract"],
            ["Wallet connection", "Public wallet address", "Enable deployment/interaction", "Performance of a contract"],
            ["Project/code storage", "Source code, project files", "Save your work across sessions", "Performance of a contract"],
            ["AI Copilot processing", "Prompts, code snippets", "Generate AI responses", "Performance of a contract"],
            ["Security monitoring, fraud/abuse detection", "Technical/log data", "Protect the Service and users", "Legitimate interest (platform integrity)"],
            ["Product analytics", "Usage/technical data", "Improve product performance", "Legitimate interest (product improvement), or consent where required for non-essential analytics cookies"],
            ["Support communications", "Message content, contact details", "Respond to your inquiry", "Performance of a contract / legitimate interest"],
            ["Billing", "Billing details, transaction reference", "Process payment", "Performance of a contract"],
            ["Marketing emails", "Email address", "Send opt-in product updates", "Consent"],
            ["Non-essential cookies", "Cookie/analytics identifiers", "Analytics, as configured", "Consent"],
            ["Legal compliance", "Relevant account/transaction data", "Meet legal obligations", "Legal obligation"],
          ]}
        />
        <p className="mt-3">
          You may withdraw consent for any consent-based processing (such as marketing emails or non-essential cookies) at
          any time, without affecting the lawfulness of processing carried out before withdrawal.
        </p>
      </Section>

      <Section title="8. Cookies and Tracking Technologies">
        <p>We use cookies and similar technologies to operate and understand the Service:</p>
        <Bullets
          items={[
            <><strong className="font-medium text-foreground">Essential cookies</strong> — maintain your login session and core IDE state. These cannot be disabled without breaking core functionality.</>,
            <><strong className="font-medium text-foreground">Analytics cookies</strong> — Vercel Analytics and Google Analytics (when configured) help us understand feature usage and performance.</>,
            <><strong className="font-medium text-foreground">Marketing/advertising cookies</strong> — we do not currently use these.</>,
          ]}
        />
      </Section>

      <Section title="9. AI Copilot and Your Prompts/Code">
        <p>
          The AI Copilot is a natural-language assistant that helps you generate, debug, and optimize Soroban contracts.
        </p>
        <p>
          <strong className="font-medium text-foreground">What is processed.</strong> When you use the AI Copilot, the
          prompt you type and any code snippet you include with it are sent to{" "}
          <strong className="font-medium text-foreground">OpenRouter</strong> for processing, which routes your request
          to an underlying model provider (such as Anthropic, OpenAI, or Google) to generate a response. WebSoroban also
          stores your Copilot conversation threads, messages, and run history in your account so you can review past
          sessions and undo changes.
        </p>
        <p>
          <strong className="font-medium text-foreground">Retention and training.</strong> OpenRouter does not store your
          prompt or completion content by default; it retains request metadata (such as token counts and latency). Each
          downstream model provider has its own data-retention and training policies. WebSoroban does not opt in to
          OpenRouter&apos;s voluntary product-improvement data sharing, and we do not use your Copilot submissions to
          train or fine-tune any AI model. Your Copilot data in WebSoroban is retained while your account is active and
          until you delete the relevant thread or your account.
        </p>
        <p>
          <strong className="font-medium text-foreground">Ownership.</strong> You retain ownership of the code you write,
          including code produced with AI Copilot assistance, subject to the terms of our Terms of Service.
        </p>
        <p>Never submit the following to the AI Copilot, to our support team, or anywhere else in the Service:</p>
        <Bullets
          items={["Private keys", "Seed phrases / recovery phrases", "Passwords", "API secrets or tokens", "Any wallet authentication credential"]}
        />
        <p>
          WebSoroban does not need this information to provide AI assistance, and no legitimate feature requires it. If a
          feature ever appears to request one of these, treat it as suspicious and contact us immediately.
        </p>
      </Section>

      <Section title="10. Blockchain and Public Ledger Disclosure">
        <p>
          Stellar, including the Soroban smart contract layer, is a public, decentralized network. This has consequences
          that are different from typical cloud software:
        </p>
        <Bullets
          items={[
            "Once a transaction or contract deployment is confirmed on testnet or mainnet, the associated data (contract address, transaction hash, invocation parameters, and the public wallet address that signed it) becomes publicly visible on the ledger and is replicated across the decentralized network of nodes that maintain Stellar.",
            "This on-chain data is not controlled by WebSoroban. We cannot modify, hide, or delete data once it is recorded on the public ledger, because no single party controls the Stellar network.",
            "Testnet data (including data from the free Friendbot faucet) is separate from mainnet and does not involve real value, but is still publicly visible on the testnet ledger.",
            "Mainnet transactions are irreversible and involve real XLM. WebSoroban simulates every mainnet transaction, shows you the fee, and requires your explicit confirmation before signing; WebSoroban does not deploy or invoke contracts on mainnet without your action.",
            "Data we control (account records, saved project files, support tickets, logs) is distinct from data recorded on the public blockchain. Deleting your WebSoroban account removes the data we control, as described in Section 19, but has no effect on data already confirmed on-chain.",
          ]}
        />
      </Section>

      <Section title="11. Third-Party Service Providers">
        <p>We work with service providers to operate WebSoroban:</p>
        <LegalTable
          headers={["Provider", "Purpose", "Data processed", "Location", "Role"]}
          rows={[
            ["Vercel", "Frontend hosting and web analytics", "Technical/usage data, session data", "United States", "Processor"],
            ["Railway", "API, background workers, and Redis job queues", "Account, project, log, and job data", "United States", "Processor"],
            ["Neon", "PostgreSQL database", "Account, project, billing, and usage data", "United States (AWS)", "Processor"],
            ["OpenRouter", "AI Copilot routing and inference", "Prompts, code snippets, request metadata", "United States", "Processor"],
            ["Stellar Development Foundation / community RPC", "Testnet Horizon and Soroban RPC; mainnet via configurable RPC endpoint (default: mainnet.sorobanrpc.com)", "Wallet address, transaction data", "United States / global", "Infrastructure (public network)"],
            ["Dodo Payments", "Billing for AI credit packs", "Payment details, billing email", "International (per Dodo Payments)", "Processor (independent controller for payment data under its own privacy policy)"],
            ["Google Analytics", "Product usage analytics (when enabled)", "Technical/usage data", "United States", "Processor"],
            ["Sentry", "Error and crash monitoring (when configured)", "Technical/error data", "United States", "Processor"],
            ["Resend / SMTP", "Transactional and service email", "Email address, name, message content", "United States (Resend) / varies (SMTP)", "Processor"],
            ["Google / GitHub / Discord", "OAuth sign-in", "Email, name, profile picture, provider user ID", "United States", "Processor (authentication)"],
          ]}
        />
        <p className="mt-3">
          Where we engage a processor, we require them to process personal data only on our instructions and to protect it
          appropriately. We do not treat our processors as joint controllers unless a specific arrangement genuinely makes
          that accurate.
        </p>
      </Section>

      <Section title="12. International Data Transfers">
        <p>
          WebSoroban is a globally accessible, browser-based service. BayLeaf OÜ is established in Estonia (EU). Your
          data may be processed in countries other than your own, including the United States, where several of our
          infrastructure and service providers are located.
        </p>
        <p>
          Where EU/UK data protection law applies and personal data is transferred outside the EU/EEA or UK, we rely on
          appropriate safeguards, including the European Commission&apos;s Standard Contractual Clauses (and the UK
          International Data Transfer Addendum where applicable) with our processors, and we assess provider locations
          and subprocessors as part of our vendor review.
        </p>
      </Section>

      <Section title="13. Data Retention">
        <p>
          We retain personal data only as long as necessary for the purposes described in this policy:
        </p>
        <LegalTable
          headers={["Data category", "Retention period", "Reason"]}
          rows={[
            ["Account data", "While your account is active, plus up to 30 days after a verified deletion request", "Provide the Service and meet legal/operational needs"],
            ["Project/source code data", "While retained in your account; deleted immediately when you delete a project", "Let you resume and manage your work"],
            ["Custodial key material (testnet default, mainnet opt-in)", "While your account is active and the relevant signing mode is enabled; deleted when your account is deleted", "Enable signing on your behalf while the mode is active"],
            ["Copilot threads and run history", "While your account is active, until you delete the thread or your account", "Provide conversation history and undo"],
            ["Build/deployment logs", "Up to 12 months", "Diagnose issues and maintain deployment history"],
            ["Support communications", "Up to 24 months after the inquiry is resolved", "Resolve your inquiry and maintain a support record"],
            ["Analytics data", "Up to 14 months (aggregate/aggregated where possible)", "Understand product usage over time"],
            ["Billing records", "Up to 7 years where required by applicable tax and accounting law", "Financial and legal recordkeeping"],
          ]}
        />
        <p className="mt-3">On-chain data is not subject to any retention period we control — see Section 10.</p>
      </Section>

      <Section title="14. Security">
        <p>
          We apply reasonable technical and organizational measures designed to protect the personal data and code you
          entrust to us, including:
        </p>
        <Bullets
          items={[
            "Encryption of data in transit (HTTPS/TLS)",
            "AES-256-GCM encryption of custodial wallet secrets and BYO API keys at rest",
            "Access controls limiting who inside our organization can reach account, project, and key-related systems",
            "Logging and monitoring of platform activity",
            "Secure development practices for the Service itself",
          ]}
        />
        <p>
          Custodial key material, where used, is handled with additional care given its sensitivity, and access is
          restricted accordingly. Private keys are decrypted only in memory at signing time and are never logged.
        </p>
      </Section>

      <Section title="15. Your Privacy Rights">
        <p>Depending on your location, you may have rights over your personal data, which can include the right to:</p>
        <Bullets
          items={[
            "Access the personal data we hold about you",
            "Correct inaccurate data",
            "Request deletion of your data",
            "Restrict or object to certain processing",
            "Receive a portable copy of data you provided to us",
            "Withdraw consent, where processing is based on consent",
            "Lodge a complaint with a data protection authority in your jurisdiction, where applicable",
          ]}
        />
        <p>
          To exercise any of these rights, contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand hover:underline">
            {CONTACT_EMAIL}
          </a>
          . We will respond within the timeframe required by applicable law. We may need to verify your identity before
          acting on certain requests.
        </p>
        <p>
          <strong className="font-medium text-foreground">Automated decision-making.</strong> The AI Copilot generates
          suggestions to assist you, but does not make automated decisions about you that produce legal or similarly
          significant effects.
        </p>
      </Section>

      <Section title="16. Children's Privacy">
        <p>
          WebSoroban is a developer tool intended for people building software, not a service directed at children. We do
          not knowingly collect personal data from children under the age threshold applicable in your jurisdiction (13 in
          the United States, 16 in some EU member states). If you believe a child has created an account or provided us
          with personal data, contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand hover:underline">
            {CONTACT_EMAIL}
          </a>{" "}
          and we will take appropriate steps to address it.
        </p>
      </Section>

      <Section title="18. Marketing Communications">
        <p>We distinguish between two types of communications:</p>
        <Bullets
          items={[
            <><strong className="font-medium text-foreground">Service communications</strong> — account, security, billing, and operational notices necessary for the Service. You cannot opt out of these while your account is active.</>,
            <><strong className="font-medium text-foreground">Marketing communications</strong> — product updates and newsletters. You can unsubscribe at any time via the link in the email or by contacting us.</>,
          ]}
        />
      </Section>

      <Section title="19. Account Termination and Data Deletion">
        <p>When you delete your account (by contacting us at {CONTACT_EMAIL}):</p>
        <Bullets
          items={[
            "We delete or anonymize the personal data and project data we control within 30 days of your verified request, except where we are legally required to retain certain records for longer (for example, billing records for tax purposes).",
            "Deleting a project removes it from our servers immediately — there is no separate grace or backup period for project files.",
            "If a subscription or credit balance ends, billing records may be retained as required by law even after account deletion.",
            "Custodial key material associated with your account is permanently deleted from our systems when your account is deleted.",
          ]}
        />
        <p>
          <strong className="font-medium text-foreground">Blockchain data is different.</strong> Deleting your account
          does not, and cannot, remove any transaction, contract, or wallet address you already published to Stellar
          testnet or mainnet. That data exists on a public, decentralized ledger outside our control, permanently. See
          Section 10.
        </p>
      </Section>

      <Section title="20. Data Controller and Processor Roles">
        <p>
          <strong className="font-medium text-foreground">Data Controller:</strong> BayLeaf OÜ, for personal data
          processed to operate the Service.
        </p>
        <p>
          Where we use third-party providers (Section 11) to process personal data on our behalf, those providers act as
          processors under our instructions, not as independent controllers of that data, except for payment processors
          (such as Dodo Payments), which typically act as independent controllers of payment data under their own privacy
          policies.
        </p>
      </Section>

      <Section title="21. Changes to This Privacy Policy">
        <p>We may update this policy as our product, vendors, or legal obligations change. When we do:</p>
        <Bullets
          items={[
            'We will update the "Last Updated" date at the top of this page.',
            "For material changes, we will provide additional notice, such as an email or in-app notification, before the change takes effect.",
            "Continued use of WebSoroban after a change takes effect constitutes acceptance of the revised policy.",
          ]}
        />
      </Section>

      <Section title="22. Contact Information">
        <Bullets
          items={[
            <>Website: <a href="https://websoroban.in" className="text-brand hover:underline">WebSoroban (websoroban.in)</a></>,
            <>Contact email: <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand hover:underline">{CONTACT_EMAIL}</a></>,
          ]}
        />
      </Section>
    </LegalPage>
  )
}
