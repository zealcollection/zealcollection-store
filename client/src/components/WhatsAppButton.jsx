import { motion } from "framer-motion";
import { SiWhatsapp } from "react-icons/si";

const WHATSAPP_NUMBER = "254718690768";
const MESSAGE = "Hello Zealc.ollection, I'm interested in one of your pieces.";

export default function WhatsAppButton() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(MESSAGE)}`;

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
