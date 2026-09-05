import { Link } from "react-router-dom";
import SEO from "../components/SEO";

export default function PrivacyPolicy() {
  return (
    <>
      <SEO title="Privacy Policy" description="How Zealc.ollection collects, uses and protects your personal information." />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 pt-[120px] md:pt-[210px] pb-12 md:pb-20">
        <p className="eyebrow text-center mb-3">Legal</p>
        <h1 className="section-heading text-3xl md:text-4xl text-center mb-12">
          Privacy Policy
        </h1>

        <div className="space-y-10 text-onyx/75 leading-relaxed font-body text-[15px]">
          <Section title="1. Introduction">
            Zealc.ollection (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your
            privacy. This Privacy Policy explains how we collect, use, disclose
            and safeguard your personal information when you visit our website
            or purchase our products.
          </Section>

          <Section title="2. Information We Collect">
            We may collect personal information that you provide directly, such
            as your name, email address, postal address, telephone number and
            payment details when you create an account, place an order or
            contact us. We also automatically collect certain technical data,
            including your IP address, browser type, device information and
            pages visited, through cookies and similar technologies.
          </Section>

          <Section title="3. How We Use Your Information">
            We use your personal information to process and fulfill orders,
            manage your account, communicate about your purchases, send
            marketing communications with your consent, improve our website and
            products, and comply with legal obligations.
          </Section>

          <Section title="4. Sharing of Information">
            We share your information only with trusted service providers who
            assist us in operating our business, such as payment processors
            (Paystack and Stripe), shipping carriers and Cloudinary for media
            storage. These parties are contractually bound to protect your
            information and may not use it for any other purpose.
          </Section>

          <Section title="5. Cookies">
            Our website uses cookies to remember your preferences, keep you
            signed in and analyse site usage. You can control cookies through
            your browser settings. Disabling cookies may limit some
            functionality of the website.
          </Section>

          <Section title="6. Data Security">
            We implement appropriate technical and organizational measures to
            protect your personal information against unauthorized access,
            alteration, disclosure or destruction, including encrypted
            connections and secure payment processing.
          </Section>

          <Section title="7. Your Rights">
            Depending on your jurisdiction, you may have the right to access,
            correct, delete or port your personal information, and to withdraw
            consent to marketing communications at any time. To exercise these
            rights, please contact us at concierge@zealcollection.com.
          </Section>

          <Section title="8. Data Retention">
            We retain your personal information only for as long as necessary
            to fulfill the purposes described in this policy, or as required by
            law.
          </Section>

          <Section title="9. Changes to This Policy">
            We may update this Privacy Policy from time to time. Any changes
            will be posted on this page with a revised effective date.
          </Section>

          <Section title="10. Contact Us">
            If you have questions about this Privacy Policy, please contact us
            at concierge@zealcollection.com or write to 12 Luxury Lane, London SW1A
            1AA, United Kingdom.
          </Section>
        </div>

        <div className="text-center mt-14">
          <Link to="/" className="btn-luxury-outline">
            Return to Home
          </Link>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="font-display text-xl text-onyx mb-3">{title}</h2>
      <p>{children}</p>
    </div>
  );
}
