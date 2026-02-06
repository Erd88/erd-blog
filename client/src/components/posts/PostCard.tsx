import { Link } from 'react-router-dom';
import type { Post } from '../../types/post';
import { PostMeta } from './PostMeta';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {post.cover_image_url && (
        <Link to={`/posts/${post.slug}`}>
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full h-48 object-cover"
          />
        </Link>
      )}
      <div className="p-6">
        <PostMeta post={post} />
        <h2 className="mt-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
          <Link to={`/posts/${post.slug}`} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            {post.title}
          </Link>
        </h2>
        {post.excerpt && (
          <p className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-3">
            {post.excerpt}
          </p>
        )}
        <Link
          to={`/posts/${post.slug}`}
          className="inline-flex items-center mt-4 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          Read more
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
