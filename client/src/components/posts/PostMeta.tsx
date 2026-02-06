import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import type { Post } from '../../types/post';

interface PostMetaProps {
  post: Post;
  showCommentCount?: boolean;
}

export function PostMeta({ post, showCommentCount = true }: PostMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
      <span>{post.author_name}</span>
      <span>&middot;</span>
      <time dateTime={post.published_at || post.created_at}>
        {format(new Date(post.published_at || post.created_at), 'MMM d, yyyy')}
      </time>
      {post.category_name && (
        <>
          <span>&middot;</span>
          <Link
            to={`/category/${post.category_slug}`}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            {post.category_name}
          </Link>
        </>
      )}
      {showCommentCount && post.comment_count > 0 && (
        <>
          <span>&middot;</span>
          <span>{post.comment_count} comment{post.comment_count !== 1 ? 's' : ''}</span>
        </>
      )}
    </div>
  );
}
