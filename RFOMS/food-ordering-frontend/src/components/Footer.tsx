import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-black">D</span>
              </div>
              <span className="text-xl font-extrabold text-white">Dhaba</span>
            </Link>
            <p className="text-sm text-gray-500">
              Order food from the best restaurants near you. Fast delivery, great taste.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-orange-400 transition-colors">About</Link></li>
              <li><Link to="/" className="hover:text-orange-400 transition-colors">Careers</Link></li>
              <li><Link to="/" className="hover:text-orange-400 transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
              Contact
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-orange-400 transition-colors">Help & Support</Link></li>
              <li><Link to="/" className="hover:text-orange-400 transition-colors">Partner with us</Link></li>
              <li><Link to="/" className="hover:text-orange-400 transition-colors">Ride with us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-orange-400 transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/" className="hover:text-orange-400 transition-colors">Cookie Policy</Link></li>
              <li><Link to="/" className="hover:text-orange-400 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm text-gray-500">
            © 2026 Dhaba. All rights reserved.
          </span>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-600">Built with ❤️ in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
