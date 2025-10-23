import { Link } from 'react-router-dom';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  linkTo: string;
  linkText: string;
  color: string;
}

const StatCard = ({ icon, title, value, linkTo, linkText, color }: StatCardProps) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${color} rounded-md p-3`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm">
          <Link to={linkTo} className="font-medium text-primary hover:text-primary-dark">
            {linkText}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
