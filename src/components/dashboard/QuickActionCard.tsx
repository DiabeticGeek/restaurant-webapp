import { Link } from 'react-router-dom';

interface QuickActionCardProps {
  title: string;
  description: string;
  linkTo: string;
}

const QuickActionCard = ({ title, description, linkTo }: QuickActionCardProps) => {
  return (
    <Link
      to={linkTo}
      className="block bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
    >
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </Link>
  );
};

export default QuickActionCard;
