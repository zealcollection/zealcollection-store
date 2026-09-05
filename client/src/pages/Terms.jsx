import { Link } from "react-router-dom";
import SEO from "../components/SEO";

export default function Terms() {
  return (
    <>
      <SEO title="Terms and Conditions" description="Terms governing the use of the Zealc.ollection website and purchase of its products." />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 pt-[120px] md:pt-[210px] pb-12 md:pb-20">
        <p className="eyebrow text-center mb-3">Legal</p>
        <h1 className="section-heading text-3xl md:text-4xl text-center mb-12">
          Terms and Conditions
        </h1>

        <div className="space-y-10 text-onyx/75 leading-relaxed font-body text-[15px]">
          <Section title="1. Acceptance of Terms">
            By accessing or using the Zealc.ollection website and purchasing our
            products, you agree to be bound by these Terms and Conditions. If
            you do not agree, please do not use our services.
          </Section>

          <Section title="2. Products and Pricing">
            All product descriptions, images and pricing are provided in good
            faith. Prices are displayed in US Dollars unless otherwise stated
            and may change without notice. We reserve the right to limit
            quantities and to refuse or cancel orders, including where pricing
            errors occur.
          </Section>

          <Section title="3. Orders and Payment">
            An order constitutes an offer to purchase. A binding contract is
            formed only when we dispatch your items or send an order
            confirmation. Payment must be completed through our approved
            processors (Paystack or Stripe) or via Cash on Delivery where
            available.
          </Section>

          <Section title="4. Shipping and Delivery">
            Delivery times are estimates and not guarantees. Risk of loss
            passes to you upon delivery. You are responsible for providing
            accurate shipping information.
          </Section>

          <Section title="5. Returns and Refunds">
            Returns are accepted within 30 days of delivery for unworn items
            in original condition. Refunds are issued to the original payment
            method within 14 business days of receiving the returned item.
            Shipping costs are non-refundable unless the return results from
            our error.
          </Section>

          <Section title="6. Intellectual Property">
            All content on this website, including text, images, logos and
            designs, is the property of Zealc.ollection and is protected by intellectual
            property laws. You may not reproduce, distribute or modify any
            content without our written permission.
          </Section>

          <Section title="7. User Accounts">
            You are responsible for maintaining the confidentiality of your
            account credentials and for all activities under your account.
            Notify us immediately of any unauthorized use.
          </Section>

          <Section title="8. Limitation of Liability">
            To the maximum extent permitted by law, Zealc.ollection shall not be liable
            for indirect, incidental or consequential damages arising from the
            use of our website or products. Our total liability shall not
            exceed the amount paid for the product in question.
          </Section>

          <Section title="9. Governing Law">
            These Terms are governed by the laws of the United Kingdom, without
            regard to conflict of law principles.
          </Section>

          <Section title="10. Contact">
            Questions regarding these Terms may be directed to
            concierge@zealcollection.com or to 12 Luxury Lane, London SW1A 1AA,
            United Kingdom.
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
