import React from 'react';
import { Link } from 'react-router-dom';
import { Target } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <Target className="w-8 h-8 text-primary-500 mr-3" />
            <span className="text-xl font-bold text-white">Campaign Builder</span>
          </Link>
          
          <nav className="flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              New Brief
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

