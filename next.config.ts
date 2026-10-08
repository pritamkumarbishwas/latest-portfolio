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
};

const withMDX = createMDX({});

export default withBundleAnalyzer(withMDX(nextConfig));
