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
      "We accept payments via M-Pesa Send Money. Simple, secure, and convenient.",
  },
  {
    question: "How does shipping work?",
    answer:
      "We deliver watches and handbags to customers across Kenya. Shipping fees apply to all orders and may vary depending on your location and delivery option. Once your order is confirmed, you’ll receive the relevant delivery details.",
  },
  {
    question: "What is your return policy?",
    answer:
      "You may return any unworn item in its original condition and packaging within **14 days of delivery** for a **90% refund of the purchase price**. Items must be returned with all original packaging, tags, and accessories. Please visit our Shipping and Returns page for full details.",
  },
  {
    question: "Are your products authentic?",
    answer:
      "Absolutely. Every Zealc.ollection piece is verified by our master artisans and accompanied by a certificate of authenticity. We do not sell, distribute or stock third-party goods of any kind.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Once your order ships, you will receive a tracking number by email.",
  },
  {
    question: "Do you offer gift packaging?",
    answer:
      "Every order is packaged at no additional cost.",
  },
  {
    question: "How do I contact customer service?",
    answer:
      "Our customer service team is available via email at zealc.ollection28@gmail.com. You may also use the contact form on our Contact page.",
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
