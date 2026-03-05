import SearchBar, { SearchForm } from "@/components/SearchBar";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  const handleSearchSubmit = (formValues: SearchForm) => {
    const cityParam =
      formValues.city && formValues.city.trim() !== ""
        ? formValues.city
        : "all";
    navigate({
      pathname: `/search/${cityParam}`,
      search: formValues.searchQuery
        ? `?searchQuery=${encodeURIComponent(formValues.searchQuery)}`
        : undefined,
    });
  };

  return (
    <div className="relative w-full bg-gradient-to-b from-orange-50 via-white to-white overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-orange-100 rounded-full opacity-40 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-red-100 rounded-full opacity-30 blur-3xl" />

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Hungry?{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
              Dhaba
            </span>{" "}
            delivers.
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-xl mx-auto">
            Order food from the best restaurants near you. Fast delivery,
            amazing taste, every time.
          </p>

          {/* Search bar - Swiggy style */}
          <div className="max-w-2xl mx-auto mt-8">
            <SearchBar
              placeHolder="Search for restaurant, cuisine or a dish"
              onSubmit={handleSearchSubmit}
            />
          </div>

          {/* Quick stats */}
          <div className="flex items-center justify-center gap-8 pt-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>500+ Restaurants</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span>100+ Cities</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span>30 min Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
