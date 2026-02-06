import { Router, Request, Response, NextFunction } from 'express';
import { dbAll } from '../db/connection.js';
import { config } from '../config.js';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import type { PostWithAuthor } from '../types/post.js';

const router = Router();

const SITE_URL = config.corsOrigin;
const SITE_TITLE = 'My Blog';
const SITE_DESCRIPTION = 'A professional personal blog';

// RSS 2.0
router.get('/rss', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const posts = dbAll<PostWithAuthor>(
      `SELECT p.*, u.display_name as author_name
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       WHERE p.status = 'published'
       ORDER BY p.published_at DESC
       LIMIT 20`
    );

    const items = posts.map((post) => {
      const html = sanitizeHtml(marked(post.content) as string);
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_URL}/posts/${post.slug}</link>
      <description><![CDATA[${post.excerpt || ''}]]></description>
      <content:encoded><![CDATA[${html}]]></content:encoded>
      <author>${post.author_name}</author>
      <pubDate>${new Date(post.published_at || post.created_at).toUTCString()}</pubDate>
      <guid isPermaLink="true">${SITE_URL}/posts/${post.slug}</guid>
    </item>`;
    }).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_TITLE}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/api/feed/rss" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`;

    res.type('application/xml').send(xml);
  } catch (err) {
    next(err);
  }
});

// Sitemap
router.get('/sitemap.xml', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const posts = dbAll<{ slug: string; updated_at: string }>(
      "SELECT slug, updated_at FROM posts WHERE status = 'published' ORDER BY published_at DESC"
    );

    const categories = dbAll<{ slug: string }>('SELECT slug FROM categories');

    const urls = [
      `<url><loc>${SITE_URL}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
      ...posts.map(p =>
        `<url><loc>${SITE_URL}/posts/${p.slug}</loc><lastmod>${p.updated_at}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`
      ),
      ...categories.map(c =>
        `<url><loc>${SITE_URL}/category/${c.slug}</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>`
      ),
    ].join('\n  ');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;

    res.type('application/xml').send(xml);
  } catch (err) {
    next(err);
  }
});

// Robots.txt
router.get('/robots.txt', (_req: Request, res: Response) => {
  res.type('text/plain').send(
    `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/api/feed/sitemap.xml\n`
  );
});

export default router;
