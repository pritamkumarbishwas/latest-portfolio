import bundleAnalyzer from "@next/bundle-analyzer";
import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const withBundleAnalyzer = bundleAnalyzer({
  enabled:
    process.env.ANALYZE === "true" ||
    process.argv.includes("--webpack"),
  openAnalyzer: false,
});

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "mdx"],
  async headers() {
    return [
      {
        source: "/resume.pdf",
        headers: [
          {
            key: "Content-Disposition",
            value: 'attachment; filename="Pritam_Kumar_Bishwas_Resume.pdf"',
          },
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

const withMDX = createMDX({});

export default withBundleAnalyzer(withMDX(nextConfig));
