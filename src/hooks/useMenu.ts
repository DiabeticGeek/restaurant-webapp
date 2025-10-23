import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, MenuCategory, MenuItem } from '../utils/supabaseClient';
import { useAuth } from './useAuth';
import { v4 as uuidv4 } from 'uuid';

// Fetch categories
const fetchCategories = async (restaurantId: string) => {
  const { data, error } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('order', { ascending: true });
  if (error) throw error;
  return data as MenuCategory[];
};

// Fetch items
const fetchItems = async (restaurantId: string) => {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as MenuItem[];
};

export const useMenu = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const restaurantId = user?.restaurantId;

  const categoriesQuery = useQuery({
    queryKey: ['menu-categories', restaurantId],
    enabled: !!restaurantId,
    queryFn: () => fetchCategories(restaurantId!),
  });

  const itemsQuery = useQuery({
    queryKey: ['menu-items', restaurantId],
    enabled: !!restaurantId,
    queryFn: () => fetchItems(restaurantId!),
  });

  const upsertCategory = useMutation({
    mutationFn: async (draft: Partial<MenuCategory>) => {
      const payload = {
        id: draft.id ?? uuidv4(),
        restaurant_id: restaurantId!,
        name: draft.name,
        description: draft.description ?? null,
        parent_category_id: draft.parent_category_id ?? null,
        order: draft.order ?? 0,
      };
      const { error } = await supabase.from('menu_categories').upsert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-categories', restaurantId] });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('menu_categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-categories', restaurantId] });
    },
  });

  const upsertItem = useMutation({
    mutationFn: async (draft: Partial<MenuItem> & { category_id: string }) => {
      const payload = {
        id: draft.id ?? uuidv4(),
        restaurant_id: restaurantId!,
        category_id: draft.category_id,
        name: draft.name,
        description: draft.description ?? null,
        price: Number(draft.price ?? 0),
        cost: Number(draft.cost ?? 0),
        active: draft.active ?? true,
      };
      const { error } = await supabase.from('menu_items').upsert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items', restaurantId] });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items', restaurantId] });
    },
  });

  return {
    categoriesQuery,
    itemsQuery,
    upsertCategory,
    deleteCategory,
    upsertItem,
    deleteItem,
  };
};
