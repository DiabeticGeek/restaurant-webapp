import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Layout } from '../utils/supabaseClient';
import { useAuth } from './useAuth';
import { v4 as uuidv4 } from 'uuid';

// Fetch all layouts for the restaurant
const fetchLayouts = async (restaurantId: string): Promise<Layout[]> => {
  const { data, error } = await supabase
    .from('table_layouts')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(layout => ({
    id: layout.id,
    name: layout.name,
    gridSize: layout.layout_data.gridSize || { width: 500, height: 500 },
    items: layout.layout_data.items || [],
  }));
};

// Update a layout
const updateLayout = async (layout: Layout) => {
  const { error } = await supabase
    .from('table_layouts')
    .update({
      name: layout.name,
      layout_data: {
        gridSize: layout.gridSize,
        items: layout.items,
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', layout.id);

  if (error) throw error;
};

// Create a new layout
const createLayout = async (restaurantId: string): Promise<Layout> => {
  const newLayout: Layout = {
    id: uuidv4(),
    name: 'New Layout',
    gridSize: { width: 500, height: 500 },
    items: [],
  };

  const { error } = await supabase.from('table_layouts').insert({
    id: newLayout.id,
    restaurant_id: restaurantId,
    name: newLayout.name,
    layout_data: {
      gridSize: newLayout.gridSize,
      items: newLayout.items,
    },
  });

  if (error) throw error;
  return newLayout;
};

// Delete a layout
const deleteLayout = async (layoutId: string) => {
  const { error } = await supabase.from('table_layouts').delete().eq('id', layoutId);
  if (error) throw error;
};

export const useLayouts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const restaurantId = user?.restaurantId;

  const { data: layouts, isLoading, error } = useQuery<Layout[], Error>({
    queryKey: ['layouts', restaurantId],
    queryFn: () => fetchLayouts(restaurantId!),
    enabled: !!restaurantId,
  });

  const updateLayoutMutation = useMutation({ 
    mutationFn: updateLayout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['layouts', restaurantId] });
    }
  });

  const createLayoutMutation = useMutation({ 
    mutationFn: () => createLayout(restaurantId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['layouts', restaurantId] });
    }
  });

  const deleteLayoutMutation = useMutation({ 
    mutationFn: deleteLayout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['layouts', restaurantId] });
    }
  });

  return {
    layouts,
    isLoading,
    error,
    updateLayout: updateLayoutMutation.mutate,
    createLayout: createLayoutMutation.mutateAsync,
    deleteLayout: deleteLayoutMutation.mutate,
  };
};
