# SEO Implementation Checklist for Developers

Use this checklist when creating new components or pages in MathBoard.

## For Every New Page/Component

### Basic Meta Tags

- [ ] Unique page title (30-60 characters)
- [ ] Meta description (50-160 characters)
- [ ] Relevant keywords (5-10 keywords)
- [ ] Canonical URL set

### In Component Code

```typescript
import useSeo from "@/composables/useSeo";
import { onMounted } from "vue";

export default {
  setup() {
    const seo = useSeo();

    onMounted(() => {
      seo.setPageMeta({
        title: "Page Title | MathBoard",
        description:
          "This is a compelling description about the page content...",
        keywords: "keyword1, keyword2, keyword3",
      });
    });
  },
};
```

### Router Configuration

- [ ] Route added to `/src/router/index.ts`
- [ ] Title field in route meta
- [ ] Description field in route meta
- [ ] Keywords field in route meta

Example:

```typescript
{
  path: "/new-page",
  component: () => import("@/components/NewPage.vue"),
  name: "newPage",
  meta: {
    requiresAuth: true,
    title: "New Page Title - MathBoard",
    description: "Your page description here",
    keywords: "keyword1, keyword2, keyword3"
  }
}
```

### For Content Pages (Lessons, Questions, Answers)

- [ ] Use dynamic titles with content name
- [ ] Include breadcrumbs
- [ ] Add Article schema if applicable
- [ ] Optimize image alt text

```typescript
// Example for Lesson page
const seo = useSeo();

seo.setPageMeta({
  title: `${lesson.title} | Learn on MathBoard`,
  description: `Teacher-created lesson: ${lesson.summary}`,
  image: lesson.thumbnailUrl,
  canonicalUrl: `https://mathboard.com/lesson/${lesson.uuid}`,
});

// Add breadcrumbs
seo.setBreadcrumbs([
  { name: "Home", url: "/" },
  { name: "Lessons", url: "/lessons" },
  {
    name: lesson.title,
    url: `/lesson/${lesson.uuid}`,
  },
]);

// Add article schema
seo.setArticleData({
  headline: lesson.title,
  description: `Teacher-created mathematics lesson: ${lesson.summary}`,
  author: lesson.teacherName,
  datePublished: lesson.createdAt,
  dateModified: lesson.updatedAt,
  image: lesson.thumbnailUrl,
  url: `https://mathboard.com/lesson/${lesson.uuid}`,
});
```

## HTML Best Practices

### Images

```vue
<!-- ❌ WRONG -->
<img src="photo.png" />

<!-- ✅ RIGHT -->
<img
  src="photo.png"
  alt="Descriptive text about the image"
  loading="lazy"
/>
<v-img
  src="photo.png"
  alt="Descriptive alt text"
/>
```

### Headings

```vue
<!-- ✅ Proper heading hierarchy -->
<h1>{{ mainTitle }}</h1>
<h2>{{ sectionTitle }}</h2>
<h3>{{ subsectionTitle }}</h3>

<!-- ❌ AVOID: Skipping heading levels -->
<h1>Main Title</h1>
<h3>Subsection</h3>
<!-- Wrong: should be h2 -->
```

### Links

```vue
<!-- ✅ Descriptive link text -->
<a href="/lessons">Learn Math Lessons</a>

<!-- ❌ AVOID: Vague link text -->
<a href="/lessons">Click here</a>
```

## Utility Usage

### Generate slug from title

```typescript
import { SeoUtils } from "@/utils/seoUtils";

const slug = SeoUtils.slugify("My Lesson Title");
// Result: "my-lesson-title"
```

### Generate description from text

```typescript
const description = SeoUtils.generateDescription(
  longText,
  160,
);
// Automatically truncates to 160 characters with "..."
```

### Validate meta tags

```typescript
const validation = SeoUtils.validateMetaTags({
  title: "My Page",
  description: "This is a description",
  keywords: "keyword1, keyword2",
});

if (validation.valid) {
  console.log("SEO tags are valid");
} else {
  console.error(validation.errors);
}
```

## Configuration

### Access SEO Config

```typescript
import seoConfig from "@/config/seoConfig";

console.log(seoConfig.site.url);
console.log(seoConfig.site.name);
console.log(seoConfig.social.twitter);
```

### Environment Variables

Add to `.env.local`:

```
VITE_APP_URL=https://mathboard.com
VITE_GOOGLE_SITE_VERIFICATION=your-code
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

## Testing SEO

### Before Deploying

1. **Validate Meta Tags**

   ```typescript
   const errors = SeoUtils.validateMetaTags(meta);
   console.assert(
     errors.valid,
     "SEO validation failed:",
     errors,
   );
   ```

2. **Check Image Alt Text**
   - Verify all images have descriptive alt attributes
   - Use browser DevTools to audit images

3. **Test with Tools**
   - [Google PageSpeed Insights](https://pagespeed.web.dev/)
   - [Schema.org Validator](https://validator.schema.org/)
   - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - [Twitter Card Validator](https://cards-dev.twitter.com/validator)

4. **Mobile Friendly Test**
   - [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)

## Common Issues & Fixes

### Issue: Meta tag not updating on route change

**Solution:** Ensure router has `afterEach` hook that calls `seo.setPageMeta()`

- Check: `/src/router/index.ts` has router.afterEach()

### Issue: Duplicate content warning in Search Console

**Solution:** Ensure canonical URLs are set

```typescript
seo.setPageMeta({
  canonicalUrl: `https://mathboard.com${to.path}`,
});
```

### Issue: Images not showing in social previews

**Solution:** Verify og:image meta tag

```typescript
seo.updateMetaTag("og:image", imageUrl);
```

### Issue: Structured data not recognized

**Solution:** Validate with Schema.org validator

- Check JSON-LD syntax
- Verify @context and @type fields

## Performance Tips

1. **Lazy load images** with `loading="lazy"`
2. **Code split** components using `() => import()`
3. **Optimize bundle** - Check build size with `npm run build`
4. **Cache assets** - Vite handles this with content hashing
5. **Compress images** - Use tools like TinyPNG or ImageOptim

## Deployment Checklist

Before deploying to production:

- [ ] All routes have SEO meta tags
- [ ] robots.txt is accessible at `/robots.txt`
- [ ] sitemap.xml is accessible at `/sitemap.xml`
- [ ] Canonical URLs are correct
- [ ] Open Graph tags are configured
- [ ] No console errors related to SEO
- [ ] Mobile-friendly test passes
- [ ] PageSpeed score is acceptable
- [ ] Schema validation passes
- [ ] Environment variables configured

## Resources in Project

- `/src/composables/useSeo.ts` - Main SEO composable
- `/src/utils/seoUtils.ts` - Utility functions
- `/src/config/seoConfig.ts` - Configuration
- `/src/router/index.ts` - Router with SEO metadata
- `/public/robots.txt` - Search engine crawler rules
- `/public/sitemap.xml` - Site structure for search engines
- `/SEO-OPTIMIZATION-GUIDE.md` - Comprehensive guide

## Questions?

Refer to the full guide: `/SEO-OPTIMIZATION-GUIDE.md`

---

**Last Updated:** 2024-04-07
**Format:** Markdown
**For:** MathBoard Development Team
