import { Link } from 'react-router-dom';
import { useStats } from '../../hooks/useStats';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { SEOHead } from '../../components/seo/SEOHead';
import { format } from 'date-fns';

export function DashboardPage() {
  const { stats, isLoading, error, refetch } = useStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return <ErrorMessage message={error || 'Failed to load stats'} onRetry={refetch} />;
  }

  const statCards = [
    { label: 'Published Posts', value: stats.publishedPosts, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Draft Posts', value: stats.draftPosts, color: 'text-yellow-600 dark:text-yellow-400' },
    { label: 'Comments', value: stats.totalComments, color: 'text-green-600 dark:text-green-400' },
    { label: 'Users', value: stats.totalUsers, color: 'text-purple-600 dark:text-purple-400' },
    { label: 'Categories', value: stats.totalCategories, color: 'text-indigo-600 dark:text-indigo-400' },
    { label: 'Unread Messages', value: stats.unreadMessages, color: 'text-red-600 dark:text-red-400' },
  ];

  return (
    <>
      <SEOHead title="Admin Dashboard" />
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label}>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Posts</h2>
            <div className="space-y-3">
              {stats.recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <Link to={`/admin/posts/edit/${post.id}`} className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 truncate block">
                      {post.title}
                    </Link>
                    <p className="text-xs text-gray-400">{format(new Date(post.created_at), 'MMM d, yyyy')}</p>
                  </div>
                  <Badge variant={post.status === 'published' ? 'success' : 'warning'}>
                    {post.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Comments</h2>
            <div className="space-y-3">
              {stats.recentComments.map((comment) => (
                <div key={comment.id}>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{comment.content}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    by {comment.user_name} on <Link to={`/posts/${comment.post_slug}`} className="text-primary-600 dark:text-primary-400 hover:underline">{comment.post_title}</Link>
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
