import { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Layout, LayoutItem } from '../../utils/supabaseClient';

interface LayoutEditorProps {
  layout: Layout;
  selectedItem: LayoutItem | null;
  setSelectedItem: (item: LayoutItem | null) => void;
  updateItem: (item: LayoutItem) => void;
}

const LayoutEditor: React.FC<LayoutEditorProps> = ({ layout, selectedItem, setSelectedItem, updateItem }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const [, drop] = useDrop(() => ({
    accept: 'layout-item',
    drop: (item: { id: string }, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (!delta) return;

      const existingItem = layout.items.find((i) => i.id === item.id);
      if (!existingItem) return;

      updateItem({
        ...existingItem,
        x: Math.round(existingItem.x + delta.x),
        y: Math.round(existingItem.y + delta.y),
      });
    },
  }));

  const handleZoom = (zoomIn: boolean) => {
    setScale((prev) => (zoomIn ? prev * 1.1 : prev / 1.1));
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex items-center space-x-2">
        <button onClick={() => handleZoom(false)} className="btn btn-sm">-</button>
        <span>{Math.round(scale * 100)}%</span>
        <button onClick={() => handleZoom(true)} className="btn btn-sm">+</button>
      </div>
      <div
        ref={containerRef}
        className="w-full h-[600px] border bg-gray-50 overflow-auto"
      >
        <div
          ref={drop}
          className="relative transform-origin-top-left"
          style={{
            width: layout.gridSize.width,
            height: layout.gridSize.height,
            transform: `scale(${scale})`,
            background: 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAyMCAwIEwgMCAwIDAgMjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2UwZTBlMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPjwvc3ZnPg==")',
          }}
        >
          {layout.items.map((item) => (
            <DraggableItem
              key={item.id}
              item={item}
              isSelected={selectedItem?.id === item.id}
              onClick={() => setSelectedItem(item)}
              updateItem={updateItem}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface DraggableItemProps {
  item: LayoutItem;
  isSelected: boolean;
  onClick: () => void;
  updateItem: (item: LayoutItem) => void;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ item, isSelected, onClick }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'layout-item',
    item: { id: item.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`absolute cursor-move p-2 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height,
        transform: `rotate(${item.rotation}deg)`,
        opacity: isDragging ? 0.5 : 1,
      }}
      onClick={onClick}
    >
      <div
        className="w-full h-full rounded-md flex items-center justify-center text-white font-bold"
        style={{ backgroundColor: item.color || '#9ca3af' }}
      >
        {item.name}
      </div>
    </div>
  );
};

export default LayoutEditor;
