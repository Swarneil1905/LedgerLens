import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/work", "/workspace/", "/chat/", "/saved/", "/bookmarks/"]
    },
    sitemap: `${base}/sitemap.xml`
  };
}
