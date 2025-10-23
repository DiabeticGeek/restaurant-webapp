import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from './useAuth';

const fetchDashboardStats = async (restaurantId: string) => {
  const [restaurant, menuItems, staff, activeOrders] = await Promise.all([
    supabase.from('restaurants').select('name').eq('id', restaurantId).single(),
    supabase.from('menu_items').select('id', { count: 'exact', head: true }).eq('restaurant_id', restaurantId),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('restaurant_id', restaurantId),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('restaurant_id', restaurantId).eq('status', 'active'),
  ]);

  if (restaurant.error) throw restaurant.error;
  if (menuItems.error) throw menuItems.error;
  if (staff.error) throw staff.error;
  if (activeOrders.error) throw activeOrders.error;

  return {
    restaurantName: restaurant.data.name,
    menuItemCount: menuItems.count || 0,
    staffCount: staff.count || 0,
    activeOrders: activeOrders.count || 0,
  };
};

export const useDashboardStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboardStats', user?.restaurantId],
    queryFn: () => fetchDashboardStats(user!.restaurantId!),
    enabled: !!user?.restaurantId,
  });
};
