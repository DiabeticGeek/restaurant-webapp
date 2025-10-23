import { useMemo, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { MenuCategory, MenuItem } from '../../utils/supabaseClient';
import { useMenu } from '../../hooks/useMenu';
import CategoryNodeRow from '../../components/menu/CategoryNodeRow';
import CategoryForm from '../../components/menu/CategoryForm';
import ItemForm from '../../components/menu/ItemForm';

interface CategoryNode extends MenuCategory {
  children?: CategoryNode[];
}

const MenuEditor = () => {
  const { categoriesQuery, itemsQuery, upsertCategory, deleteCategory, upsertItem, deleteItem } = useMenu();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categoryDraft, setCategoryDraft] = useState<Partial<MenuCategory> | null>(null);
  const [itemDraft, setItemDraft] = useState<Partial<MenuItem> | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);

  const categoryTree = useMemo(() => {
    const nodes = new Map<string, CategoryNode>();
    categoriesQuery.data?.forEach((cat) => nodes.set(cat.id, { ...cat, children: [] }));
    const roots: CategoryNode[] = [];
    nodes.forEach((node) => {
      if (node.parent_category_id && nodes.has(node.parent_category_id)) {
        nodes.get(node.parent_category_id)!.children!.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  }, [categoriesQuery.data]);

  const handleUpsertCategory = () => {
    if (categoryDraft) {
      upsertCategory.mutate(categoryDraft, {
        onSuccess: () => {
          setCategoryDraft(null);
          setShowCategoryForm(false);
        },
      });
    }
  };

  const handleUpsertItem = () => {
    if (itemDraft && selectedCategoryId) {
      upsertItem.mutate({ ...itemDraft, category_id: selectedCategoryId }, {
        onSuccess: () => {
          setItemDraft(null);
          setShowItemForm(false);
        },
      });
    }
  };

  const selectedItems = itemsQuery.data?.filter((item) => item.category_id === selectedCategoryId) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="bg-white shadow rounded-lg p-6">
          <header className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Categories</h2>
            <button
              className="btn btn-secondary flex items-center"
              onClick={() => {
                setCategoryDraft({ name: '', description: '', parent_category_id: undefined });
                setShowCategoryForm(true);
              }}
            >
              <FiPlus className="mr-2" /> New
            </button>
          </header>
          <div className="mt-4 space-y-3 text-sm">
            {categoryTree.length === 0 && <p className="text-gray-500">Create your first category.</p>}
            {categoryTree.map((node) => (
              <CategoryNodeRow
                key={node.id}
                node={node}
                level={0}
                selectedCategoryId={selectedCategoryId}
                onSelect={setSelectedCategoryId}
                onEdit={(cat) => {
                  setCategoryDraft(cat);
                  setShowCategoryForm(true);
                }}
                onDelete={(id) => deleteCategory.mutate(id)}
              />
            ))}
          </div>
        </section>

        <section className="lg:col-span-2 space-y-6">
          {showCategoryForm && categoryDraft && (
            <CategoryForm
              draft={categoryDraft}
              roots={categoriesQuery.data ?? []}
              onChange={setCategoryDraft}
              onCancel={() => {
                setCategoryDraft(null);
                setShowCategoryForm(false);
              }}
              onSubmit={handleUpsertCategory}
              saving={upsertCategory.isPending}
            />
          )}

          <section className="bg-white shadow rounded-lg p-6">
            <header className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Menu Items</h2>
                {!selectedCategoryId && <p className="text-sm text-gray-500">Select a category to manage items.</p>}
              </div>
              {selectedCategoryId && (
                <button
                  className="btn btn-secondary flex items-center"
                  onClick={() => {
                    setItemDraft({ name: '', description: '', price: 0, cost: 0, active: true });
                    setShowItemForm(true);
                  }}
                >
                  <FiPlus className="mr-2" /> New Item
                </button>
              )}
            </header>

            {selectedCategoryId && (
              <div className="mt-4 space-y-3">
                {selectedItems.length === 0 && <p className="text-sm text-gray-500">No items yet.</p>}
                {selectedItems.map((item) => (
                  <article key={item.id} className="border border-gray-200 rounded-md p-4">
                    <header className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">{item.name}</h3>
                        {item.description && <p className="text-sm text-gray-500">{item.description}</p>}
                        <div className="mt-2 text-xs text-gray-600 space-x-3">
                          <span>Price ${item.price.toFixed(2)}</span>
                          <span>Cost ${item.cost.toFixed(2)}</span>
                          <span>Status {item.active ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          className="text-gray-500 hover:text-primary"
                          onClick={() => {
                            setItemDraft(item);
                            setShowItemForm(true);
                          }}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-600"
                          onClick={() => deleteItem.mutate(item.id)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </header>
                  </article>
                ))}
              </div>
            )}
          </section>

          {showItemForm && itemDraft && selectedCategoryId && (
            <ItemForm
              draft={itemDraft}
              onChange={setItemDraft}
              onCancel={() => {
                setItemDraft(null);
                setShowItemForm(false);
              }}
              onSubmit={handleUpsertItem}
              saving={upsertItem.isPending}
            />
          )}
        </section>
      </div>
    </div>
  );
};

export default MenuEditor;
