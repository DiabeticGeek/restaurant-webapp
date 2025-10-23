import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, MenuItem, Order, OrderItem } from '../../utils/supabaseClient';
import { useAuth } from '../../hooks/useAuth';

interface OrderModalProps {
  tableId: string;
  onClose: () => void;
}

const OrderModal: React.FC<OrderModalProps> = ({ tableId, onClose }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const { data: menuItems } = useQuery<MenuItem[], Error>({
    queryKey: ['menu-items', user?.restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', user!.restaurantId!)
        .eq('active', true);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.restaurantId,
  });

  useEffect(() => {
    const fetchActiveOrder = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('table_id', tableId)
        .eq('status', 'active')
        .single();

      if (data) {
        setActiveOrder(data as Order);
        setOrderItems(data.order_items as OrderItem[]);
      }
    };
    fetchActiveOrder();
  }, [tableId]);

  const createOrderMutation = useMutation<Order, Error, void>({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          table_id: tableId,
          restaurant_id: user!.restaurantId!,
          server_id: user!.id,
          status: 'active',
          total_amount: 0,
          tax_amount: 0,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data: Order) => {
      setActiveOrder(data);
      queryClient.invalidateQueries({ queryKey: ['orders', tableId] });
    },
  });

  const addItemToOrderMutation = useMutation<OrderItem, Error, string>({
    mutationFn: async (itemId: string) => {
      if (!activeOrder) throw new Error('No active order');
      const { data, error } = await supabase
        .from('order_items')
        .insert({
          order_id: activeOrder.id,
          menu_item_id: itemId,
          quantity: 1,
          status: 'pending',
          destination: menuItems?.find(mi => mi.id === itemId)?.destination || 'kitchen',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data: OrderItem) => {
      setOrderItems([...orderItems, data]);
      queryClient.invalidateQueries({ queryKey: ['orders', tableId] });
    },
  });

  const handleAddItem = async (itemId: string) => {
    if (!activeOrder) {
      await createOrderMutation.mutateAsync();
    }
    addItemToOrderMutation.mutate(itemId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Order for Table {tableId}</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Menu</h3>
            <div className="space-y-2">
              {menuItems?.map((item: MenuItem) => (
                <button
                  key={item.id}
                  className="w-full text-left p-2 border rounded-md hover:bg-gray-100"
                  onClick={() => handleAddItem(item.id)}
                >
                  {item.name} - ${item.price.toFixed(2)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Current Order</h3>
            <div className="space-y-2">
              {orderItems.map((item: OrderItem) => (
                <div key={item.id} className="flex justify-between p-2 border-b">
                  <span>{menuItems?.find(mi => mi.id === item.menu_item_id)?.name}</span>
                  <span>x{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button className="btn btn-outline" onClick={onClose}>Close</button>
          <button className="btn btn-primary">Send to Kitchen</button>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
