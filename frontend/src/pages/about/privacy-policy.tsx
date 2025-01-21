import PublicLayout from "@/app/PublicLayout";
import React, { ReactElement } from "react";

const PrivacyPolicy = () => {
  return (
    <>
      <div className="p-6 lg:px-10 py-0 lg:py-24">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-2">
          Privacy Policy
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          <strong>Last updated: 8/18/2024</strong>
        </p>

        <p>
          Spydr is committed to protecting your privacy. This Privacy Policy
          explains how we collect, use, disclose, and safeguard your information
          when you use our application. Please read this policy carefully to
          understand our views and practices regarding your personal data and
          how we will treat it.
        </p>

        <h2>1. Information We Collect</h2>
        <p>We may collect and process the following types of information:</p>
        <ul>
          <li>
            <strong>Personal Information</strong>: Information that can be used
            to identify you, such as your name, email address, and login
            credentials.
          </li>
          <li>
            <strong>Usage Data</strong>: Information on how you access and use
            the app, including your interactions, preferences, and any data
            related to the usage of features.
          </li>
          <li>
            <strong>Device Information</strong>: Information about your device,
            such as IP address, browser type, operating system, and device
            identifiers.
          </li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>
          We may use the information we collect from you in the following ways:
        </p>
        <ul>
          <li>
            <strong>To provide and maintain our service</strong>: Ensuring the
            app functions as intended and improving user experience.
          </li>
          <li>
            <strong>To manage your account</strong>: Including the registration
            process, login, and authentication.
          </li>
          <li>
            <strong>To send notifications</strong>: Including emails, push
            notifications, or in-app messages for updates, security alerts, or
            other information that may be of interest to you.
          </li>
          <li>
            <strong>To analyze and improve our app</strong>: Understanding user
            behavior to enhance our features and services.
          </li>
        </ul>

        <h2>3. How We Share Your Information</h2>
        <p>
          We do not share your personal information with third parties except in
          the following circumstances:
        </p>
        <ul>
          <li>
            <strong>Service Providers</strong>: We may share your information
            with third-party service providers who assist us in operating our
            app, such as hosting, data analysis, and customer service.
          </li>
          <li>
            <strong>Legal Obligations</strong>: We may disclose your information
            if required by law, such as in response to a subpoena or legal
            request.
          </li>
          <li>
            <strong>Business Transfers</strong>: In the event of a merger,
            acquisition, or sale of all or part of our assets, your information
            may be transferred as part of that transaction.
          </li>
        </ul>

        <h2>4. Security of Your Information</h2>
        <p>
          We use administrative, technical, and physical security measures to
          protect your personal information. However, please be aware that no
          security system is impenetrable, and we cannot guarantee the security
          of our databases.
        </p>

        <h2>5. Your Data Protection Rights</h2>
        <p>
          Depending on your location, you may have the following rights
          regarding your personal information:
        </p>
        <ul>
          <li>
            <strong>Access</strong>: You have the right to request copies of
            your personal data.
          </li>
          <li>
            <strong>Correction</strong>: You have the right to request that we
            correct any information you believe is inaccurate.
          </li>
          <li>
            <strong>Erasure</strong>: You have the right to request that we
            delete your personal data.
          </li>
          <li>
            <strong>Restriction of Processing</strong>: You have the right to
            request that we restrict the processing of your personal data.
          </li>
          <li>
            <strong>Objection to Processing</strong>: You have the right to
            object to our processing of your personal data.
          </li>
          <li>
            <strong>Data Portability</strong>: You have the right to request
            that we transfer your data to another organization or directly to
            you.
          </li>
        </ul>
        <p>
          To exercise any of these rights, please contact spydrdev@gmail.com.
        </p>

        <h2>6. Children&apos;s Privacy</h2>
        <p>
          Our app does not address anyone under the age of 13. We do not
          knowingly collect personally identifiable information from children
          under 13. If we become aware that we have collected personal data from
          a child under 13, we will take steps to delete that information from
          our servers.
        </p>

        <h2>7. Changes to This Privacy Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you
          of any changes by posting the new Privacy Policy on this page and
          updating the &quot;Last updated&quot; date.
        </p>

        <h2>8. Contact</h2>
        <p>
          If you have any questions or concerns about this Privacy Policy,
          please contact us at:
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
