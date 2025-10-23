import { useState, useEffect } from 'react';
import { FiTrash2, FiPlus } from 'react-icons/fi';
import { Layout, LayoutItem } from '../../utils/supabaseClient';
import LayoutEditor from '../../components/layout/LayoutEditor';
import LayoutControls from '../../components/layout/LayoutControls';
import LayoutItemProperties from '../../components/layout/LayoutItemProperties';
import { useLayouts } from '../../hooks/useLayouts';
import { v4 as uuidv4 } from 'uuid';
import { useDebounce } from 'use-debounce';

const FloorLayout = () => {
  const { layouts, isLoading, error, createLayout, updateLayout, deleteLayout } = useLayouts();
  const [currentLayout, setCurrentLayout] = useState<Layout | null>(null);
  const [selectedItem, setSelectedItem] = useState<LayoutItem | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const [debouncedLayout] = useDebounce(currentLayout, 1500);

  useEffect(() => {
    if (layouts && layouts.length > 0 && !currentLayout) {
      setCurrentLayout(layouts[0]);
    }
  }, [layouts, currentLayout]);

  useEffect(() => {
    if (debouncedLayout) {
      updateLayout(debouncedLayout);
    }
  }, [debouncedLayout, updateLayout]);

  const handleCreateLayout = async () => {
    try {
      const newLayout = await createLayout();
      setCurrentLayout(newLayout);
      setSelectedItem(null);
    } catch (err: any) {
      setLocalError(`Failed to create layout: ${err.message}`);
    }
  };

  const handleDeleteLayout = () => {
    if (!currentLayout || !layouts || layouts.length <= 1) {
      setLocalError("You can't delete the only layout. Create a new one first.");
      return;
    }
    deleteLayout(currentLayout.id, {
      onSuccess: () => {
        setCurrentLayout(layouts.find(l => l.id !== currentLayout.id) || null);
        setSelectedItem(null);
        setLocalError(null);
      },
    });
  };

  const updateLayoutState = (updatedLayout: Layout) => {
    setCurrentLayout(updatedLayout);
  };

  const addItem = (type: LayoutItem['type'], shape: LayoutItem['shape']) => {
    if (!currentLayout) return;

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
      color: type === 'table' ? '#8B4513' : type === 'chair' ? '#A0522D' : '#333333',
    };

    const updatedLayout = {
      ...currentLayout,
      items: [...currentLayout.items, newItem],
    };

    updateLayoutState(updatedLayout);
    setSelectedItem(newItem);
  };

  const updateItem = (updatedItem: LayoutItem) => {
    if (!currentLayout) return;

    const updatedItems = currentLayout.items.map(item =>
      item.id === updatedItem.id ? updatedItem : item
    );

    updateLayoutState({ ...currentLayout, items: updatedItems });
    setSelectedItem(updatedItem);
  };

  const deleteItem = (itemId: string) => {
    if (!currentLayout) return;

    const updatedItems = currentLayout.items.filter(item => item.id !== itemId);
    updateLayoutState({ ...currentLayout, items: updatedItems });
    setSelectedItem(null);
  };

  const updateGridSize = (width: number, height: number) => {
    if (!currentLayout) return;
    updateLayoutState({ ...currentLayout, gridSize: { width, height } });
  };

  const updateLayoutName = (name: string) => {
    if (!currentLayout) return;
    updateLayoutState({ ...currentLayout, name });
  };

  const switchLayout = (layoutId: string) => {
    const layout = layouts?.find(l => l.id === layoutId);
    if (layout) {
      setCurrentLayout(layout);
      setSelectedItem(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Floor Layout Editor</h1>
            <p className="mt-1 text-sm text-gray-500">Design your restaurant floor plan</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleCreateLayout}
              className="btn btn-secondary flex items-center"
            >
              <FiPlus className="mr-2" />
              New Layout
            </button>
            <button
              onClick={handleDeleteLayout}
              disabled={!layouts || layouts.length <= 1}
              className="btn btn-outline text-red-600 flex items-center"
            >
              <FiTrash2 className="mr-2" />
              Delete
            </button>
          </div>
        </div>

        {(error || localError) && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error?.message || localError}</p>
              </div>
            </div>
          </div>
        )}

        {layouts && layouts.length > 1 && (
          <div className="mt-4">
            <label htmlFor="layout-select" className="block text-sm font-medium text-gray-700">
              Select Layout
            </label>
            <select
              id="layout-select"
              value={currentLayout?.id || ''}
              onChange={e => switchLayout(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
              {layouts.map(layout => (
                <option key={layout.id} value={layout.id}>
                  {layout.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {currentLayout && (
          <div className="mt-4">
            <label htmlFor="layout-name" className="block text-sm font-medium text-gray-700">
              Layout Name
            </label>
            <input
              type="text"
              id="layout-name"
              value={currentLayout.name}
              onChange={e => updateLayoutName(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
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
  );
}

export default FloorLayout
