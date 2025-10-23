import { MenuCategory } from '../../utils/supabaseClient';

interface CategoryFormProps {
  draft: Partial<MenuCategory>;
  roots: MenuCategory[];
  onChange: (draft: Partial<MenuCategory>) => void;
  onCancel: () => void;
  onSubmit: () => void;
  saving: boolean;
}

const CategoryForm = ({ draft, roots, onChange, onCancel, onSubmit, saving }: CategoryFormProps) => {
  return (
    <section className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {draft.id ? 'Edit Category' : 'New Category'}
      </h2>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div>
          <label className="label" htmlFor="category-name">Name</label>
          <input
            id="category-name"
            className="input"
            value={draft.name ?? ''}
            onChange={(e) => onChange({ ...draft, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="category-description">Description</label>
          <textarea
            id="category-description"
            className="input"
            rows={3}
            value={draft.description ?? ''}
            onChange={(e) => onChange({ ...draft, description: e.target.value })}
          />
        </div>
        <div>
          <label className="label" htmlFor="category-parent">Parent Category</label>
          <select
            id="category-parent"
            className="input"
            value={draft.parent_category_id ?? ''}
            onChange={(e) => onChange({ ...draft, parent_category_id: e.target.value || undefined })}
          >
            <option value="">None</option>
            {roots.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end space-x-2">
          <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CategoryForm;
