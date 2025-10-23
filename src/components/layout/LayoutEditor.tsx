import { useRef, useState, useEffect } from 'react'
import { useDrag } from 'react-dnd'
import { Layout, LayoutItem } from '../../pages/owner/FloorLayout'

interface LayoutEditorProps {
  layout: Layout
  selectedItem: LayoutItem | null
  setSelectedItem: (item: LayoutItem | null) => void
  updateItem: (item: LayoutItem) => void
}

interface DragItem {
  type: string
  id: string
  item: LayoutItem
  initialOffset: { x: number; y: number }
}

const LayoutEditor: React.FC<LayoutEditorProps> = ({
  layout,
  selectedItem,
  setSelectedItem,
  updateItem,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)

  // Handle zoom
  const handleZoom = (zoomIn: boolean) => {
    setScale(prevScale => {
      const newScale = zoomIn ? prevScale * 1.1 : prevScale / 1.1
      return Math.max(0.5, Math.min(2, newScale))
    })
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex items-center space-x-2">
        <button
          onClick={() => handleZoom(false)}
          className="px-2 py-1 bg-gray-200 rounded-md"
        >
          -
        </button>
        <span className="text-sm">{Math.round(scale * 100)}%</span>
        <button
          onClick={() => handleZoom(true)}
          className="px-2 py-1 bg-gray-200 rounded-md"
        >
          +
        </button>
      </div>

      <div
        ref={containerRef}
        className="border border-gray-300 bg-gray-100 relative overflow-auto"
        style={{
          width: '100%',
          height: '600px',
        }}
      >
        <div
          className="absolute"
          style={{
            width: layout.gridSize.width,
            height: layout.gridSize.height,
            transform: `scale(${scale})`,
            transformOrigin: '0 0',
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
              setIsDragging={setIsDragging}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface DraggableItemProps {
  item: LayoutItem
  isSelected: boolean
  onClick: () => void
  updateItem: (item: LayoutItem) => void
  setIsDragging: (isDragging: boolean) => void
}

const DraggableItem: React.FC<DraggableItemProps> = ({
  item,
  isSelected,
  onClick,
  updateItem,
  setIsDragging,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [resizing, setResizing] = useState(false)
  const [rotating, setRotating] = useState(false)
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 })
  const [initialDimensions, setInitialDimensions] = useState({ width: 0, height: 0 })

  // Handle drag
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'layout-item',
    item: () => {
      setIsDragging(true)
      return {
        type: 'layout-item',
        id: item.id,
        item,
        initialOffset: { x: 0, y: 0 },
      }
    },
    end: (_, monitor) => {
      setIsDragging(false)
      const delta = monitor.getDifferenceFromInitialOffset()
      if (delta) {
        updateItem({
          ...item,
          x: Math.round(item.x + delta.x),
          y: Math.round(item.y + delta.y),
        })
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [item, updateItem])

  // Handle resize
  const startResize = (e: React.MouseEvent) => {
    e.stopPropagation()
    setResizing(true)
    setInitialMousePos({ x: e.clientX, y: e.clientY })
    setInitialDimensions({ width: item.width, height: item.height })
  }

  // Handle rotate
  const startRotate = (e: React.MouseEvent) => {
    e.stopPropagation()
    setRotating(true)
    setInitialMousePos({ x: e.clientX, y: e.clientY })
  }

  // Handle mouse move for resize and rotate
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizing) {
        const dx = e.clientX - initialMousePos.x
        const dy = e.clientY - initialMousePos.y
        
        updateItem({
          ...item,
          width: Math.max(20, initialDimensions.width + dx),
          height: Math.max(20, initialDimensions.height + dy),
        })
      } else if (rotating) {
        const rect = ref.current?.getBoundingClientRect()
        if (!rect) return
        
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX)
        const degrees = angle * (180 / Math.PI)
        
        updateItem({
          ...item,
          rotation: Math.round(degrees + 90),
        })
      }
    }

    const handleMouseUp = () => {
      setResizing(false)
      setRotating(false)
    }

    if (resizing || rotating) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizing, rotating, initialMousePos, initialDimensions, item, updateItem])

  // Apply drag ref to the element
  drag(ref)

  // Determine shape style
  let shapeStyle: React.CSSProperties = {}
  if (item.shape === 'circle') {
    shapeStyle = {
      borderRadius: '50%',
    }
  } else if (item.shape === 'oval') {
    shapeStyle = {
      borderRadius: '50%',
      width: item.width,
      height: item.height / 2,
    }
  }

  return (
    <div
      ref={ref}
      className={`absolute cursor-move ${isSelected ? 'ring-2 ring-primary' : ''}`}
      style={{
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height,
        backgroundColor: item.color || '#cccccc',
        transform: `rotate(${item.rotation}deg)`,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isSelected ? 10 : 1,
        ...shapeStyle,
      }}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      {/* Item label */}
      <div 
        className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white"
        style={{ pointerEvents: 'none' }}
      >
        {item.name}
        {item.capacity && ` (${item.capacity})`}
      </div>

      {/* Resize handle */}
      {isSelected && (
        <div
          className="absolute w-6 h-6 bg-white border border-gray-300 rounded-full cursor-se-resize flex items-center justify-center right-0 bottom-0 transform translate-x-1/2 translate-y-1/2"
          onMouseDown={startResize}
          onClick={(e) => e.stopPropagation()}
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path
              fill="currentColor"
              d="M0 8h2v2h2V8h2V6H4V4H2v2H0v2zm8-8v2h2V0H8z M8 4h2v2H8V4z M8 8h2v2H8V8z"
            />
          </svg>
        </div>
      )}

      {/* Rotate handle */}
      {isSelected && (
        <div
          className="absolute w-6 h-6 bg-white border border-gray-300 rounded-full cursor-crosshair flex items-center justify-center top-0 right-0 transform translate-x-1/2 -translate-y-1/2"
          onMouseDown={startRotate}
          onClick={(e) => e.stopPropagation()}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
        </div>
      )}
    </div>
  )
}

export default LayoutEditor
