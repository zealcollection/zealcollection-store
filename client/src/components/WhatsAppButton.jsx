import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { SiWhatsapp } from "react-icons/si";

const WHATSAPP_NUMBER = "254740320749";
const MESSAGE = "Hello Zealc.ollection, I'm interested in one of your pieces.";

export default function WhatsAppButton() {
  const location = useLocation();
  let productMessage = MESSAGE;

  // ProductDetails stores only the currently viewed product in sessionStorage.
  // The button stays generic everywhere else, so an old product can never be
  // attached to a WhatsApp inquiry from a different page.
  if (location.pathname.startsWith("/product/")) {
    try {
      const saved = JSON.parse(sessionStorage.getItem("whatsappProduct") || "null");
      if (saved?.name) {
        productMessage = `Hello Zealc.ollection, I'm interested in ${saved.name}.${saved.image ? `\nProduct image: ${saved.image}` : ""}`;
      }
    } catch {
      // Keep the generic message if sessionStorage is unavailable or corrupt.
    }
  }

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(productMessage)}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Zealc.ollection on WhatsApp"
      title="Chat with us on WhatsApp"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-colors hover:bg-[#1ebe5b] focus:outline-none focus:ring-4 focus:ring-[#25D366]/30"
    >
      <SiWhatsapp size={32} aria-hidden="true" />
    </motion.a>
  );
}
