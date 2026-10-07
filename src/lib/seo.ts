import type { Metadata } from "next";
import { site } from "@/config/site";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  publishedTime?: Date;
};

export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  publishedTime,
}: PageMetadataOptions): Metadata {
  const url = new URL(path, site.url).toString();
  const socialTitle = `${title} — ${site.name}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: socialTitle,
      description,
      url,
      siteName: site.name,
      locale: "en_US",
      type,
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
    },
  };
}
