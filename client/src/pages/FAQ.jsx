import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

import SEO from "../components/SEO";

const FAQ_ITEMS = [
  {
    question: "How do I place an order?",
    answer:
      "Browse our collection, select your desired size and color, then click Add to Cart. When you are ready, proceed to Checkout, enter your shipping details and choose your preferred payment method (Paystack, Stripe or Cash on Delivery). You will receive an email confirmation once your order is placed.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards through Paystack and Stripe, including Visa, Mastercard and American Express. Bank transfers, mobile money and Cash on Delivery are also available in selected regions.",
  },
  {
    question: "Do you offer complimentary shipping?",
    answer:
      "Yes. All orders above 500 qualify for complimentary insured shipping worldwide. Orders below this threshold are shipped for a flat rate of 25. Express delivery (1-2 business days) is available for 45.",
  },
  {
    question: "What is your return policy?",
    answer:
      "You may return any unworn item in its original condition and packaging within 30 days of delivery for a full refund. Timepieces must be returned with their certificates of authenticity. Please visit our Shipping and Returns page for full details.",
  },
  {
    question: "Are your products authentic?",
    answer:
      "Absolutely. Every Zealc.ollection piece is verified by our master artisans and accompanied by a certificate of authenticity. We do not sell, distribute or stock third-party goods of any kind.",
  },
  {
    question: "Do your watches come with a warranty?",
    answer:
      "Yes. All timepieces carry a two-year international warranty covering manufacturing defects. Leather goods are covered for one year. Please contact our concierge team with your order reference for any warranty claim.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Once your order ships, you will receive a tracking number by email. You can also view the status of all your orders in the Orders section of your account dashboard.",
  },
  {
    question: "Can I create an account?",
    answer:
      "Yes. Creating an account allows you to save addresses, track orders, manage your wishlist and receive exclusive offers. You can register from the Sign In page or during checkout.",
  },
  {
    question: "Do you offer gift packaging?",
    answer:
      "Every order is presented in signature Zealc.ollection packaging at no additional cost, including our embossed gift box, dust bags and a handwritten note option available at checkout.",
  },
  {
    question: "How do I contact customer service?",
    answer:
      "Our concierge team is available via email at concierge@zealcollection.com or by phone, Monday through Saturday, 10:00 to 19:00. You may also use the contact form on our Contact page.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <>
      <SEO title="FAQ" description="Frequently asked questions about shopping at Zealc.ollection." />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 pt-[120px] md:pt-[210px] pb-12 md:pb-20">
        <div className="text-center mb-14">
          <p className="eyebrow mb-3">Assistance</p>
          <h1 className="section-heading text-3xl md:text-5xl">
            Frequently Asked Questions
          </h1>
        </div>

        <div className="border-t border-mist">
          {FAQ_ITEMS.map((item, index) => (
            <div key={index} className="border-b border-mist">
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                aria-expanded={openIndex === index}
                className="w-full flex items-center justify-between gap-4 py-6 text-left"
              >
                <span className="font-display text-lg text-onyx">{item.question}</span>
                <ChevronDown
                  size={18}
                  className={`text-gold shrink-0 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="text-onyx/70 leading-relaxed pb-6 font-body text-sm">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="text-center mt-14">
          <p className="text-onyx/60 text-sm mb-6">
            Still have questions? Our concierge team is happy to help.
          </p>
          <Link to="/contact" className="btn-gold">
            Contact Us
          </Link>
        </div>
      </div>
    </>
  );
}
