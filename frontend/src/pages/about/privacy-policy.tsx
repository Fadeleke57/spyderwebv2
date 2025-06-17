"use client"
import PublicLayout from "@/app/PublicLayout";
import { ReactElement } from "react";

const PrivacyPolicy = () => {
  return (
    <>
      <div className="p-6 lg:px-10 py-10 lg:py-24 flex flex-col gap-6">
        <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-3xl mb-2">
          Privacy Policy
        </h1>
        <p className="text-xl text-muted-foreground -mt-6">
          <strong>Last updated: 05/24/2025</strong>
        </p>

        <p>
          Spydr is committed to respecting your privacy and ensuring
          transparency around how your information is handled. This Privacy
          Policy outlines how we collect, process, and protect your data when
          you use Spydr&apos;s platform to upload content, create knowledge graphs,
          and interact with AI-based tools.
        </p>

        <h2>1. Information We Collect</h2>
        <p>We collect the following types of information:</p>
        <ul>
          <li>
            <strong>Account Information:</strong> Name, email address,
            authentication tokens, and account preferences.
          </li>
          <li>
            <strong>User Content:</strong> Files, web links, notes, audio,
            video, and other content you upload or ingest into Spydr for
            research and memory creation purposes.
          </li>
          <li>
            <strong>Usage Data:</strong> Interaction logs (e.g., which webs you
            open, sources you view, edits made) used for improving system
            performance and personalization.
          </li>
          <li>
            <strong>Device & Technical Info:</strong> IP address, device type,
            browser type, time zone, and cookies to support security, sync, and
            analytics.
          </li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>
            <strong>To deliver Spydr&apo;s core features:</strong> Such as
            generating relevance scores, linking claims to sources, summarizing
            content, and enabling semantic search across your memory graph.
          </li>
          <li>
            <strong>To personalize your experience:</strong> Such as
            recommending relevant sources, tags, or collaborators.
          </li>
          <li>
            <strong>To improve platform performance:</strong> We use aggregated
            and anonymized usage data to optimize how features work.
          </li>
          <li>
            <strong>To secure your account and content:</strong> Including
            auditing authentication events and alerting you of suspicious
            activity.
          </li>
        </ul>

        <h2>3. How We Share Your Information</h2>
        <p>
          We do not sell or share your personal or research data for
          advertising. We only share information in the following limited cases:
        </p>
        <ul>
          <li>
            <strong>Service Providers:</strong> For cloud hosting, storage
            (e.g., AWS/S3), and infrastructure processing (e.g., embeddings,
            semantic search), under strict data processing agreements.
          </li>
          <li>
            <strong>Legal Requirements:</strong> If required by law or to comply
            with a legal obligation, such as a subpoena or lawful request by
            public authorities.
          </li>
          <li>
            <strong>Business Continuity:</strong> If Spydr is involved in a
            merger or acquisition, you will be notified about the transfer and
            your data options.
          </li>
        </ul>

        <h2>4. Data Retention & Security</h2>
        <p>
          We retain your data for as long as your account remains active. You
          may delete your content or request account deletion at any time. All
          data is encrypted in transit and at rest. We regularly monitor for
          vulnerabilities and apply best practices to protect against
          unauthorized access.
        </p>

        <h2>5. Your Rights</h2>
        <p>You may request to:</p>
        <ul>
          <li>
            <strong>Access</strong> the personal and research data we store
            about you.
          </li>
          <li>
            <strong>Export</strong> your memories, webs, and linked sources as
            structured data.
          </li>
          <li>
            <strong>Correct</strong> or update inaccurate information.
          </li>
          <li>
            <strong>Delete</strong> your account and all associated data.
          </li>
          <li>
            <strong>Limit</strong> or object to certain types of data
            processing.
          </li>
        </ul>
        <p>
          Please email <strong>spydrdev@gmail.com</strong> to make any of these
          requests.
        </p>

        <h2>6. Children&apos;s Privacy</h2>
        <p>
          Spydr is not intended for children under 13. We do not knowingly
          collect data from children under 13. If we discover that a child has
          created an account, we will promptly delete all related information.
        </p>

        <h2>7. AI & Data Processing Transparency</h2>
        <p>
          Spydr may use third-party APIs to generate embeddings or summaries of
          your uploaded content. These services do not retain your data and are
          used only to enhance features such as semantic search, autolinking,
          and web insights. You can opt out of AI processing on a per-file
          basis.
        </p>

        <h2>8. Paid Tiers & Public Webs</h2>
        <p>
          Spydr offers paid subscription tiers that provide enhanced features
          and storage capacities. Users can also create public &ldquo;webs&rdquo; (formerly
          known as buckets) to share content on the Explore page. Please note
          that any information you choose to make public will be accessible to
          other users and may be indexed by search engines. We recommend
          exercising caution when sharing personal or sensitive information
          publicly.
        </p>

        <h2>9. Model Context Protocol (MCP) Integration</h2>
        <p>
          Spydr integrates with the Model Context Protocol (MCP) to allow secure
          access to your context by authorized clients such as Claude, Windsurf,
          and Cursor. This integration is secured using scoped OAuth provided by
          Stytch. You have full control over which clients can access your
          context and can revoke access at any time through your account
          settings.
        </p>

        <h2>10. Changes to This Policy</h2>
        <p>
          We may revise this Privacy Policy to reflect changes in our technology
          or legal obligations. We will update the “Last updated” date
          accordingly. Substantial changes will be communicated to users
          directly.
        </p>

        <h2>11. Contact</h2>
        <p>
          If you have questions, concerns, or requests related to privacy or
          data usage, contact us at:
        </p>
        <p>
          <strong>Email:</strong> spydrdev@gmail.com
        </p>
      </div>
    </>
  );
};

PrivacyPolicy.getLayout = (page: ReactElement) => {
  return <PublicLayout>{page}</PublicLayout>;
};

export default PrivacyPolicy;
