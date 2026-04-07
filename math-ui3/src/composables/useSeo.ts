/**
 * useSeo.ts
 * Composable for managing SEO meta tags dynamically on each route
 * Usage: const seo = useSeo(); seo.setPageMeta({ title, description, keywords, image })
 */

export interface PageMeta {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string; // 'website', 'article', etc.
  author?: string;
  canonicalUrl?: string;
}

export default function useSeo() {
  /**
   * Update page meta tags
   */
  const setPageMeta = (meta: PageMeta) => {
    // Update title
    if (meta.title) {
      document.title = meta.title;
      updateMetaTag("og:title", meta.title);
      //updateMetaTag("twitter:title", meta.title);
    }

    // Update description
    if (meta.description) {
      updateMetaTag("description", meta.description);
      updateMetaTag("og:description", meta.description);
      //updateMetaTag("twitter:description", meta.description);
    }

    // Update keywords
    if (meta.keywords) {
      updateMetaTag("keywords", meta.keywords);
    }

    // Update image
    if (meta.image) {
      updateMetaTag("og:image", meta.image);
      //updateMetaTag("twitter:image", meta.image);
    }

    // Update URL
    if (meta.url) {
      updateMetaTag("og:url", meta.url);
      //updateMetaTag("twitter:url", meta.url);
    }

    // Update type
    if (meta.type) {
      updateMetaTag("og:type", meta.type);
    }

    // Update author
    if (meta.author) {
      updateMetaTag("author", meta.author);
    }

    // Update canonical URL
    if (meta.canonicalUrl) {
      updateCanonicalLink(meta.canonicalUrl);
    }
  };

  /**
   * Update or create a meta tag
   */
  const updateMetaTag = (name: string, content: string) => {
    let tag = document.querySelector(
      `meta[name="${name}"], meta[property="${name}"]`,
    ) as HTMLMetaElement;

    if (!tag) {
      tag = document.createElement("meta");
      if (name.startsWith("og:") || name.startsWith("twitter:")) {
        tag.setAttribute("property", name);
      } else {
        tag.setAttribute("name", name);
      }
      document.head.appendChild(tag);
    }

    tag.content = content;
  };

  /**
   * Update canonical link
   */
  const updateCanonicalLink = (url: string) => {
    let link = document.querySelector(
      'link[rel="canonical"]',
    ) as HTMLLinkElement;

    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }

    link.href = url;
  };

  /**
   * Set structured data (JSON-LD)
   */
  const setStructuredData = (schema: any) => {
    // Remove existing structured data
    const existingScript = document.querySelector(
      'script[type="application/ld+json"][data-seo-managed]',
    );
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-seo-managed", "true");
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  };

  /**
   * Set breadcrumb structured data
   */
  const setBreadcrumbs = (
    breadcrumbs: Array<{ name: string; url: string }>,
  ) => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    };

    setStructuredData(schema);
  };

  /**
   * Set article structured data
   */
  const setArticleData = (article: {
    headline: string;
    description: string;
    author: string;
    datePublished: string;
    dateModified?: string;
    image?: string;
    url: string;
  }) => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.headline,
      description: article.description,
      author: {
        "@type": "Person",
        name: article.author,
      },
      datePublished: article.datePublished,
      dateModified: article.dateModified || article.datePublished,
      image: article.image,
      url: article.url,
    };

    setStructuredData(schema);
  };

  /**
   * Reset to default page meta
   */
  const resetPageMeta = () => {
    setPageMeta({
      title:
        "Math Whiteboard - Online Collaborative Mathematics Learning Platform",
      description:
        "Math Whiteboard is an interactive online platform that enables teachers to create custom mathematics lessons and questions, while facilitating real-time collaboration between students and educators.",
      keywords:
        "mathematics, online learning, collaborative learning, math lessons, interactive math, education platform, teacher tools, create lessons",
      image: "https://themathboard.com/og-image.png",
      canonicalUrl: "https://mathboard.com/",
    });
  };

  return {
    setPageMeta,
    updateMetaTag,
    updateCanonicalLink,
    setStructuredData,
    setBreadcrumbs,
    setArticleData,
    resetPageMeta,
  };
}
