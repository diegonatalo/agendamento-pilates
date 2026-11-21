import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // o app logado e a API de login não têm nada para a busca
    rules: { userAgent: "*", allow: "/", disallow: ["/app", "/api"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
