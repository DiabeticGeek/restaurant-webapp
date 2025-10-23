import { useState } from 'react'
import { FiSquare, FiCircle, FiCoffee, FiMenu, FiGrid } from 'react-icons/fi'
import { LayoutItem } from '../../pages/owner/FloorLayout'

interface LayoutControlsProps {
  addItem: (type: LayoutItem['type'], shape: LayoutItem['shape']) => void
  updateGridSize: (width: number, height: number) => void
  currentGridSize: { width: number; height: number }
}

const LayoutControls: React.FC<LayoutControlsProps> = ({
  addItem,
  updateGridSize,
  currentGridSize,
}) => {
  const [gridWidth, setGridWidth] = useState(currentGridSize.width)
  const [gridHeight, setGridHeight] = useState(currentGridSize.height)

  const handleGridSizeChange = () => {
    const width = Math.max(200, Math.min(2000, gridWidth))
    const height = Math.max(200, Math.min(2000, gridHeight))
    updateGridSize(width, height)
  }

  return (
    <div className="space-y-6">
      {/* Item Types */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Add Items</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => addItem('table', 'rectangle')}
            className="flex flex-col items-center justify-center p-3 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <FiSquare className="h-6 w-6 text-gray-600" />
            <span className="mt-1 text-xs">Square Table</span>
          </button>
          <button
            onClick={() => addItem('table', 'circle')}
            className="flex flex-col items-center justify-center p-3 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <FiCircle className="h-6 w-6 text-gray-600" />
            <span className="mt-1 text-xs">Round Table</span>
          </button>
          <button
            onClick={() => addItem('table', 'oval')}
            className="flex flex-col items-center justify-center p-3 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
              <ellipse cx="12" cy="12" rx="10" ry="6" />
            </svg>
            <span className="mt-1 text-xs">Oval Table</span>
          </button>
          <button
            onClick={() => addItem('chair', 'circle')}
            className="flex flex-col items-center justify-center p-3 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <FiCircle className="h-5 w-5 text-gray-600" />
            <span className="mt-1 text-xs">Chair</span>
          </button>
          <button
            onClick={() => addItem('bar', 'rectangle')}
            className="flex flex-col items-center justify-center p-3 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <FiCoffee className="h-6 w-6 text-gray-600" />
            <span className="mt-1 text-xs">Bar</span>
          </button>
          <button
            onClick={() => addItem('wall', 'rectangle')}
            className="flex flex-col items-center justify-center p-3 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <FiMenu className="h-6 w-6 text-gray-600" />
            <span className="mt-1 text-xs">Wall</span>
          </button>
          <button
            onClick={() => addItem('door', 'rectangle')}
            className="flex flex-col items-center justify-center p-3 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
              <path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14" />
              <path d="M2 20h20" />
              <path d="M14 12v.01" />
            </svg>
            <span className="mt-1 text-xs">Door</span>
          </button>
          <button
            onClick={() => addItem('other', 'rectangle')}
            className="flex flex-col items-center justify-center p-3 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <FiGrid className="h-6 w-6 text-gray-600" />
            <span className="mt-1 text-xs">Other</span>
          </button>
        </div>
      </div>

      {/* Grid Size */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Grid Size</h3>
        <div className="space-y-2">
          <div>
            <label htmlFor="grid-width" className="block text-xs text-gray-500">
              Width (px)
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="number"
                id="grid-width"
                value={gridWidth}
                onChange={(e) => setGridWidth(parseInt(e.target.value) || 0)}
                min="200"
                max="2000"
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md sm:text-sm border-gray-300"
              />
            </div>
          </div>
          <div>
            <label htmlFor="grid-height" className="block text-xs text-gray-500">
              Height (px)
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="number"
                id="grid-height"
                value={gridHeight}
                onChange={(e) => setGridHeight(parseInt(e.target.value) || 0)}
                min="200"
                max="2000"
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md sm:text-sm border-gray-300"
              />
            </div>
          </div>
          <button
            onClick={handleGridSizeChange}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Update Grid Size
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 p-3 rounded-md">
        <h3 className="text-sm font-medium text-gray-700 mb-1">Instructions</h3>
        <ul className="text-xs text-gray-500 space-y-1 list-disc pl-4">
          <li>Click on items to select them</li>
          <li>Drag items to move them</li>
          <li>Use the resize handle (bottom right) to resize</li>
          <li>Use the rotate handle (top right) to rotate</li>
          <li>Edit properties in the panel on the right</li>
        </ul>
      </div>
    </div>
  )
}

export default LayoutControls
