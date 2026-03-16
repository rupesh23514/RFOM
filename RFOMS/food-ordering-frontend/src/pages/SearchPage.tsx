import { useSearchRestaurants } from "@/api/RestaurantApi";
import CuisineFilter from "@/components/CuisineFilter";
import PaginationSelector from "@/components/PaginationSelector";
import SearchBar, { SearchForm } from "@/components/SearchBar";
import SearchResultCard from "@/components/SearchResultCard";
import SearchResultInfo from "@/components/SearchResultInfo";
import SortOptionDropdown from "@/components/SortOptionDropdown";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useCitySearch } from "@/api/CityApi";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Leaf, Star, SlidersHorizontal, X } from "lucide-react";

export type SearchState = {
  searchQuery: string;
  page: number;
  selectedCuisines: string[];
  sortOption: string;
  isVeg?: boolean;
  minRating?: number;
};

const SearchPage = () => {
  const { city: cityParam } = useParams();
  const { cities } = useCitySearch();
  const navigate = useNavigate();
  const [urlSearchParams] = useSearchParams();

  // Read initial search query + filters from URL params (set by Hero/HomePage)
  const initialQuery = urlSearchParams.get("searchQuery") || "";
  const initialIsVeg = urlSearchParams.get("isVeg") === "true" || undefined;
  const initialMinRating = urlSearchParams.get("minRating")
    ? Number(urlSearchParams.get("minRating"))
    : undefined;

  const [searchState, setSearchState] = useState<SearchState>({
    searchQuery: initialQuery,
    page: 1,
    selectedCuisines: [],
    sortOption: "bestMatch",
    isVeg: initialIsVeg,
    minRating: initialMinRating,
  });
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const city = cityParam || "all";
  const { results, isLoading } = useSearchRestaurants(searchState, city);

  // Sync searchState when URL params change (e.g. navigating from Hero again)
  useEffect(() => {
    const q = urlSearchParams.get("searchQuery") || "";
    const veg = urlSearchParams.get("isVeg") === "true" || undefined;
    const rating = urlSearchParams.get("minRating")
      ? Number(urlSearchParams.get("minRating"))
      : undefined;
    setSearchState((prev) => ({
      ...prev,
      searchQuery: q,
      isVeg: veg,
      minRating: rating,
      page: 1,
    }));
  }, [urlSearchParams]);

  const setSortOption = (sortOption: string) => {
    setSearchState((prevState) => ({
      ...prevState,
      sortOption,
      page: 1,
    }));
  };

  const setSelectedCuisines = (selectedCuisines: string[]) => {
    setSearchState((prevState) => ({
      ...prevState,
      selectedCuisines,
      page: 1,
    }));
  };

  const setPage = (page: number) => {
    setSearchState((prevState) => ({
      ...prevState,
      page,
    }));
  };

  const handleSearch = (formValues: SearchForm) => {
    const inputCity = formValues.city?.trim() || "";
    // If city is not empty and not in the list, show no results
    if (
      inputCity &&
      !cities.some((c) => c.toLowerCase() === inputCity.toLowerCase())
    ) {
      setSearchState((prevState) => ({
        ...prevState,
        searchQuery: formValues.searchQuery ?? "",
        page: 1,
      }));
      navigate(`/search/${inputCity}`);
      return;
    }
    const cityParam = inputCity !== "" ? inputCity : "all";
    setSearchState((prevState) => ({
      ...prevState,
      searchQuery: formValues.searchQuery ?? "",
      page: 1,
    }));
    navigate(`/search/${cityParam}`);
  };

  const resetSearch = () => {
    setSearchState((prevState) => ({
      ...prevState,
      searchQuery: "",
      page: 1,
    }));
  };

  // If city is not in the list, show no results
  if (
    !isLoading &&
    city !== "all" &&
    !cities.some((c) => c.toLowerCase() === city.toLowerCase())
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <span className="text-lg font-semibold text-gray-700">
          Sorry, there is no restaurant near to your search area.
        </span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* Top bar: Search + Filters */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 -mx-4 px-4 py-3 mb-6 shadow-sm">
        <div className="max-w-6xl mx-auto space-y-3">
          <SearchBar
            searchQuery={searchState.searchQuery}
            onSubmit={handleSearch}
            placeHolder="Search for restaurant, cuisine or a dish"
            onReset={resetSearch}
            city={city}
          />

          {/* Swiggy-style filter chips */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() =>
                setSearchState((prev) => ({
                  ...prev,
                  isVeg: !prev.isVeg,
                  page: 1,
                }))
              }
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
                searchState.isVeg
                  ? "bg-green-600 text-white border-green-600 shadow-md"
                  : "bg-white text-gray-700 border-gray-300 hover:border-green-400"
              }`}
            >
              <Leaf className="w-4 h-4" />
              Pure Veg
            </button>

            {[4, 4.5].map((rating) => (
              <button
                key={rating}
                onClick={() =>
                  setSearchState((prev) => ({
                    ...prev,
                    minRating: prev.minRating === rating ? undefined : rating,
                    page: 1,
                  }))
                }
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
                  searchState.minRating === rating
                    ? "bg-orange-500 text-white border-orange-500 shadow-md"
                    : "bg-white text-gray-700 border-gray-300 hover:border-orange-400"
                }`}
              >
                <Star className="w-3.5 h-3.5" fill="currentColor" />
                {rating}+
              </button>
            ))}

            <SortOptionDropdown
              sortOption={searchState.sortOption}
              onChange={(value) => setSortOption(value)}
            />

            {(searchState.isVeg || searchState.minRating || searchState.selectedCuisines.length > 0) && (
              <button
                onClick={() =>
                  setSearchState((prev) => ({
                    ...prev,
                    isVeg: undefined,
                    minRating: undefined,
                    selectedCuisines: [],
                    page: 1,
                  }))
                }
                className="flex items-center gap-1 px-3 py-2 rounded-full text-sm text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 whitespace-nowrap"
              >
                <X className="w-3.5 h-3.5" />
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar: Cuisine Filter */}
        <aside className="hidden lg:block">
          <div className="sticky top-40 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-orange-500" />
              Cuisines
            </h3>
            <CuisineFilter
              selectedCuisines={searchState.selectedCuisines}
              onChange={setSelectedCuisines}
              isExpanded={isExpanded}
              onExpandedClick={() =>
                setIsExpanded((prevIsExpanded) => !prevIsExpanded)
              }
            />
          </div>
        </aside>

        {/* Restaurant List */}
        <div className="flex flex-col gap-5">
          {isLoading ? (
            <>
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-48" />
              </div>
              {[...Array(5)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
                  <div className="flex gap-4">
                    <Skeleton className="h-32 w-32 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex gap-2 mt-2">
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <SearchResultInfo total={results?.pagination?.total || 0} city={city} />
              </div>

              <div className="flex flex-col gap-4">
                {results?.data?.map((restaurant) => (
                  <SearchResultCard restaurant={restaurant} key={restaurant._id} />
                ))}
              </div>

              {results?.pagination && (
                <PaginationSelector
                  page={results.pagination.page}
                  pages={results.pagination.pages}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
