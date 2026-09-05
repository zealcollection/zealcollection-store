import { useEffect } from "react";

export default function SEO({ title, description }) {
  useEffect(() => {
    const previousTitle = document.title;
    const previousDescription = document
      .querySelector('meta[name="description"]')
      ?.getAttribute("content");

    document.title = title ? `${title} | Zealc.ollection` : "Zealc.ollection - Luxury Watches, Handbags and Nightwear";

    const metaDescription =
      document.querySelector('meta[name="description"]') ||
      document.createElement("meta");
    metaDescription.setAttribute("name", "description");
    metaDescription.setAttribute("content", description || "Timeless luxury watches, handbags and nightwear.");
    if (!metaDescription.parentElement) {
      document.head.appendChild(metaDescription);
    }

    return () => {
      document.title = previousTitle;
      if (previousDescription !== undefined) {
        metaDescription.setAttribute("content", previousDescription || "");
      }
    };
  }, [title, description]);

  return null;
}
