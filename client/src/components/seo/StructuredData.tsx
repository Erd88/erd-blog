import { Helmet } from 'react-helmet-async';

// Site configuration - adjust these values for your blog
const SITE_CONFIG = {
  name: 'My Blog',
  url: typeof window !== 'undefined' ? window.location.origin : '',
  description: 'A professional personal blog about technology, design, and development',
  logo: '/logo.png',
  author: {
    name: 'Blog Author',
    url: '/about',
  },
  social: {
    twitter: '@yourhandle',
    github: 'https://github.com/yourusername',
  },
};

/**
 * Base structured data types
 */
type WithContext<T> = T & { '@context': 'https://schema.org' };

interface WebSiteData {
  '@type': 'WebSite';
  name: string;
  url: string;
  description: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
}

interface BlogPostingData {
  '@type': 'BlogPosting';
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  author: {
    '@type': 'Person' | 'Organization';
    name: string;
    url?: string;
  };
  publisher?: {
    '@type': 'Organization';
    name: string;
    logo?: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  image?: string;
  articleBody?: string;
  keywords?: string[];
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbListData {
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }>;
}

interface OrganizationData {
  '@type': 'Organization' | 'Person';
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
}

/**
 * Website Schema (for homepage)
 */
export function WebSiteSchema() {
  const data: WithContext<WebSiteData> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_CONFIG.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(data)}
      </script>
    </Helmet>
  );
}

/**
 * Blog Post Schema (for individual posts)
 */
interface BlogPostSchemaProps {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  authorName?: string;
  coverImage?: string;
  tags?: string[];
  content?: string;
}

export function BlogPostSchema({
  title,
  description,
  slug,
  publishedAt,
  updatedAt,
  authorName,
  coverImage,
  tags,
  content,
}: BlogPostSchemaProps) {
  const data: WithContext<BlogPostingData> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    url: `${SITE_CONFIG.url}/posts/${slug}`,
    datePublished: publishedAt,
    dateModified: updatedAt || publishedAt,
    author: {
      '@type': 'Person',
      name: authorName || SITE_CONFIG.author.name,
      url: `${SITE_CONFIG.url}${SITE_CONFIG.author.url}`,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}${SITE_CONFIG.logo}`,
      },
    },
    image: coverImage ? (coverImage.startsWith('http') ? coverImage : `${SITE_CONFIG.url}${coverImage}`) : undefined,
    keywords: tags,
    articleBody: content?.slice(0, 5000), // Limit content length
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(data)}
      </script>
    </Helmet>
  );
}

/**
 * Breadcrumb Schema (for navigation)
 */
interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const data: WithContext<BreadcrumbListData> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_CONFIG.url}${item.url}`,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(data)}
      </script>
    </Helmet>
  );
}

/**
 * Organization/Person Schema
 */
export function OrganizationSchema() {
  const data: WithContext<OrganizationData> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}${SITE_CONFIG.logo}`,
    sameAs: [
      SITE_CONFIG.social.github,
      // Add more social links as needed
    ].filter(Boolean) as string[],
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(data)}
      </script>
    </Helmet>
  );
}

/**
 * Helper function to generate breadcrumb items for common pages
 */
export function generateBreadcrumbs(
  page: 'home' | 'post' | 'category' | 'search' | 'contact',
  params?: { title?: string; category?: string; query?: string }
): BreadcrumbItem[] {
  const base: BreadcrumbItem[] = [{ name: 'Home', url: '/' }];

  switch (page) {
    case 'post':
      return [...base, { name: params?.title || 'Post', url: `/posts/${params?.title || ''}` }];
    case 'category':
      return [...base, { name: 'Categories', url: '/' }, { name: params?.category || 'Category', url: `/category/${params?.category || ''}` }];
    case 'search':
      return [...base, { name: 'Search', url: `/search?q=${params?.query || ''}` }];
    case 'contact':
      return [...base, { name: 'Contact', url: '/contact' }];
    default:
      return base;
  }
}
