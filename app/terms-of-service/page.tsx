"use client"

import { LegalPage, Section, Bullets, LegalTable } from "@/components/legal-page"

const CONTACT_EMAIL = "hello@websoroban.in"
const PRIVACY_URL = "https://websoroban.in/privacy-policy"
const BILLING_URL = "https://websoroban.in/billing"

export default function TermsOfServicePage() {
  return (
    <LegalPage
      title="Terms of Service"
      effective="April 25, 2026"
      updated="August 19, 2026"
      intro='These Terms of Service ("Terms") govern access to and use of WebSoroban, a browser-based development environment for building, testing, and deploying Soroban smart contracts on the Stellar network (the "Service"), provided by BayLeaf OÜ ("WebSoroban," "we," "us," or "the Company"), trading as WebSoroban, at websoroban.in.'
    >
      <Section title="1. Introduction">
        <p>
          These Terms form a binding agreement between you and BayLeaf OÜ. Please read them carefully before using
          the Service.
        </p>
      </Section>

      <Section title="2. Definitions">
        <Bullets
          items={[
            <><strong className="font-medium text-foreground">Service</strong> — the WebSoroban website, IDE, AI Copilot, template marketplace, and related developer tooling.</>,
            <><strong className="font-medium text-foreground">User</strong> / <strong className="font-medium text-foreground">you</strong> — anyone who accesses or uses the Service.</>,
            <><strong className="font-medium text-foreground">Account</strong> — a registered WebSoroban user profile.</>,
            <><strong className="font-medium text-foreground">Project</strong> — the code, files, and configuration you create or store within the Service.</>,
            <><strong className="font-medium text-foreground">User Content</strong> — source code, smart-contract code, prompts, files, documentation, and other materials you submit to the Service.</>,
            <><strong className="font-medium text-foreground">Smart Contract</strong> — code deployed to a Blockchain Network via the Service.</>,
            <><strong className="font-medium text-foreground">Blockchain Network</strong> — the Stellar network, including its Soroban smart-contract layer, in testnet or mainnet configuration.</>,
            <><strong className="font-medium text-foreground">AI Features</strong> — the AI Copilot and any other AI-assisted functionality within the Service.</>,
            <><strong className="font-medium text-foreground">Third-Party Services</strong> — services provided by parties other than WebSoroban that the Service integrates with or depends on.</>,
            <><strong className="font-medium text-foreground">Fees</strong> / <strong className="font-medium text-foreground">Subscription</strong> — amounts payable and the paid plan(s) under which they are charged.</>,
          ]}
        />
      </Section>

      <Section title="3. Eligibility">
        <p>To use the Service, you must:</p>
        <Bullets
          items={[
            "Be at least 16 years old",
            "Have the legal capacity to enter into a binding agreement",
            "Not be prohibited from using the Service under applicable law, including applicable sanctions or export control regimes",
          ]}
        />
        <p>
          If you use the Service on behalf of an organization, you represent that you have authority to bind that
          organization to these Terms, and &quot;you&quot; refers to both you and the organization.
        </p>
      </Section>

      <Section title="4. Acceptance of Terms">
        <p>
          By accessing or using the Service — as a visitor, a registered account holder, a free user, or a paid user —
          you agree to these Terms. If you do not agree, do not use the Service.
        </p>
        <p>
          If we make material changes to these Terms, we will provide notice as described in Section 41. Continued use
          of the Service after a change takes effect constitutes acceptance of the revised Terms, to the extent
          permitted by applicable law. Nothing in this section is intended to override any non-waivable statutory right
          you hold as a consumer.
        </p>
      </Section>

      <Section title="5. Description of the Service">
        <p>
          WebSoroban is a browser-based development environment that lets you write, test, and deploy Soroban smart
          contracts without a local development setup. Based on currently confirmed functionality, the Service includes:
        </p>
        <Bullets
          items={[
            "A cloud-based code editor",
            "In-browser contract testing via a WASM sandbox",
            "Transaction simulation with estimated network fees",
            "An AI Copilot that generates, explains, debugs, and helps optimize code from natural-language prompts",
            "One-click deployment to Stellar testnet and mainnet",
            "Wallet connectivity for signing mainnet transactions",
            "A template marketplace and the ability to save custom contract templates",
          ]}
        />
        <p>
          The Service is a development tool. It does not guarantee: successful compilation, successful deployment, the
          correctness or security of any smart contract, blockchain network availability or confirmation, transaction
          success, or any financial or economic outcome from code built or deployed using the Service.
        </p>
      </Section>

      <Section title="6. Accounts and Account Security">
        <p>
          An account is required to use most features of the Service. You may sign in using{" "}
          <strong className="font-medium text-foreground">Google, GitHub, or Discord OAuth</strong>, or by connecting
          and signing a challenge with an external Stellar wallet. We do not offer a standalone email-and-password login
          as the primary authentication method.
        </p>
        <p>Where an account is required or offered, you agree to:</p>
        <Bullets
          items={[
            "Provide accurate, current, and complete registration information",
            "Maintain the confidentiality of your login credentials and connected accounts",
            <>Notify us promptly at <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand hover:underline">{CONTACT_EMAIL}</a> if you suspect unauthorized access to your account</>,
            "Accept responsibility for activity that occurs under your account, except activity resulting from our failure to meet our own obligations under these Terms",
          ]}
        />
        <p>
          We will never ask you, through official WebSoroban channels, for your account password, private key, or seed
          phrase. If you use a WebSoroban-managed custodial signing feature (see Section 14), our infrastructure holds
          relevant key material as a function of that feature — this is different from a WebSoroban team member or
          support channel asking you to hand over a key directly, which will never legitimately happen. If someone
          claiming to represent WebSoroban asks you to disclose a password, private key, or seed phrase outside of the
          custodial signing feature itself, treat it as fraudulent and report it.
        </p>
      </Section>

      <Section title="7. User Responsibility for Access">
        <p>You are responsible for:</p>
        <Bullets
          items={[
            "Your own device, browser environment, and internet connectivity",
            "The security of any wallet you connect to the Service, and its private keys and seed phrases, in non-custodial mode",
            "Your authentication credentials and any third-party accounts you use to access the Service",
            "The code and prompts you submit",
            "Reviewing and approving any blockchain transaction before it is signed, whether through a connected wallet or through custodial signing",
          ]}
        />
        <p>
          Never submit your private key, seed phrase, password, API secret, or authentication token to the AI Copilot,
          to support channels, or anywhere else within the Service, unless you are knowingly and deliberately using the
          specific custodial signing feature that requires WebSoroban to hold a key on your behalf. WebSoroban does not
          need this information for any other feature, and no other part of the Service should ever request it.
        </p>
      </Section>

      <Section title="8. Acceptable Use">
        <p>You agree to use the Service only for lawful purposes and in accordance with these Terms.</p>
        <p><strong className="font-medium text-foreground">You may:</strong></p>
        <Bullets
          items={[
            "Write, test, and deploy Soroban smart contracts",
            "Use the AI Copilot to generate, debug, and optimize code",
            "Browse, purchase, and use templates from the marketplace, and save your own custom templates within your account",
            "Conduct legitimate security research on your own contracts and, subject to applicable law and without harming others' systems or data, on the Service itself",
          ]}
        />
        <p><strong className="font-medium text-foreground">You may not:</strong></p>
        <Bullets
          items={[
            "Violate any applicable law or regulation",
            "Use the Service to commit fraud or facilitate illegal financial activity, including money laundering",
            "Attempt unauthorized access to another user's account, project, or data",
            "Introduce malware, viruses, or exploits into the Service",
            "Attack, disrupt, or overload the Service's infrastructure",
            "Circumvent rate limits or technical restrictions through automated means",
            "Scrape or extract the Service, the AI Copilot model, or underlying infrastructure beyond ordinary, permitted use of the product",
            "Reverse-engineer the Service except to the extent such restriction is unenforceable under applicable law",
            "Impersonate WebSoroban, its team, or another user",
            "Send spam or abuse the Service's infrastructure through excessive automated traffic",
          ]}
        />
        <p>Violating this section may result in suspension or termination of your access, as described in Section 27.</p>
      </Section>

      <Section title="9. Prohibited Smart-Contract Use">
        <p>Because the Service is used to build and deploy real smart contracts, you specifically agree not to use it to develop, test, or deploy:</p>
        <Bullets
          items={[
            "Malware, exploits, or credential-theft tools",
            "Ransomware or similarly destructive code",
            "Fraudulent applications or scams",
            "Smart contracts designed to steal, misappropriate, or fraudulently redirect assets from third parties",
            "Illegal financial schemes, or contracts designed to evade applicable law",
            "Contracts intended to deceive users about their function, ownership, or risk",
          ]}
        />
        <p>
          This does not prohibit legitimate security research, testing of your own contracts for vulnerabilities, or
          building intentionally vulnerable contracts for educational purposes, provided such activity does not target
          third parties without authorization or cause real-world harm.
        </p>
      </Section>

      <Section title="10. User Content and Intellectual Property">
        <p>
          &quot;User Content&quot; includes source code, smart-contract code, project files, documentation, prompts,
          and other materials you submit to the Service.
        </p>
        <p>
          You retain ownership of your User Content, subject to any third-party rights or open-source licenses that may
          apply to components you incorporate into it. We do not claim ownership of your code.
        </p>
        <p>
          <strong className="font-medium text-foreground">Limited license to us.</strong> To operate the Service, you
          grant WebSoroban a non-exclusive, worldwide, royalty-free license to host, store, process, and display your
          User Content solely as necessary to provide, maintain, secure, and improve the Service, and as described in
          our Privacy Policy. This license ends when your content is deleted from our systems, except to the extent
          copies remain in backups for a limited period or where retention is required by law, as described in our
          Privacy Policy. We do not have, and this license does not grant us, any right to sell, sublicense for
          unrelated commercial purposes, or publicly redistribute your User Content beyond what you have explicitly
          enabled (for example, by publishing a template to the marketplace).
        </p>
      </Section>

      <Section title="11. Source Code and Confidentiality">
        <Bullets
          items={[
            "Do not upload information you are not authorized to disclose, including a third party's confidential or proprietary code",
            "Do not submit passwords, private keys, seed phrases, API secrets, or other credentials, except where a specific, clearly-labeled custodial feature requires key material to function",
            "You remain responsible for complying with any third-party license terms that apply to code you incorporate into your projects",
          ]}
        />
        <p>
          WebSoroban does not provide a contractual guarantee of confidentiality or privilege over code you submit
          beyond what is stated in our Privacy Policy. We process your code as necessary to provide the Service
          (compiling, testing, storing, and, if you use the AI Copilot, sending relevant snippets to OpenRouter). If
          your project involves genuinely sensitive or proprietary logic, evaluate that risk before submitting it,
          particularly to AI Features (see Section 12).
        </p>
      </Section>

      <Section title="12. AI Features">
        <p>
          The AI Copilot can generate code, explain code, suggest fixes, and help optimize contracts based on
          natural-language prompts.
        </p>
        <p>AI output may be inaccurate, incomplete, or insecure. You are solely responsible for:</p>
        <Bullets
          items={[
            "Reviewing all AI-generated code before using or deploying it",
            "Testing AI-generated code, including on testnet before any mainnet use",
            "Independently assessing security, including whether a professional security review is warranted",
            "Confirming license compatibility for any AI-generated code you incorporate",
            "Making your own decision about whether and how to deploy any contract, AI-assisted or not",
          ]}
        />
        <p>
          We do not represent AI-generated output as audited, secure, correct, or production-ready. Successfully
          generating, compiling, or testing code with the AI Copilot does not mean the resulting contract is safe to
          deploy with real value on mainnet.
        </p>
        <p>
          <strong className="font-medium text-foreground">Data processing.</strong> Prompts and code snippets you submit
          to the AI Copilot are processed by <strong className="font-medium text-foreground">OpenRouter</strong>, which
          routes your request to an underlying model provider, to generate a response. OpenRouter does not store your
          prompt or completion content by default; it retains request metadata only. Each downstream model provider has
          its own data-retention and training policies. WebSoroban does not use your Copilot submissions to train or
          fine-tune any AI model, and we do not opt in to OpenRouter&apos;s voluntary product-improvement data sharing.
          WebSoroban stores your Copilot conversation threads and run history in your account until you delete them or
          your account. Treat any code or prompt you submit to the AI Copilot as though it may be processed by a
          third-party provider, and avoid submitting proprietary logic you are not prepared to share.
        </p>
      </Section>

      <Section title="13. Blockchain and Smart Contract Risks">
        <p>Using the Service to interact with Stellar testnet or mainnet involves inherent risks, including:</p>
        <Bullets
          items={[
            "Transaction irreversibility — once confirmed, a transaction cannot be undone",
            "Public, permanent transaction records",
            "Network congestion, outages, or fee volatility",
            "Smart-contract bugs or vulnerabilities, including in code you write, code the AI Copilot generates, or third-party contracts you interact with",
            "Failures in third-party infrastructure, including RPC providers, wallets, or oracles",
            "Protocol upgrades or network changes that may affect contract behavior",
            "Cryptocurrency price volatility",
          ]}
        />
        <p>
          WebSoroban does not guarantee that any smart contract built or deployed using the Service is secure, bug-free,
          profitable, or fit for any particular purpose. You are responsible for reviewing, testing, and — where
          appropriate — obtaining an independent professional security review of your own code before deploying it with
          real value on mainnet. Nothing in the Service, including AI Copilot output, constitutes financial, investment,
          legal, or tax advice, and using the Service does not guarantee any investment return or token value.
        </p>
      </Section>

      <Section title="14. Non-Custodial Position and Wallet Connectivity">
        <p>WebSoroban&apos;s approach to key custody differs by network and by your configuration choice:</p>
        <Bullets
          items={[
            <><strong className="font-medium text-foreground">Mainnet, by default:</strong> you connect a third-party wallet (such as Freighter, xBull, Albedo, Lobstr, or Hana). In this mode, WebSoroban does not hold, receive, or have access to your private key — you sign transactions in your own wallet.</>,
            <><strong className="font-medium text-foreground">Testnet, by default:</strong> the Service signs using a wallet generated and held by WebSoroban on your behalf. In this mode, WebSoroban is custodial for the testnet key.</>,
            <><strong className="font-medium text-foreground">Mainnet, opt-in custodial mode:</strong> if you explicitly enable this option, WebSoroban stores a private key on its infrastructure and signs mainnet transactions at your instruction. In this mode, you are trusting our infrastructure with signing authority over real assets.</>,
          ]}
        />
        <p>
          We do not claim to be a non-custodial service in configurations where we hold your signing key. You choose
          which mode to use for mainnet. We recommend self-custody (exporting your key to your own wallet) for anything
          you are not prepared to risk under a custodial arrangement.
        </p>
      </Section>

      <Section title="15. Blockchain Transaction Authorization">
        <p>
          Whether you use a connected wallet or custodial signing, you are responsible for reviewing transaction details
          — including network (testnet vs. mainnet), contract address, function parameters, and estimated fees — before a
          transaction is signed. The Service simulates mainnet transactions and displays estimated fees before signing,
          but simulation does not guarantee the transaction will succeed or behave exactly as simulated once broadcast.
          WebSoroban does not guarantee that any transaction will be confirmed by the network, and does not control
          network confirmation times or fee markets.
        </p>
      </Section>

      <Section title="16. Third-Party Services">
        <p>The Service relies on and integrates with third-party providers, including:</p>
        <LegalTable
          headers={["Category", "Provider / role"]}
          rows={[
            ["Blockchain infrastructure", "Stellar network; Soroban RPC (testnet via SDF; mainnet via configurable endpoint, default mainnet.sorobanrpc.com)"],
            ["Wallet providers", "Freighter, xBull, Albedo, Lobstr, Hana"],
            ["Cloud hosting", "Vercel (frontend), Railway (API/workers), Neon (database)"],
            ["AI provider", "OpenRouter (routes to underlying model providers)"],
            ["Payment processor", "Dodo Payments (AI credit packs); on-chain XLM verification (subscription and template purchases)"],
            ["Analytics / monitoring", "Vercel Analytics, Google Analytics (when enabled), Sentry (when configured)"],
            ["Authentication", "Google, GitHub, Discord OAuth"],
            ["Email", "Resend / SMTP (transactional email)"],
          ]}
        />
        <p className="mt-3">
          These third parties operate under their own terms and privacy policies, which are outside our control. We are
          not responsible for the availability, conduct, security, or data practices of third-party services, except to
          the extent required by applicable law.
        </p>
      </Section>

      <Section title="17. Open-Source Software">
        <p>
          Soroban, Stellar tooling, and components of the Service incorporate open-source software licensed by third
          parties. Those licenses apply independently of these Terms, and you must comply with them when using or
          redistributing the relevant components. Open-source components are not proprietary WebSoroban intellectual
          property, even where they are integrated into the Service.
        </p>
        <p>
          Certain tooling and examples may be published under open-source licenses through our{" "}
          <a href="https://github.com/WebSoroban" className="text-brand hover:underline" target="_blank" rel="noreferrer">
            GitHub organization
          </a>
          . The Service as a whole — including the hosted IDE, AI Copilot, and proprietary backend — remains our
          property unless explicitly stated otherwise.
        </p>
      </Section>

      <Section title="18. Beta and Experimental Features">
        <p>
          Features such as the AI Copilot, mainnet deployment tooling, and newer IDE capabilities may change frequently.
          We do not currently operate a separate, formally labeled beta program, but newer or rapidly evolving features
          may contain bugs or behave unpredictably. Do not rely on such features for production or mainnet use involving
          real value without independently verifying their behavior.
        </p>
      </Section>

      <Section title="19. Fees and Payments">
        <p>
          WebSoroban offers a <strong className="font-medium text-foreground">Free</strong> tier and paid functionality.
          Current pricing is available in the Service:
        </p>
        <Bullets
          items={[
            <><strong className="font-medium text-foreground">Pro</strong> — 50 XLM for a 30-day subscription (higher deploy and function-test limits)</>,
            <><strong className="font-medium text-foreground">Premium</strong> — 100 XLM for a 30-day subscription (unlimited deploys and function tests on the paid tier)</>,
            <><strong className="font-medium text-foreground">AI credit packs</strong> — one-time purchases via Dodo Payments (card and, where enabled, stablecoin/crypto), priced on the <a href={BILLING_URL} className="text-brand hover:underline">billing page</a></>,
            <><strong className="font-medium text-foreground">Template purchases</strong> — paid templates in the marketplace, verified via on-chain XLM payment</>,
          ]}
        />
        <p>
          Subscription and template payments are verified against the Stellar network (currently testnet XLM). AI credit
          pack payments are processed in fiat (or crypto at checkout, where enabled) by Dodo Payments. Prices, limits,
          and payment methods are shown at the point of purchase and may change with notice as described in Section 41.
        </p>
      </Section>

      <Section title="20. Subscriptions and Renewals">
        <p>
          Paid subscriptions (Pro and Premium) are <strong className="font-medium text-foreground">30-day terms</strong>{" "}
          activated after we verify your on-chain XLM payment. Subscriptions do <strong className="font-medium text-foreground">not</strong>{" "}
          auto-renew — you must submit a new payment to extend your plan after the current term ends. You may cancel your
          subscription at any time through the subscription management UI in the Service, which downgrades your account
          to the Free tier without refund for the remaining period.
        </p>
      </Section>

      <Section title="21. Refunds and Cancellations">
        <p>
          Except where required by applicable law, all fees are <strong className="font-medium text-foreground">non-refundable</strong>,
          including subscription payments, template purchases, and AI credit pack purchases. Digital services are
          delivered immediately upon activation or credit grant.
        </p>
        <p>
          Nothing in this section limits any non-waivable statutory refund or cancellation right you hold under the law of
          your country of residence.
        </p>
        <p>
          You may cancel your subscription through the in-app subscription management UI. To delete your account entirely,
          contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand hover:underline">{CONTACT_EMAIL}</a>.
          Cancelling a subscription stops future paid-tier access at the end of the current term; it does not
          automatically entitle you to a refund for the current billing period unless required by law.
        </p>
      </Section>

      <Section title="22. Intellectual Property Rights">
        <p>
          The Service — including its IDE, AI Copilot, design, branding, logos, documentation, and underlying
          architecture — is owned by WebSoroban or its licensors and is protected by applicable intellectual property
          law. Subject to these Terms, we grant you a limited, non-exclusive, non-transferable right to access and use
          the Service for its intended purpose during your period of use. This license does not include any right to
          copy, reproduce, or create derivative works of the Service itself without our written permission.
        </p>
        <p>This section does not affect your ownership of your own User Content (Section 10).</p>
      </Section>

      <Section title="23. Trademarks">
        <p>
          &quot;WebSoroban&quot; and associated logos and branding are unregistered trademarks or brand assets of
          BayLeaf OÜ. You may not use WebSoroban&apos;s name, logo, or branding in a way that suggests endorsement,
          sponsorship, or affiliation without our prior written consent.
        </p>
      </Section>

      <Section title="24. Feedback">
        <p>
          If you send us suggestions, feature requests, or other feedback about the Service, you grant us a
          non-exclusive, royalty-free, perpetual license to use that feedback to improve the Service, without any
          obligation to compensate you. This does not give us any right to your User Content or proprietary code beyond
          what is already addressed in Sections 10 and 11.
        </p>
      </Section>

      <Section title="25. Privacy">
        <p>
          Our collection and use of personal data is described in our{" "}
          <a href={PRIVACY_URL} className="text-brand hover:underline">Privacy Policy</a>, which is incorporated into
          these Terms by reference. If a conflict exists between this document and the Privacy Policy regarding how
          personal data is handled, the Privacy Policy controls.
        </p>
      </Section>

      <Section title="26. Security and Service Availability">
        <p>
          We apply reasonable technical and organizational measures to protect the Service, but we cannot guarantee
          that the Service is completely secure, error-free, or uninterrupted. The Service is provided on an &quot;as
          is&quot; and &quot;as available&quot; basis. We do not currently offer a guaranteed uptime commitment or
          enterprise SLA.
        </p>
        <p>
          Availability may be affected by maintenance, infrastructure failures, third-party provider outages (including
          blockchain network conditions outside our control), security incidents, or force majeure events (Section 40).
        </p>
      </Section>

      <Section title="27. Suspension">
        <p>We may suspend or restrict your access to the Service, with or without prior notice where necessary, if we reasonably believe:</p>
        <Bullets
          items={[
            "You have violated these Terms",
            "Your account poses a security risk to the Service or other users",
            "Your account is involved in fraud or illegal activity",
            "Suspension is required to comply with a legal obligation",
            "A payment has failed or could not be verified, where paid tiers or credit purchases apply",
          ]}
        />
        <p>
          We will aim to notify you of suspension and the reason for it where legally and practically possible, except
          where doing so would itself create a security or legal risk.
        </p>
      </Section>

      <Section title="28. Termination">
        <p>
          You may terminate your account at any time by contacting us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand hover:underline">{CONTACT_EMAIL}</a>, or by
          ceasing use of the Service and cancelling any active subscription.
        </p>
        <p>
          We may terminate your account if you materially violate these Terms or engage in illegal or fraudulent
          activity. We do not currently operate an automatic inactivity-based account termination policy.
        </p>
        <p>
          The following provisions survive termination: Sections 10 (as to content already licensed prior to
          termination), 13–15 (blockchain risk and custody disclosures, as to past use), 22 (intellectual property),
          31 (disclaimers), 32 (limitation of liability), 34 (indemnification), 42 (governing law), and any outstanding
          payment obligations.
        </p>
      </Section>

      <Section title="29. Effect of Termination">
        <p>Upon termination:</p>
        <Bullets
          items={[
            "Your access to the Service will stop",
            "Your account and project data will be deleted or anonymized within 30 days, consistent with our Privacy Policy, except where we are required to retain certain records by law",
            "Data may remain temporarily in backups for a limited operational period, consistent with our Privacy Policy",
            "Any smart contract or transaction you deployed to Stellar testnet or mainnet through the Service remains on the relevant public ledger permanently and cannot be deleted or reversed by us",
          ]}
        />
      </Section>

      <Section title="30. Changes to the Service">
        <p>
          We may modify, improve, add to, or discontinue features of the Service. We will not eliminate a paid feature
          you are actively subscribed to without reasonable notice or, where required by applicable law, an appropriate
          remedy such as a pro-rata refund or transition period.
        </p>
      </Section>

      <Section title="31. Disclaimers">
        <p>
          To the maximum extent permitted by applicable law, the Service is provided &quot;as is&quot; and &quot;as
          available,&quot; without warranties of any kind, whether express, implied, or statutory, except for warranties
          that cannot lawfully be excluded. Without limiting the foregoing, we do not warrant that:
        </p>
        <Bullets
          items={[
            "The Service will be uninterrupted, error-free, or completely secure",
            "Code will compile or deploy successfully",
            "Any smart contract, whether written by you or generated with AI assistance, is secure, correct, or fit for any particular purpose",
            "AI-generated output is accurate or complete",
            "Any blockchain network will confirm a given transaction, or will do so within any particular time or fee range",
            "Use of the Service will result in any particular financial or business outcome",
          ]}
        />
        <p>
          Nothing in this section excludes or limits any warranty or right that cannot lawfully be excluded or limited
          under the law applicable to you, including certain statutory consumer protections.
        </p>
      </Section>

      <Section title="32. Limitation of Liability">
        <p>To the maximum extent permitted by applicable law:</p>
        <Bullets
          items={[
            "Neither party will be liable to the other for indirect, incidental, consequential, special, or punitive damages, including lost profits, lost revenue, lost data, loss of digital assets, or business interruption, arising out of or related to these Terms or the Service, even if advised of the possibility of such damages",
            <>Our total aggregate liability for any claim arising from or related to the Service will not exceed the greater of (a) the total fees you paid to WebSoroban in the twelve months before the claim, or (b) <strong className="font-medium text-foreground">€100</strong></>,
            "We are not liable for losses arising from smart-contract bugs (whether in your own code or AI-generated code), blockchain network failures or congestion, third-party wallet or infrastructure failures, or your own error in reviewing or approving a transaction",
          ]}
        />
        <p>
          This limitation does not exclude or limit liability that cannot lawfully be excluded or limited under applicable
          law, including liability for death, personal injury, fraud, or willful misconduct where such exclusion is not
          permitted.
        </p>
      </Section>

      <Section title="33. Digital Asset and Blockchain Loss Disclaimer">
        <p>
          You may experience financial loss in connection with your use of the Service, including loss caused by: wallet
          compromise, loss of your own private key or seed phrase, an incorrect transaction you approved, a bug in a smart
          contract (whether written by you, generated with AI assistance, or written by a third party you interact with),
          blockchain network conditions, or third-party protocol failure. WebSoroban does not assume responsibility for
          such losses, except where custodial key material we hold under Section 14&apos;s opt-in custodial mode is
          compromised due to our own failure to meet the security obligations described in Section 26, subject to
          Section 32&apos;s limitation of liability.
        </p>
      </Section>

      <Section title="34. Indemnification">
        <p>
          You agree to indemnify and hold WebSoroban, its team, and its officers harmless from third-party claims,
          damages, and reasonable expenses (including legal fees) arising from: your misuse of the Service, your User
          Content, your violation of these Terms, your violation of applicable law, or your violation of a third
          party&apos;s rights — except to the extent the claim arises from WebSoroban&apos;s own breach of these Terms,
          negligence, or willful misconduct. This obligation is subject to applicable law limiting indemnification
          obligations for consumers.
        </p>
      </Section>

      <Section title="35. Organization and Business Users">
        <p>
          If you use the Service on behalf of an organization, you represent that you have authority to bind that
          organization, and the organization is responsible for the acts of its authorized users under its account. We
          do not currently offer a distinct enterprise or organization tier with separate contractual terms; this section
          applies to any organization that uses a standard account.
        </p>
      </Section>

      <Section title="36. API Terms">
        <p>
          WebSoroban does not currently offer a public developer API for third-party integration. The APIs used by the
          Service itself are for authenticated in-product use only. If we introduce a public API in the future, its use
          will be governed by additional API-specific terms published at that time.
        </p>
      </Section>

      <Section title="37. Export, Sanctions, and Restricted Use">
        <p>
          You represent that you are not located in, and are not otherwise subject to, any jurisdiction or sanctions
          list that would prohibit your use of the Service under applicable export control or sanctions law. We may
          restrict access where required by law but do not currently maintain a separate published list of blocked
          jurisdictions beyond this general representation.
        </p>
      </Section>

      <Section title="38. No Professional or Financial Advice">
        <p>
          Nothing in the Service, including AI Copilot output, tutorials, or documentation, constitutes legal,
          financial, investment, or tax advice, or a professional security audit. You are solely responsible for
          independently assessing your project, including obtaining professional advice or a third-party security review
          where appropriate. We do not endorse any token, project, or financial strategy built using the Service.
        </p>
      </Section>

      <Section title="39. No Guarantee of Smart-Contract Security">
        <p>
          Successful compilation does not mean your contract is secure. Passing tests does not mean your contract is
          secure. AI-generated code may contain vulnerabilities. Successful deployment does not mean your contract has
          been audited. If you are deploying a contract that will hold or control real value on mainnet, you are
          responsible for seeking an appropriate, independent professional security review before doing so.
        </p>
      </Section>

      <Section title="40. Force Majeure">
        <p>
          Neither party is liable for delay or failure to perform obligations under these Terms caused by events
          reasonably beyond its control, including natural disasters, war, government action, internet or infrastructure
          outages, blockchain network failures, or major cyber incidents affecting the Service or its providers. This does
          not excuse failures caused by ordinary, foreseeable operational issues.
        </p>
      </Section>

      <Section title="41. Changes to These Terms">
        <p>We may update these Terms as the Service, our vendors, or applicable law changes. We will:</p>
        <Bullets
          items={[
            'Update the "Last Updated" date at the top of this page',
            "Provide at least 14 days' notice before material changes affecting your rights or obligations take effect, via email or in-app notification where practicable",
          ]}
        />
        <p>
          If you do not agree with updated Terms, you may cancel your account before the effective date. Continued use
          after the effective date constitutes acceptance, without prejudice to any non-waivable right you hold under
          applicable law.
        </p>
      </Section>

      <Section title="42. Governing Law">
        <p>
          These Terms are governed by the laws of <strong className="font-medium text-foreground">Estonia</strong>,
          without regard to conflict-of-laws principles, except where mandatory consumer-protection law in your country
          of residence requires otherwise. BayLeaf OÜ is registered in Estonia.
        </p>
        <p>
          If you are a consumer located in the EU/EEA, UK, or another jurisdiction with mandatory local consumer
          protections, this section does not override those protections where applicable law requires otherwise.
        </p>
      </Section>

      <Section title="43. Dispute Resolution">
        <p>
          Disputes will first be addressed through good-faith negotiation between the parties. If unresolved within 30
          days, disputes are subject to the exclusive jurisdiction of the courts of{" "}
          <strong className="font-medium text-foreground">Tallinn, Estonia</strong>, except where mandatory consumer law
          in your jurisdiction gives you the right to bring claims in your local courts. Either party may seek emergency
          injunctive relief in a court of competent jurisdiction.
        </p>
      </Section>

      <Section title="44. Consumer Rights">
        <p>
          If you are using the Service as a consumer under the law of your country of residence, nothing in these Terms
          is intended to limit or waive any statutory right you cannot lawfully waive, including certain rights under
          EU/EEA, UK, or other applicable consumer-protection law. Where a provision of these Terms conflicts with such
          a mandatory right, the mandatory right prevails to the extent required by law.
        </p>
      </Section>

      <Section title="45. Severability">
        <p>
          If any provision of these Terms is found unenforceable, the remaining provisions remain in full effect to the
          extent permitted by law.
        </p>
      </Section>

      <Section title="46. Waiver">
        <p>
          Our failure to enforce any provision of these Terms does not constitute a waiver of our right to enforce it
          later.
        </p>
      </Section>

      <Section title="47. Assignment">
        <p>
          You may not assign your rights or obligations under these Terms without our prior written consent. We may assign
          these Terms in connection with a merger, acquisition, corporate restructuring, or sale of assets, provided the
          assignee agrees to honor these Terms.
        </p>
      </Section>

      <Section title="48. Entire Agreement">
        <p>
          These Terms, together with our{" "}
          <a href={PRIVACY_URL} className="text-brand hover:underline">Privacy Policy</a> and any additional
          product-specific terms we publish (such as API terms, if applicable), constitute the entire agreement between
          you and WebSoroban regarding the Service, to the extent permitted by law. We do not currently maintain a
          separate cookie policy or subscription-specific terms document beyond what is stated here and in the Privacy
          Policy.
        </p>
      </Section>

      <Section title="49. Contact Information">
        <Bullets
          items={[
            <>Trading name: <strong className="font-medium text-foreground">WebSoroban</strong></>,
            <>Website: <a href="https://websoroban.in" className="text-brand hover:underline">websoroban.in</a></>,
            <>Contact email: <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand hover:underline">{CONTACT_EMAIL}</a></>,
          ]}
        />
      </Section>
    </LegalPage>
  )
}
