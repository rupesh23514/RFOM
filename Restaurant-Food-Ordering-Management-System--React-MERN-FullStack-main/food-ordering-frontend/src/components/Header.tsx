import { Link } from "react-router-dom";
import MobileNav from "./MobileNav";
import MainNav from "./MainNav";
import { MapPin } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto flex justify-between items-center w-full h-16 px-4">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg font-black">D</span>
            </div>
            <span className="text-2xl font-extrabold text-gray-800 tracking-tight">
              Dhaba
            </span>
          </Link>

          {/* Location pill - Swiggy style */}
          <Link
            to="/search/all"
            className="hidden lg:flex items-center gap-1.5 text-sm text-gray-600 hover:text-orange-500 transition-colors group"
          >
            <MapPin className="w-4 h-4 text-orange-500" />
            <span className="font-medium border-b border-dashed border-gray-400 group-hover:border-orange-500">
              All Cities
            </span>
          </Link>
        </div>

        {/* Nav */}
        <div className="md:hidden">
          <MobileNav />
        </div>
        <div className="hidden md:block">
          <MainNav />
        </div>
      </div>
    </header>
  );
};

export default Header;
