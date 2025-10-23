import { useState, useEffect } from 'react'
import { FiTrash2 } from 'react-icons/fi'
import { LayoutItem } from '../../pages/owner/FloorLayout'

interface LayoutItemPropertiesProps {
  item: LayoutItem
  updateItem: (item: LayoutItem) => void
  deleteItem: (itemId: string) => void
}

const LayoutItemProperties: React.FC<LayoutItemPropertiesProps> = ({
  item,
  updateItem,
  deleteItem,
}) => {
  const [name, setName] = useState(item.name)
  const [x, setX] = useState(item.x)
  const [y, setY] = useState(item.y)
  const [width, setWidth] = useState(item.width)
  const [height, setHeight] = useState(item.height)
  const [rotation, setRotation] = useState(item.rotation)
  const [capacity, setCapacity] = useState(item.capacity || 0)
  const [color, setColor] = useState(item.color || '#cccccc')

  // Update local state when selected item changes
  useEffect(() => {
    setName(item.name)
    setX(item.x)
    setY(item.y)
    setWidth(item.width)
    setHeight(item.height)
    setRotation(item.rotation)
    setCapacity(item.capacity || 0)
    setColor(item.color || '#cccccc')
  }, [item])

  // Apply changes to the item
  const applyChanges = () => {
    updateItem({
      ...item,
      name,
      x,
      y,
      width,
      height,
      rotation,
      capacity: item.type === 'table' ? capacity : undefined,
      color,
    })
  }

  // Handle input changes
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<any>>, value: any) => {
    setter(value)
  }

  // Handle number input changes with blur event to apply changes
  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const value = parseInt(e.target.value) || 0
    setter(value)
  }

  return (
    <div className="space-y-4">
      {/* Item Type and Shape */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-sm font-medium text-gray-500">Type:</span>{' '}
          <span className="capitalize">{item.type}</span>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500">Shape:</span>{' '}
          <span className="capitalize">{item.shape}</span>
        </div>
      </div>

      {/* Name */}
      <div>
        <label htmlFor="item-name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="item-name"
          value={name}
          onChange={(e) => handleInputChange(setName, e.target.value)}
          onBlur={applyChanges}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>

      {/* Position */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="item-x" className="block text-sm font-medium text-gray-700">
            X Position
          </label>
          <input
            type="number"
            id="item-x"
            value={x}
            onChange={(e) => handleNumberChange(e, setX)}
            onBlur={applyChanges}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="item-y" className="block text-sm font-medium text-gray-700">
            Y Position
          </label>
          <input
            type="number"
            id="item-y"
            value={y}
            onChange={(e) => handleNumberChange(e, setY)}
            onBlur={applyChanges}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
      </div>

      {/* Size */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="item-width" className="block text-sm font-medium text-gray-700">
            Width
          </label>
          <input
            type="number"
            id="item-width"
            value={width}
            onChange={(e) => handleNumberChange(e, setWidth)}
            onBlur={applyChanges}
            min="20"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="item-height" className="block text-sm font-medium text-gray-700">
            Height
          </label>
          <input
            type="number"
            id="item-height"
            value={height}
            onChange={(e) => handleNumberChange(e, setHeight)}
            onBlur={applyChanges}
            min="20"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
      </div>

      {/* Rotation */}
      <div>
        <label htmlFor="item-rotation" className="block text-sm font-medium text-gray-700">
          Rotation (degrees)
        </label>
        <input
          type="number"
          id="item-rotation"
          value={rotation}
          onChange={(e) => handleNumberChange(e, setRotation)}
          onBlur={applyChanges}
          min="0"
          max="359"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>

      {/* Capacity (only for tables) */}
      {item.type === 'table' && (
        <div>
          <label htmlFor="item-capacity" className="block text-sm font-medium text-gray-700">
            Capacity
          </label>
          <input
            type="number"
            id="item-capacity"
            value={capacity}
            onChange={(e) => handleNumberChange(e, setCapacity)}
            onBlur={applyChanges}
            min="1"
            max="20"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
      )}

      {/* Color */}
      <div>
        <label htmlFor="item-color" className="block text-sm font-medium text-gray-700">
          Color
        </label>
        <div className="mt-1 flex items-center">
          <input
            type="color"
            id="item-color"
            value={color}
            onChange={(e) => handleInputChange(setColor, e.target.value)}
            onBlur={applyChanges}
            className="h-8 w-8 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => handleInputChange(setColor, e.target.value)}
            onBlur={applyChanges}
            className="ml-2 flex-1 block border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
      </div>

      {/* Delete Button */}
      <div className="pt-4">
        <button
          onClick={() => deleteItem(item.id)}
          className="w-full inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <FiTrash2 className="mr-2 -ml-1" />
          Delete Item
        </button>
      </div>
    </div>
  )
}

export default LayoutItemProperties
