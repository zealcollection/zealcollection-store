import { Suspense } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import WhatsAppButton from "./WhatsAppButton";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <ScrollToTop />
      <Navbar />
      {/* Suspense boundary scoped to just the routed page: each page is
          lazy-loaded, and on a slow connection its chunk can still be in
          flight after navigate() has already fired. Keeping the boundary
          here (instead of around the whole app) means the Navbar and its
          mobile drawer stay mounted and responsive - the drawer still
          closes immediately - while only the page content below waits. */}
      <main className="flex-1">{/* offset handled inside first sections; header overlays dark hero */}<Suspense fallback={null}>{children}</Suspense></main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}