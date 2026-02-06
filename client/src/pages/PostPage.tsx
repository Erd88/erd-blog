import { useParams } from 'react-router-dom';
import { usePost } from '../hooks/usePost';
import { useComments } from '../hooks/useComments';
import { PostContent } from '../components/posts/PostContent';
import { PostMeta } from '../components/posts/PostMeta';
import { CommentList } from '../components/comments/CommentList';
import { Sidebar } from '../components/layout/Sidebar';
import { PostSEO } from '../components/seo/SEOHead';
import { BlogPostSchema, BreadcrumbSchema, generateBreadcrumbs } from '../components/seo/StructuredData';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Button } from '../components/ui/Button';

export function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { post, isLoading, error } = usePost(slug!);
  const { comments, isLoading: commentsLoading, error: commentsError, addComment, removeComment, refetch: refetchComments } = useComments(post?.id || 0);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-48 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorMessage message={error || 'Post not found'} />
        <div className="mt-4 text-center">
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const breadcrumbs = generateBreadcrumbs('post', { title: post.title });

  return (
    <>
      <PostSEO
        title={post.title}
        description={post.excerpt || undefined}
        slug={post.slug}
        coverImage={post.cover_image_url || undefined}
        author={post.author_name}
        publishedAt={post.published_at || post.created_at}
        modifiedAt={post.updated_at}
        tags={post.category_name ? [post.category_name] : undefined}
      />
      <BlogPostSchema
        title={post.title}
        description={post.excerpt || post.content.slice(0, 160)}
        slug={post.slug}
        publishedAt={post.published_at || post.created_at}
        updatedAt={post.updated_at}
        authorName={post.author_name}
        coverImage={post.cover_image_url || undefined}
        tags={post.category_name ? [post.category_name] : undefined}
        content={post.content}
      />
      <BreadcrumbSchema items={breadcrumbs} />

      <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            {/* Cover Image */}
            {post.cover_image_url && (
              <figure className="mb-8">
                <img
                  src={post.cover_image_url}
                  alt={post.title}
                  className="w-full h-64 md:h-96 object-cover rounded-xl"
                  loading="eager"
                />
              </figure>
            )}

            {/* Title */}
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
                {post.title}
              </h1>
              <PostMeta post={post} showCommentCount={false} />
            </header>

            {/* Content */}
            <div className="prose dark:prose-invert max-w-none mb-12">
              <PostContent content={post.content} />
            </div>

            {/* Tags */}
            {post.category_name && (
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="text-sm text-gray-500 dark:text-gray-400">Category:</span>
                <a
                  href={`/?category=${post.category_slug}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                >
                  {post.category_name}
                </a>
              </div>
            )}

            {/* Comments Section */}
            <hr className="border-gray-200 dark:border-gray-700 mb-8" />
            <CommentList
              comments={comments}
              isLoading={commentsLoading}
              error={commentsError}
              onAddComment={addComment}
              onDeleteComment={removeComment}
              onRetry={refetchComments}
            />
          </div>

          {/* Sidebar */}
          <aside className="lg:w-72 shrink-0">
            <Sidebar />
          </aside>
        </div>
      </article>
    </>
  );
}
