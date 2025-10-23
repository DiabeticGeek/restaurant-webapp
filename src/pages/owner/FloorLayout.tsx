import { useState, useEffect } from 'react'
import { FiTrash2, FiPlus } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { supabase, Layout, LayoutItem } from '../../utils/supabaseClient'
import LayoutEditor from '../../components/layout/LayoutEditor'
import LayoutControls from '../../components/layout/LayoutControls'
import LayoutItemProperties from '../../components/layout/LayoutItemProperties'
import { v4 as uuidv4 } from 'uuid'


const FloorLayout = () => {
  const { user } = useAuth()
  const [layouts, setLayouts] = useState<Layout[]>([])
  const [currentLayout, setCurrentLayout] = useState<Layout | null>(null)
  const [selectedItem, setSelectedItem] = useState<LayoutItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch layouts
  useEffect(() => {
    const fetchLayouts = async () => {
      if (!user?.restaurantId) return

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('table_layouts')
          .select('*')
          .eq('restaurant_id', user.restaurantId)
          .order('created_at', { ascending: false })

        if (error) throw error

        if (data && data.length > 0) {
          const parsedLayouts = data.map(layout => ({
            id: layout.id,
            name: layout.name,
            gridSize: layout.layout_data.gridSize || { width: 500, height: 500 },
            items: layout.layout_data.items || []
          }))
          
          setLayouts(parsedLayouts)
          setCurrentLayout(parsedLayouts[0])
        } else {
          // Create a default layout if none exists
          createNewLayout()
        }
      } catch (err: any) {
        setError(err.message)
        console.error('Error fetching layouts:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLayouts()
  }, [user?.restaurantId])

  // Create a new layout
  const createNewLayout = async () => {
    if (!user?.restaurantId) return

    const newLayout: Layout = {
      id: uuidv4(),
      name: 'New Layout',
      gridSize: { width: 500, height: 500 },
      items: []
    }

    try {
      const { error } = await supabase
        .from('table_layouts')
        .insert({
          id: newLayout.id,
          restaurant_id: user.restaurantId,
          name: newLayout.name,
          layout_data: {
            gridSize: newLayout.gridSize,
            items: newLayout.items
          }
        })

      if (error) throw error

      setLayouts([newLayout, ...layouts])
      setCurrentLayout(newLayout)
      setSelectedItem(null)
    } catch (err: any) {
      setError(err.message)
      console.error('Error creating layout:', err)
    }
  }

  // Auto-save layout changes with debounce
  useEffect(() => {
    if (!currentLayout || loading) return

    const handler = setTimeout(async () => {
      if (!user?.restaurantId) return

      try {
        const { error: updateError } = await supabase
          .from('table_layouts')
          .update({
            name: currentLayout.name,
            layout_data: {
              gridSize: currentLayout.gridSize,
              items: currentLayout.items,
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentLayout.id)

        if (updateError) throw updateError

        // Update layouts list in local state to keep it in sync
        setLayouts((prevLayouts) =>
          prevLayouts.map((layout) =>
            layout.id === currentLayout.id ? currentLayout : layout
          )
        )
      } catch (err: any) {
        setError(`Failed to auto-save: ${err.message}`)
        console.error('Error auto-saving layout:', err)
      }
    }, 1500) // Debounce with 1.5 seconds

    return () => {
      clearTimeout(handler)
    }
  }, [currentLayout, user?.restaurantId, loading])

  // Delete current layout
  const deleteLayout = async () => {
    if (!currentLayout || !user?.restaurantId) return
    if (layouts.length <= 1) {
      setError("You can't delete the only layout. Create a new one first.")
      return
    }

    try {
      const { error } = await supabase
        .from('table_layouts')
        .delete()
        .eq('id', currentLayout.id)

      if (error) throw error

      // Update layouts list and select another layout
      const updatedLayouts = layouts.filter(layout => layout.id !== currentLayout.id)
      setLayouts(updatedLayouts)
      setCurrentLayout(updatedLayouts[0])
      setSelectedItem(null)
      setError(null)
    } catch (err: any) {
      setError(err.message)
      console.error('Error deleting layout:', err)
    }
  }

  // Add a new item to the layout
  const addItem = (type: LayoutItem['type'], shape: LayoutItem['shape']) => {
    if (!currentLayout) return

    const newItem: LayoutItem = {
      id: uuidv4(),
      type,
      shape,
      x: 100,
      y: 100,
      width: type === 'table' ? 80 : type === 'chair' ? 40 : 120,
      height: type === 'table' ? 80 : type === 'chair' ? 40 : 30,
      rotation: 0,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${currentLayout.items.length + 1}`,
      capacity: type === 'table' ? 4 : undefined,
      color: type === 'table' ? '#8B4513' : type === 'chair' ? '#A0522D' : '#333333'
    }

    const updatedLayout = {
      ...currentLayout,
      items: [...currentLayout.items, newItem]
    }

    setCurrentLayout(updatedLayout)
    setSelectedItem(newItem)
  }

  // Update an item in the layout
  const updateItem = (updatedItem: LayoutItem) => {
    if (!currentLayout) return

    const updatedItems = currentLayout.items.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    )

    setCurrentLayout({
      ...currentLayout,
      items: updatedItems
    })
    setSelectedItem(updatedItem)
  }

  // Delete an item from the layout
  const deleteItem = (itemId: string) => {
    if (!currentLayout) return

    const updatedItems = currentLayout.items.filter(item => item.id !== itemId)

    setCurrentLayout({
      ...currentLayout,
      items: updatedItems
    })
    setSelectedItem(null)
  }

  // Update grid size
  const updateGridSize = (width: number, height: number) => {
    if (!currentLayout) return

    setCurrentLayout({
      ...currentLayout,
      gridSize: { width, height }
    })
  }

  // Update layout name
  const updateLayoutName = (name: string) => {
    if (!currentLayout) return

    setCurrentLayout({
      ...currentLayout,
      name
    })
  }

  // Switch to a different layout
  const switchLayout = (layoutId: string) => {
    const layout = layouts.find(l => l.id === layoutId)
    if (layout) {
      setCurrentLayout(layout)
      setSelectedItem(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Floor Layout Editor</h1>
            <p className="mt-1 text-sm text-gray-500">
              Design your restaurant floor plan
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={createNewLayout}
              className="btn btn-secondary flex items-center"
            >
              <FiPlus className="mr-2" />
              New Layout
            </button>
            <button
              onClick={deleteLayout}
              disabled={layouts.length <= 1}
              className="btn btn-outline text-red-600 flex items-center"
            >
              <FiTrash2 className="mr-2" />
              Delete
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Layout selector */}
        {layouts.length > 1 && (
          <div className="mt-4">
            <label htmlFor="layout-select" className="block text-sm font-medium text-gray-700">
              Select Layout
            </label>
            <select
              id="layout-select"
              value={currentLayout?.id}
              onChange={(e) => switchLayout(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
              {layouts.map((layout) => (
                <option key={layout.id} value={layout.id}>
                  {layout.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Layout name editor */}
        {currentLayout && (
          <div className="mt-4">
            <label htmlFor="layout-name" className="block text-sm font-medium text-gray-700">
              Layout Name
            </label>
            <input
              type="text"
              id="layout-name"
              value={currentLayout.name}
              onChange={(e) => updateLayoutName(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
        )}

        {/* Main editor area */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Controls</h2>
              <LayoutControls 
                addItem={addItem}
                updateGridSize={updateGridSize}
                currentGridSize={currentLayout?.gridSize || { width: 500, height: 500 }}
              />
            </div>
          </div>

          {/* Editor */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6 overflow-auto">
              {currentLayout && (
                <LayoutEditor
                  layout={currentLayout}
                  selectedItem={selectedItem}
                  setSelectedItem={setSelectedItem}
                  updateItem={updateItem}
                />
              )}
            </div>
          </div>

          {/* Properties */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Properties</h2>
              {selectedItem ? (
                <LayoutItemProperties
                  item={selectedItem}
                  updateItem={updateItem}
                  deleteItem={deleteItem}
                />
              ) : (
                <p className="text-gray-500">Select an item to edit its properties</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FloorLayout
