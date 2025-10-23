import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { MenuCategory } from '../../utils/supabaseClient';

interface CategoryNode extends MenuCategory {
  children?: CategoryNode[];
}

interface CategoryNodeRowProps {
  node: CategoryNode;
  level: number;
  selectedCategoryId: string | null;
  onSelect: (id: string) => void;
  onEdit: (category: MenuCategory) => void;
  onDelete: (id: string) => void;
}

const CategoryNodeRow = ({ node, level, selectedCategoryId, onSelect, onEdit, onDelete }: CategoryNodeRowProps) => {
  return (
    <div className="space-y-2">
      <div className={`flex justify-between items-center rounded-md border p-3 ${selectedCategoryId === node.id ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
        <div>
          <button
            className="text-left"
            onClick={() => onSelect(node.id)}
          >
            <p className="font-semibold text-gray-900">
              {'—'.repeat(level)} {node.name}
            </p>
            {node.description && <p className="text-xs text-gray-500">{node.description}</p>}
          </button>
        </div>
        <div className="flex space-x-2">
          <button className="text-gray-500 hover:text-primary" onClick={() => onEdit(node)}>
            <FiEdit2 />
          </button>
          <button className="text-red-500 hover:text-red-600" onClick={() => onDelete(node.id)}>
            <FiTrash2 />
          </button>
        </div>
      </div>
      {node.children && node.children.length > 0 && (
        <div className="ml-4">
          {node.children.map((child) => (
            <CategoryNodeRow
              key={child.id}
              node={child}
              level={level + 1}
              selectedCategoryId={selectedCategoryId}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryNodeRow;
