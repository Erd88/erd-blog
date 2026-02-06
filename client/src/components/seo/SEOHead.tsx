import { Helmet } from 'react-helmet-async';

// Site configuration
const SITE_CONFIG = {
  name: 'My Blog',
  defaultDescription: 'A professional personal blog about technology, design, and development',
  defaultImage: '/og-default.png',
  twitterHandle: '@yourhandle',
  themeColor: '#3b82f6',
};

interface SEOHeadProps {
  title: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
  author?: string;
  publishedAt?: string;
  modifiedAt?: string;
  tags?: string[];
}

/**
 * SEO Head Component
 * 
 * Comprehensive SEO meta tags for React applications.
 * Uses react-helmet-async for server-side rendering compatibility.
 * 
 * @example
 * // Basic usage
 * <SEOHead title="Home" />
 * 
 * // Post page
 * <SEOHead 
 *   title="My Post Title"
 *   description="Post excerpt..."
 *   type="article"
 *   author="Author Name"
 *   publishedAt="2024-01-15"
 *   tags={["react", "javascript"]}
 * />
 */
export function SEOHead({
  title,
  description,
  keywords,
  ogImage,
  canonicalUrl,
  noIndex = false,
  type = 'website',
  author,
  publishedAt,
  modifiedAt,
  tags,
}: SEOHeadProps) {
  const fullTitle = title === SITE_CONFIG.name ? title : `${title} | ${SITE_CONFIG.name}`;
  const metaDescription = description || SITE_CONFIG.defaultDescription;
  const ogImageUrl = ogImage || SITE_CONFIG.defaultImage;
  
  // Get the full canonical URL
  const siteUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : (import.meta.env.VITE_SITE_URL ?? '');
  const fullCanonicalUrl = canonicalUrl 
    ? (canonicalUrl.startsWith('http') ? canonicalUrl : `${siteUrl}${canonicalUrl}`)
    : (typeof window !== 'undefined' ? window.location.href : '');
  
  // Clean canonical URL (remove hash, query params)
  const cleanCanonicalUrl = fullCanonicalUrl.split('?')[0].split('#')[0];

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      
      {/* Canonical URL */}
      <link rel="canonical" href={cleanCanonicalUrl} />
      
      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
      )}
      
      {/* Theme Color */}
      <meta name="theme-color" content={SITE_CONFIG.themeColor} />
      <meta name="msapplication-TileColor" content={SITE_CONFIG.themeColor} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:site_name" content={SITE_CONFIG.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={cleanCanonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:image" content={ogImageUrl.startsWith('http') ? ogImageUrl : `${siteUrl}${ogImageUrl}`} />
      <meta property="og:image:alt" content={fullTitle} />
      
      {/* Article specific tags */}
      {type === 'article' && (
        <>
          {author && <meta property="article:author" content={author} />}
          {publishedAt && <meta property="article:published_time" content={publishedAt} />}
          {modifiedAt && <meta property="article:modified_time" content={modifiedAt} />}
          {tags?.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SITE_CONFIG.twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImageUrl.startsWith('http') ? ogImageUrl : `${siteUrl}${ogImageUrl}`} />
      <meta name="twitter:image:alt" content={fullTitle} />
      {author && <meta name="twitter:creator" content={author} />}
      
      {/* Additional SEO tags */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-title" content={SITE_CONFIG.name} />
      <meta name="application-name" content={SITE_CONFIG.name} />
    </Helmet>
  );
}

/**
 * Pre-configured SEO for common page types
 */
export function HomeSEO() {
  return (
    <SEOHead
      title={SITE_CONFIG.name}
      description={SITE_CONFIG.defaultDescription}
      keywords={['blog', 'technology', 'programming', 'web development']}
      type="website"
    />
  );
}

export function PostSEO({
  title,
  description,
  slug,
  coverImage,
  author,
  publishedAt,
  modifiedAt,
  tags,
}: {
  title: string;
  description?: string;
  slug: string;
  coverImage?: string;
  author?: string;
  publishedAt?: string;
  modifiedAt?: string;
  tags?: string[];
}) {
  return (
    <SEOHead
      title={title}
      description={description}
      keywords={tags}
      ogImage={coverImage}
      canonicalUrl={`/posts/${slug}`}
      type="article"
      author={author}
      publishedAt={publishedAt}
      modifiedAt={modifiedAt}
      tags={tags}
    />
  );
}

export function CategorySEO({ name, description }: { name: string; description?: string }) {
  return (
    <SEOHead
      title={`${name} Posts`}
      description={description || `Read all posts in the ${name} category`}
      keywords={[name.toLowerCase(), 'blog']}
      canonicalUrl={`/category/${name.toLowerCase()}`}
    />
  );
}

export function NotFoundSEO() {
  return (
    <SEOHead
      title="Page Not Found"
      description="The page you're looking for doesn't exist."
      noIndex
    />
  );
}
