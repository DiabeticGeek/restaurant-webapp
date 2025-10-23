import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase, Layout, LayoutItem } from '../../utils/supabaseClient';
import OrderModal from '../../components/server/OrderModal';

const STATUS_COLORS: Record<string, string> = {
  available: 'bg-green-500',
  occupied: 'bg-yellow-500',
  dirty: 'bg-red-500',
  reserved: 'bg-blue-500',
};

const ServerView = () => {
  const { user } = useAuth();
  const [layout, setLayout] = useState<Layout | null>(null);
  const [tableStatuses, setTableStatuses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<LayoutItem | null>(null);

  useEffect(() => {
    if (!user?.restaurantId) return;

    const fetchLayoutAndTables = async () => {
      setLoading(true);
      const { data: layoutData, error: layoutError } = await supabase
        .from('table_layouts')
        .select('*')
        .eq('restaurant_id', user.restaurantId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (layoutError) console.error('Error fetching layout:', layoutError);
      else if (layoutData) {
        setLayout({
          id: layoutData.id,
          name: layoutData.name,
          gridSize: layoutData.layout_data.gridSize || { width: 800, height: 600 },
          items: layoutData.layout_data.items || [],
        });
      }

      const { data: tableData, error: tableError } = await supabase
        .from('tables')
        .select('layout_item_id, status')
        .eq('restaurant_id', user.restaurantId);

      if (tableError) console.error('Error fetching tables:', tableError);
      else {
        const statuses = tableData.reduce((acc, table) => {
          acc[table.layout_item_id] = table.status;
          return acc;
        }, {} as Record<string, string>);
        setTableStatuses(statuses);
      }
      setLoading(false);
    };

    fetchLayoutAndTables();

    const subscription = supabase
      .channel('public:tables')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tables' },
        (payload) => {
          const newTable = payload.new as { layout_item_id: string; status: string };
          if (newTable) {
            setTableStatuses((prev) => ({ ...prev, [newTable.layout_item_id]: newTable.status }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user?.restaurantId]);

  const handleTableClick = (table: LayoutItem) => {
    setSelectedTable(table);
  };

  if (loading) {
    return <div className="p-4">Loading server view...</div>;
  }

  if (!layout) {
    return <div className="p-4">No floor layout has been configured.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Server View - {layout.name}</h1>
      <div
        className="relative bg-gray-100 border rounded-lg shadow-inner overflow-hidden"
        style={{ width: layout.gridSize.width, height: layout.gridSize.height }}
      >
        {layout.items
          .filter((item) => item.type === 'table')
          .map((item) => {
            const status = tableStatuses[item.id] || 'available';
            const colorClass = STATUS_COLORS[status] || 'bg-gray-400';
            return (
              <div
                key={item.id}
                className={`absolute flex items-center justify-center font-semibold text-white rounded-md cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-primary ${colorClass}`}
                style={{
                  left: item.x,
                  top: item.y,
                  width: item.width,
                  height: item.height,
                  transform: `rotate(${item.rotation}deg)`,
                }}
                onClick={() => handleTableClick(item)}
              >
                {item.name}
              </div>
            );
          })}
      </div>
      {selectedTable && (
        <OrderModal tableId={selectedTable.id} onClose={() => setSelectedTable(null)} />
      )}
    </div>
  );
};

export default ServerView;
