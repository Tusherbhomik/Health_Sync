
import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 mt-auto py-8">
      <div className="medical-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center">
              <span className="text-medical-secondary dark:text-teal-400 font-bold text-xl">Med</span>
              <span className="text-medical-primary dark:text-cyan-400 font-bold text-xl">Scribe</span>
            </Link>
            <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">
              A modern digital prescription platform connecting doctors and patients for better healthcare experiences.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-medical-primary dark:hover:text-cyan-400">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-600 dark:text-gray-400 hover:text-medical-primary dark:hover:text-cyan-400">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-gray-600 dark:text-gray-400 hover:text-medical-primary dark:hover:text-cyan-400">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-medical-primary dark:hover:text-cyan-400">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-medical-primary dark:hover:text-cyan-400">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-medical-primary dark:hover:text-cyan-400">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-medical-primary dark:hover:text-cyan-400">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
            &copy; {currentYear} MedScribe. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
