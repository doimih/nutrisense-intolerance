"use client";

import { useEffect } from "react";
import { trackTikTokViewContent } from "@/components/TikTokPixel";

export default function PricingPageTracker() {
  useEffect(() => {
    trackTikTokViewContent("Pricing Plans", "pricing_page", 0);
  }, []);
  return null;
}
