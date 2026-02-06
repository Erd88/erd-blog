import { format } from 'date-fns';
import type { Comment } from '../../types/comment';
import { Badge } from '../ui/Badge';

interface CommentItemProps {
  comment: Comment;
  canDelete: boolean;
  onDelete: (id: number) => void;
}

export function CommentItem({ comment, canDelete, onDelete }: CommentItemProps) {
  return (
    <div className="flex gap-4 py-4">
      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold text-sm shrink-0">
        {comment.user_name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
            {comment.user_name}
          </span>
          {comment.user_role === 'admin' && <Badge variant="info">Admin</Badge>}
          <span className="text-xs text-gray-400">
            {format(new Date(comment.created_at), 'MMM d, yyyy HH:mm')}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
          {comment.content}
        </p>
        {canDelete && (
          <button
            onClick={() => onDelete(comment.id)}
            className="mt-1 text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
