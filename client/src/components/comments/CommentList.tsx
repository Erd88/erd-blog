import type { Comment } from '../../types/comment';
import { useAuth } from '../../hooks/useAuth';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';
import { Skeleton } from '../ui/Skeleton';
import { ErrorMessage } from '../ui/ErrorMessage';

interface CommentListProps {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  onAddComment: (content: string) => Promise<void>;
  onDeleteComment: (id: number) => Promise<void>;
  onRetry: () => void;
}

export function CommentList({
  comments,
  isLoading,
  error,
  onAddComment,
  onDeleteComment,
  onRetry,
}: CommentListProps) {
  const { user } = useAuth();

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Comments ({comments.length})
      </h3>

      {user ? (
        <div className="mb-6">
          <CommentForm onSubmit={onAddComment} />
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Please <a href="/login" className="text-primary-600 hover:underline">sign in</a> to leave a comment.
        </p>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 py-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={onRetry} />
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              canDelete={user?.id === comment.user_id || user?.role === 'admin'}
              onDelete={onDeleteComment}
            />
          ))}
        </div>
      )}
    </div>
  );
}
