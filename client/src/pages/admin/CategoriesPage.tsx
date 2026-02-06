import { useState } from 'react';
import { useCategories } from '../../hooks/useCategories';
import * as categoriesApi from '../../api/categories';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { SEOHead } from '../../components/seo/SEOHead';

export function CategoriesPage() {
  const { categories, isLoading, error, refetch } = useCategories();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await categoriesApi.createCategory({ name, description: description || undefined });
      setName('');
      setDescription('');
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: number) => {
    setSaving(true);
    try {
      await categoriesApi.updateCategory(id, { name: editName, description: editDescription || undefined });
      setEditingId(null);
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this category?')) return;
    try {
      await categoriesApi.deleteCategory(id);
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const startEdit = (cat: { id: number; name: string; description: string | null }) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDescription(cat.description || '');
  };

  return (
    <>
      <SEOHead title="Manage Categories" />
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Categories</h1>

        <Card>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Add Category</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              className="flex-1"
            />
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="flex-1"
            />
            <Button onClick={handleCreate} loading={saving} disabled={!name.trim()}>
              Add
            </Button>
          </div>
        </Card>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={refetch} />
        ) : (
          <div className="space-y-3">
            {categories.map((cat) => (
              <Card key={cat.id}>
                {editingId === cat.id ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description"
                      className="flex-1"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleUpdate(cat.id)} loading={saving}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{cat.name}</p>
                      {cat.description && <p className="text-sm text-gray-500 dark:text-gray-400">{cat.description}</p>}
                      <p className="text-xs text-gray-400 mt-1">{cat.post_count} post{cat.post_count !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(cat)}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(cat.id)}>Delete</Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
