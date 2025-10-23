import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase, OrderItem, MenuItem } from '../../utils/supabaseClient';

const BarDisplay = () => {
  const { user } = useAuth();
  const [orderItems, setOrderItems] = useState<(OrderItem & { menu_items: MenuItem })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.restaurantId) return;

    const fetchOrderItems = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('order_items')
        .select('*, menu_items(*)')
        .eq('restaurant_id', user.restaurantId)
        .eq('destination', 'bar')
        .in('status', ['pending', 'preparing'])
        .order('created_at', { ascending: true });

      if (error) console.error('Error fetching order items:', error);
      else setOrderItems(data as any);
      setLoading(false);
    };

    fetchOrderItems();

    const subscription = supabase
      .channel('public:order_items:bar')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_items' },
        () => fetchOrderItems()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user?.restaurantId]);

  const handleMarkAsReady = async (itemId: string) => {
    await supabase
      .from('order_items')
      .update({ status: 'ready' })
      .eq('id', itemId);
  };

  if (loading) {
    return <div className="p-4">Loading bar orders...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Bar Display</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orderItems.map((item) => (
          <div key={item.id} className="bg-white shadow-lg rounded-lg p-4">
            <h2 className="text-xl font-bold">{item.menu_items.name}</h2>
            <p className="text-gray-600">Quantity: {item.quantity}</p>
            {item.notes && <p className="text-red-500">Notes: {item.notes}</p>}
            <p className="text-sm text-gray-500">Status: {item.status}</p>
            <button
              onClick={() => handleMarkAsReady(item.id)}
              className="mt-4 w-full btn btn-primary"
            >
              Mark as Ready
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarDisplay;
