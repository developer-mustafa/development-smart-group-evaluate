import { useNavigate } from 'react-router-dom';

export default function PlaceholderPage({ title, icon, description }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 space-y-6">
      <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center shadow-inner">
        <i className={`${icon || 'fas fa-tools'} text-4xl text-gray-400 dark:text-gray-500`}></i>
      </div>
      
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          {title || 'Under Construction'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          {description || 'This feature is currently being implemented. Please check back soon!'}
        </p>
      </div>

      <button 
        onClick={() => navigate('/')}
        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
      >
        <i className="fas fa-arrow-left mr-2"></i>
        Back to Dashboard
      </button>
    </div>
  );
}
