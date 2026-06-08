import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://prodegrupoparis.com"
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/ranking", "/bases", "/terminos"],
        disallow: ["/admin/", "/dashboard/", "/callcenter/", "/api/", "/auth/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
