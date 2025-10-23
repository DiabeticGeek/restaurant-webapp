import { MenuItem } from '../../utils/supabaseClient';

interface ItemFormProps {
  draft: Partial<MenuItem>;
  onChange: (draft: Partial<MenuItem>) => void;
  onCancel: () => void;
  onSubmit: () => void;
  saving: boolean;
}

const ItemForm = ({ draft, onChange, onCancel, onSubmit, saving }: ItemFormProps) => {
  return (
    <section className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {draft.id ? 'Edit Item' : 'New Item'}
      </h2>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div>
          <label className="label" htmlFor="item-name">Name</label>
          <input
            id="item-name"
            className="input"
            value={draft.name ?? ''}
            onChange={(e) => onChange({ ...draft, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="item-description">Description</label>
          <textarea
            id="item-description"
            className="input"
            rows={3}
            value={draft.description ?? ''}
            onChange={(e) => onChange({ ...draft, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="item-price">Price</label>
            <input
              id="item-price"
              type="number"
              step="0.01"
              className="input"
              value={draft.price ?? ''}
              onChange={(e) => onChange({ ...draft, price: Number(e.target.value) })}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="item-cost">Cost</label>
            <input
              id="item-cost"
              type="number"
              step="0.01"
              className="input"
              value={draft.cost ?? ''}
              onChange={(e) => onChange({ ...draft, cost: Number(e.target.value) })}
              required
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <input
            id="item-active"
            type="checkbox"
            checked={draft.active ?? true}
            onChange={(e) => onChange({ ...draft, active: e.target.checked })}
          />
          <label htmlFor="item-active" className="text-sm text-gray-600">Active</label>
        </div>
        <div className="flex justify-end space-xl-2">
          <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Item'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default ItemForm;
