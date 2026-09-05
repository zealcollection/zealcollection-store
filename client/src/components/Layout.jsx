import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import WhatsAppButton from "./WhatsAppButton";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">{/* offset handled inside first sections; header overlays dark hero */}{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
