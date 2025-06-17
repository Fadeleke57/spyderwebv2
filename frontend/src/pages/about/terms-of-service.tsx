"use client"
import PublicLayout from "@/app/PublicLayout";
import { ReactElement } from "react";

const TermsOfService = () => {
  return (
    <div className="p-6 lg:px-10 py-10 lg:py-24 flex flex-col gap-6">
      <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-3xl">
        Terms of Service
      </h1>
      <p className="text-xl text-muted-foreground -mt-4">
        <strong>Last updated: 05/24/2025</strong>
      </p>

      <p>
        Welcome to Spydr! These Terms of Service (&ldquo;Terms&rdquo;) govern your access to
        and use of Spydr, a platform that enables users to research, collect,
        organize, and analyze content using AI-powered tools, vector search, and
        contextual knowledge graphs. By accessing or using Spydr, you agree to
        be bound by these Terms. Please read them carefully.
      </p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By using Spydr, you confirm that you have read, understood, and agree to
        these Terms. If you do not agree, do not use the platform.
      </p>

      <h2>2. Use of Spydr</h2>
      <p>
        You may use Spydr to ingest and organize information from various
        sources—including websites, documents, videos, and audio—and interact
        with AI to generate summaries, insights, and contextual connections. You
        agree to use Spydr in accordance with all applicable laws and these
        Terms.
      </p>

      <h2>3. User Accounts</h2>
      <p>
        Certain features require an account. You are responsible for
        safeguarding your credentials and agree not to share access with others.
        You are responsible for all activity under your account.
      </p>

      <h2>4. User Content & Data Handling</h2>
      <p>
        You retain ownership of any content you upload or create in Spydr. By
        using the service, you grant us a limited license to process your
        data—strictly to provide core platform features, including contextual
        linking, summarization, and embedding for retrieval. We do not sell or
        share your personal data or research content with third parties.
      </p>

      <h2>5. Prohibited Activities</h2>
      <p>You agree not to:</p>
      <ul>
        <li>
          Use Spydr to upload or distribute harmful, illegal, or deceptive
          content.
        </li>
        <li>
          Reverse-engineer, copy, or misuse Spydr to develop competing services.
        </li>
        <li>Bypass access controls, rate limits, or security measures.</li>
        <li>
          Misrepresent AI-generated content as factual without independent
          verification.
        </li>
      </ul>

      <h2>6. Intellectual Property</h2>
      <p>
        Spydr and its underlying technology—including its interface, graph
        systems, and semantic search pipelines—are protected by copyright,
        trademark, and other laws. You may not duplicate or redistribute any
        part of the platform without permission.
      </p>

      <h2>7. Termination</h2>
      <p>
        We reserve the right to suspend or terminate access to Spydr if you
        violate these Terms or engage in behavior that harms the platform or its
        users. Termination does not affect your rights to export your data.
      </p>

      <h2>8. Disclaimer of Warranties</h2>
      <p>
        Spydr is provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo; We do not guarantee
        uninterrupted service, perfect accuracy of AI responses, or suitability
        for any specific research or legal purpose.
      </p>

      <h2>9. Limitation of Liability</h2>
      <p>
        We are not liable for any loss, damage, or disruption resulting from
        your use of Spydr. You assume all responsibility for decisions made
        based on content retrieved, summarized, or generated through the
        platform.
      </p>

      <h2>10. Governing Law</h2>
      <p>
        These Terms are governed by the laws of the United States. Any disputes
        will be resolved in accordance with applicable federal and state law.
      </p>

      <h2>11. Changes to Terms</h2>
      <p>
        We may update these Terms to reflect improvements or changes in our
        services. The latest version will always be available on this page, with
        the &ldquo;Last updated&rdquo; date modified accordingly.
      </p>

      <h2>12. Contact</h2>
      <p>Questions about these Terms? Reach out to us at:</p>
      <p>
        <strong>Email:</strong> spydrdev@gmail.com
      </p>
    </div>
  );
};

TermsOfService.getLayout = (page: ReactElement) => {
  return <PublicLayout>{page}</PublicLayout>;
};

export default TermsOfService;
