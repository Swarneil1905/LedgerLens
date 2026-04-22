import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1
    },
    {
      url: `${base}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8
    },
    {
      url: `${base}/features`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8
    }
  ];
}
