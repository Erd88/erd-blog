import { Link } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories';
import { Skeleton } from '../ui/Skeleton';

interface SidebarProps {
  recentPosts?: { slug: string; title: string }[];
}

export function Sidebar({ recentPosts }: SidebarProps) {
  const { categories, isLoading } = useCategories();

  return (
    <aside className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
          Categories
        </h3>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
          </div>
        ) : (
          <div className="space-y-1">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="flex items-center justify-between px-3 py-2 text-sm rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <span>{cat.name}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{cat.post_count}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {recentPosts && recentPosts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
            Recent Posts
          </h3>
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <Link
                key={post.slug}
                to={`/posts/${post.slug}`}
                className="block text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors line-clamp-2"
              >
                {post.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
