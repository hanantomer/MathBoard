/**
 * seoConfig.ts
 * SEO configuration for the MathBoard application
 */

export const seoConfig = {
  // Site information
  site: {
    name: "Math Whiteboard",
    url: process.env.VITE_APP_URL || "https://themathboard.com",
    description:
      "Interactive board for live classroom lessons and solo AI-tutor math practice",
    author: "Math Whiteboard Team",
    email: "mathboard16@gmail.com",
  },

  // Default meta tags
  meta: {
    title: "Math Whiteboard — Live classroom and AI math tutor",
    description:
      "Two ways to use the same board: live lessons with teachers and students, or solo AI-tutor practice. Type math on a grid, check work, and collaborate in class.",
    keywords:
      "math whiteboard, live classroom, AI math tutor, math practice, collaborative learning, teacher tools, interactive math",
    image: "/og-image.png",
    twitterHandle: "@mathboard",
  },

  // Social media
  /*social: {
    facebook: "https://www.facebook.com/mathboard",
    twitter: "https://twitter.com/mathboard",
    linkedin: "https://www.linkedin.com/company/mathboard",
    youtube: "https://www.youtube.com/@mathboard",
  },*/

  // Analytics
  analytics: {
    googleAnalyticsId: "G-5TXR2KXWS2",
    conversionTrackingId: "AW-18006829563",
  },

  // Sitemap
  sitemap: {
    baseUrl: process.env.VITE_APP_URL || "https://themathboard.com",
    updateFrequency: "weekly",
    defaultPriority: 0.5,
  },

  // Robots
  robots: {
    userAgent: "*",
    allow: ["/", "/practice"],
    disallow: ["/admin", "/private", "/api/", "/dist/", "/build/"],
    crawlDelay: 1,
  },

  // Performance
  performance: {
    enableCompression: true,
    enableCaching: true,
    cacheMaxAge: 86400, // 24 hours
  },

  // Structured Data
  organization: {
    name: "MathBoard",
    url: "https://themathboard.com",
    logo: "https://themathboard.com/logo.png",
    email: "mathboard16@gmail.com",
    /*sameAs: [
      "https://www.facebook.com/mathboard",
      "https://www.twitter.com/mathboard",
      "https://www.linkedin.com/company/mathboard",
    ],*/
  },

  // Breadcrumbs
  breadcrumbs: {
    enabled: true,
    separator: " > ",
  },

  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
  },

  // Search engines
  searchEngines: {
    googleVerification: process.env.VITE_GOOGLE_SITE_VERIFICATION,
    bingVerification: process.env.VITE_BING_SITE_VERIFICATION,
  },
};

export default seoConfig;
