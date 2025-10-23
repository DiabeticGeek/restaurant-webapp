import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { v4 as uuidv4 } from 'uuid'
import { supabase, MenuCategory, MenuItem } from '../../utils/supabaseClient'
import { useAuth } from '../../hooks/useAuth'

interface CategoryNode extends MenuCategory {
  children?: CategoryNode[]
}

const MenuEditor = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [categoryDraft, setCategoryDraft] = useState<Partial<MenuCategory> | null>(null)
  const [itemDraft, setItemDraft] = useState<Partial<MenuItem> | null>(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showItemForm, setShowItemForm] = useState(false)

  const categoriesQuery = useQuery({
    queryKey: ['menu-categories', user?.restaurantId],
    enabled: !!user?.restaurantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', user!.restaurantId!)
        .order('order', { ascending: true })
      if (error) throw error
      return data as MenuCategory[]
    },
  })

  const itemsQuery = useQuery({
    queryKey: ['menu-items', user?.restaurantId],
    enabled: !!user?.restaurantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', user!.restaurantId!)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as MenuItem[]
    },
  })

  const categoryTree = useMemo(() => {
    const nodes = new Map<string, CategoryNode>()
    categoriesQuery.data?.forEach((cat) => nodes.set(cat.id, { ...cat, children: [] }))
    const roots: CategoryNode[] = []
    nodes.forEach((node) => {
      if (node.parent_category_id && nodes.has(node.parent_category_id)) {
        nodes.get(node.parent_category_id)!.children!.push(node)
      } else {
        roots.push(node)
      }
    })
    return roots
  }, [categoriesQuery.data])

  const upsertCategory = useMutation({
    mutationFn: async (draft: Partial<MenuCategory>) => {
      const payload = {
        id: draft.id ?? uuidv4(),
        restaurant_id: user!.restaurantId!,
        name: draft.name,
        description: draft.description ?? null,
        parent_category_id: draft.parent_category_id ?? null,
        order: draft.order ?? 0,
      }
      const { error } = await supabase.from('menu_categories').upsert(payload)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-categories', user?.restaurantId] })
      setCategoryDraft(null)
      setShowCategoryForm(false)
    },
  })

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('menu_categories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-categories', user?.restaurantId] })
      if (selectedCategoryId === categoryDraft?.id) setSelectedCategoryId(null)
    },
  })

  const upsertItem = useMutation({
    mutationFn: async (draft: Partial<MenuItem>) => {
      if (!selectedCategoryId) throw new Error('Select a category first')
      const payload = {
        id: draft.id ?? uuidv4(),
        restaurant_id: user!.restaurantId!,
        category_id: selectedCategoryId,
        name: draft.name,
        description: draft.description ?? null,
        price: Number(draft.price ?? 0),
        cost: Number(draft.cost ?? 0),
        active: draft.active ?? true,
      }
      const { error } = await supabase.from('menu_items').upsert(payload)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items', user?.restaurantId] })
      setItemDraft(null)
      setShowItemForm(false)
    },
  })

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('menu_items').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items', user?.restaurantId] })
    },
  })

  const selectedItems = itemsQuery.data?.filter((item) => item.category_id === selectedCategoryId) ?? []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="bg-white shadow rounded-lg p-6">
          <header className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Categories</h2>
            <button
              className="btn btn-secondary flex items-center"
              onClick={() => {
                setCategoryDraft({ name: '', description: '', parent_category_id: undefined })
                setShowCategoryForm(true)
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
                  setCategoryDraft(cat)
                  setShowCategoryForm(true)
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
                setCategoryDraft(null)
                setShowCategoryForm(false)
              }}
              onSubmit={() => upsertCategory.mutate(categoryDraft)}
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
                    setItemDraft({ name: '', description: '', price: 0, cost: 0, active: true })
                    setShowItemForm(true)
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
                            setItemDraft(item)
                            setShowItemForm(true)
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
                setItemDraft(null)
                setShowItemForm(false)
              }}
              onSubmit={() => upsertItem.mutate(itemDraft)}
              saving={upsertItem.isPending}
            />
          )}
        </section>
      </div>
    </div>
  )
}

interface CategoryNodeRowProps {
  node: CategoryNode
  level: number
  selectedCategoryId: string | null
  onSelect: (id: string) => void
  onEdit: (category: MenuCategory) => void
  onDelete: (id: string) => void
}

const CategoryNodeRow = ({ node, level, selectedCategoryId, onSelect, onEdit, onDelete }: CategoryNodeRowProps) => {
  return (
    <div className="space-y-2">
      <div className={`flex justify-between items-center rounded-md border p-3 ${selectedCategoryId === node.id ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
        <div>
          <button
            className="text-left"
            onClick={() => onSelect(node.id)}
          >
            <p className="font-semibold text-gray-900">
              {'—'.repeat(level)} {node.name}
            </p>
            {node.description && <p className="text-xs text-gray-500">{node.description}</p>}
          </button>
        </div>
        <div className="flex space-x-2">
          <button className="text-gray-500 hover:text-primary" onClick={() => onEdit(node)}>
            <FiEdit2 />
          </button>
          <button className="text-red-500 hover:text-red-600" onClick={() => onDelete(node.id)}>
            <FiTrash2 />
          </button>
        </div>
      </div>
      {node.children && node.children.length > 0 && (
        <div className="ml-4">
          {node.children.map((child) => (
            <CategoryNodeRow
              key={child.id}
              node={child}
              level={level + 1}
              selectedCategoryId={selectedCategoryId}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface CategoryFormProps {
  draft: Partial<MenuCategory>
  roots: MenuCategory[]
  onChange: (draft: Partial<MenuCategory>) => void
  onCancel: () => void
  onSubmit: () => void
  saving: boolean
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
          e.preventDefault()
          onSubmit()
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
  )}

interface ItemFormProps {
  draft: Partial<MenuItem>
  onChange: (draft: Partial<MenuItem>) => void
  onCancel: () => void
  onSubmit: () => void
  saving: boolean
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
          e.preventDefault()
          onSubmit()
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
  )
}

export default MenuEditor
