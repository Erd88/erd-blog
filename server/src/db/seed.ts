import { getDb, dbGet, dbRun } from './connection.js';
import { initializeDatabase } from './schema.js';
import { hashPassword } from '../utils/password.js';
import { slugify } from '../utils/slugify.js';

async function seed() {
  await getDb();
  await initializeDatabase();

  const existingAdmin = dbGet("SELECT id FROM users WHERE email = 'admin@blog.com'");
  if (existingAdmin) {
    console.log('Seed data already exists. Skipping.');
    return;
  }

  const adminHash = await hashPassword('admin123');
  const userHash = await hashPassword('user123');

  // Create admin
  dbRun(
    "INSERT INTO users (email, password_hash, display_name, role, bio) VALUES (?, ?, ?, 'admin', ?)",
    ['admin@blog.com', adminHash, 'Admin', 'Blog administrator and content creator.']
  );

  // Create a regular user
  dbRun(
    "INSERT INTO users (email, password_hash, display_name, bio) VALUES (?, ?, ?, ?)",
    ['user@blog.com', userHash, 'John Doe', 'Regular blog reader and commenter.']
  );

  // Categories
  const categories = [
    { name: 'Technology', description: 'Latest in tech and programming' },
    { name: 'Design', description: 'UI/UX and visual design' },
    { name: 'Tutorials', description: 'Step-by-step guides' },
    { name: 'Opinion', description: 'Thoughts and perspectives' },
  ];

  for (const cat of categories) {
    dbRun(
      'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
      [cat.name, slugify(cat.name), cat.description]
    );
  }

  // Sample posts
  const posts = [
    {
      title: 'Getting Started with TypeScript in 2025',
      content: `## Why TypeScript?

TypeScript has become the standard for modern web development. With its powerful type system, you can catch errors before they reach production.

### Key Benefits

- **Type Safety**: Catch bugs at compile time
- **Better IDE Support**: Autocomplete, refactoring, and navigation
- **Self-Documenting Code**: Types serve as documentation
- **Gradual Adoption**: Add types incrementally to existing projects

### Setting Up

\`\`\`bash
npm init -y
npm install typescript tsx @types/node -D
npx tsc --init
\`\`\`

### Your First TypeScript File

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

function greet(user: User): string {
  return \`Hello, \${user.name}!\`;
}
\`\`\`

TypeScript makes your code more maintainable and your team more productive. Start using it today!`,
      category_id: 1,
      status: 'published',
    },
    {
      title: 'Building Modern UIs with Tailwind CSS',
      content: `## The Utility-First Approach

Tailwind CSS has revolutionized how we write styles. Instead of writing custom CSS, you compose designs using utility classes.

### Why Tailwind?

1. **Rapid Development**: Build UIs faster without switching between files
2. **Consistent Design**: Design system built into the framework
3. **Small Bundle Size**: PurgeCSS removes unused styles
4. **Responsive Design**: Mobile-first responsive utilities

### Example Component

\`\`\`html
<div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
  <div class="p-8">
    <h2 class="text-xl font-semibold text-gray-800">Card Title</h2>
    <p class="mt-2 text-gray-600">Card description goes here.</p>
  </div>
</div>
\`\`\`

### Dark Mode

Tailwind makes dark mode trivial with the \`dark:\` prefix.`,
      category_id: 2,
      status: 'published',
    },
    {
      title: 'RESTful API Design Best Practices',
      content: `## Designing Great APIs

A well-designed API is intuitive, consistent, and easy to use.

### Use Proper HTTP Methods

- **GET**: Retrieve resources
- **POST**: Create new resources
- **PUT**: Update entire resources
- **PATCH**: Partial updates
- **DELETE**: Remove resources

### Consistent Response Format

\`\`\`json
{
  "data": { "id": 1, "name": "Example" },
  "pagination": { "page": 1, "limit": 10, "total": 100 }
}
\`\`\`

### Error Handling

Always return meaningful error messages with appropriate status codes.`,
      category_id: 3,
      status: 'published',
    },
    {
      title: 'The Future of Web Development',
      content: `## What's Coming Next?

The web development landscape is evolving rapidly.

### Server Components

React Server Components are changing how we think about rendering.

### AI-Assisted Development

Tools like GitHub Copilot and Claude are making developers more productive.

### Edge Computing

Running code closer to users reduces latency.

### My Take

The best time to be a web developer is now.`,
      category_id: 4,
      status: 'published',
    },
    {
      title: 'Draft: Upcoming SQLite Features',
      content: `## SQLite Keeps Getting Better

This is a draft post about upcoming SQLite features.

### JSON Support Improvements
### Better Full-Text Search
### Performance Enhancements`,
      category_id: 1,
      status: 'draft',
    },
  ];

  for (const post of posts) {
    const slug = slugify(post.title);
    const excerpt = post.content.slice(0, 200).replace(/[#*`>\-\[\]]/g, '').trim();
    const publishedAt = post.status === 'published' ? new Date().toISOString() : null;

    dbRun(
      `INSERT INTO posts (title, slug, content, excerpt, author_id, category_id, status, published_at)
       VALUES (?, ?, ?, ?, 1, ?, ?, ?)`,
      [post.title, slug, post.content, excerpt, post.category_id, post.status, publishedAt]
    );
  }

  // Sample comments
  dbRun('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
    [1, 2, 'Great introduction to TypeScript! Very helpful for beginners.']);

  dbRun('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
    [1, 1, 'Thanks! Glad you found it useful. More tutorials coming soon.']);

  dbRun('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
    [2, 2, 'Tailwind CSS is amazing. I switched from Bootstrap and never looked back.']);

  console.log('Seed data created successfully!');
  console.log('Admin: admin@blog.com / admin123');
  console.log('User: user@blog.com / user123');
}

seed().catch(console.error);
