/**
 * seoUtils.ts
 * Utilities for SEO optimization
 */

export class SeoUtils {
  /**
   * Generate a sitemap entry
   */
  static generateSitemapEntry(
    url: string,
    lastmod?: Date,
    changefreq?:
      | "always"
      | "hourly"
      | "daily"
      | "weekly"
      | "monthly"
      | "yearly"
      | "never",
    priority?: number,
  ): string {
    const lastmodStr = lastmod
      ? lastmod.toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];
    const changefreqStr = changefreq || "weekly";
    const priorityValue = priority !== undefined ? priority : 0.5;

    return `  <url>
    <loc>${this.escapeXml(url)}</loc>
    <lastmod>${lastmodStr}</lastmod>
    <changefreq>${changefreqStr}</changefreq>
    <priority>${priorityValue}</priority>
  </url>`;
  }

  /**
   * Escape XML special characters
   */
  static escapeXml(str: string): string {
    const xmlEscapeMap: { [key: string]: string } = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;",
    };

    return str.replace(/[&<>"']/g, (char) => xmlEscapeMap[char]);
  }

  /**
   * Generate a slug from a string
   */
  static slugify(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /**
   * Generate a meta description from a longer text
   */
  static generateDescription(text: string, maxLength: number = 160): string {
    if (text.length <= maxLength) {
      return text;
    }

    return text.substring(0, maxLength - 3) + "...";
  }

  /**
   * Generate keywords from a title
   */
  static generateKeywords(
    title: string,
    additionalKeywords?: string[],
  ): string {
    const words = title
      .toLowerCase()
      .split(/[\s\-_]+/)
      .filter((word) => word.length > 3); // Filter short words

    const combined = [...words, ...(additionalKeywords || [])];
    return combined.slice(0, 10).join(", "); // Limit to 10 keywords
  }

  /**
   * Validate meta tags
   */
  static validateMetaTags(meta: {
    title?: string;
    description?: string;
    keywords?: string;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Title validation
    if (!meta.title) {
      errors.push("Title is required");
    } else if (meta.title.length < 10) {
      errors.push("Title should be at least 10 characters");
    } else if (meta.title.length > 60) {
      errors.push("Title should not exceed 60 characters");
    }

    // Description validation
    if (!meta.description) {
      errors.push("Description is required");
    } else if (meta.description.length < 50) {
      errors.push("Description should be at least 50 characters");
    } else if (meta.description.length > 160) {
      errors.push("Description should not exceed 160 characters");
    }

    // Keywords validation
    if (meta.keywords) {
      const keywordArray = meta.keywords.split(",").map((k) => k.trim());
      if (keywordArray.length > 10) {
        errors.push("Should have no more than 10 keywords");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate Open Graph meta tags
   */
  static generateOGTags(data: {
    title: string;
    description: string;
    image?: string;
    url?: string;
    type?: string;
  }): { [key: string]: string } {
    return {
      "og:title": data.title,
      "og:description": data.description,
      "og:image": data.image || "https://mathboard.com/og-image.png",
      "og:url": data.url || "https://mathboard.com",
      "og:type": data.type || "website",
    };
  }

  /**
   * Generate Twitter Card meta tags
   */
  static generateTwitterTags(data: {
    title: string;
    description: string;
    image?: string;
    url?: string;
  }): { [key: string]: string } {
    return {
      "twitter:card": "summary_large_image",
      "twitter:title": data.title,
      "twitter:description": data.description,
      "twitter:image": data.image || "https://mathboard.com/twitter-image.png",
      "twitter:url": data.url || "https://mathboard.com",
    };
  }

  /**
   * Generate FAQ schema
   */
  static generateFAQSchema(items: Array<{ question: string; answer: string }>) {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    };
  }

  /**
   * Generate Organization schema
   */
  static generateOrganizationSchema(data: {
    name: string;
    url: string;
    logo?: string;
    email?: string;
    phone?: string;
  }) {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: data.name,
      url: data.url,
      logo: data.logo || "https://mathboard.com/logo.png",
      email: data.email,
      phone: data.phone,
      sameAs: [
        "https://www.facebook.com/mathboard",
        "https://www.twitter.com/mathboard",
        "https://www.linkedin.com/company/mathboard",
      ],
    };
  }

  /**
   * Check for SEO issues in HTML content
   */
  static checkSEOIssues(html: string): string[] {
    const issues: string[] = [];

    // Check for images without alt text
    const imgRegex = /<img(?!.*alt=)/g;
    if (imgRegex.test(html)) {
      issues.push("Images without alt text found");
    }

    // Check for heading structure
    if (!/<h1/.test(html)) {
      issues.push("No H1 heading found");
    }

    // Check for meta description
    if (!/<meta.*name="description"/.test(html)) {
      issues.push("No meta description found");
    }

    return issues;
  }
}

export default SeoUtils;
