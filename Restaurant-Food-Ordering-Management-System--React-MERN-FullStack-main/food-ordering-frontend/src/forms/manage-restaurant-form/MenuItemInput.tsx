import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { Leaf, Flame, Trash2, Star } from "lucide-react";

type Props = {
  index: number;
  removeMenuItem: () => void;
};

const CATEGORIES = [
  "Starters",
  "Main Course",
  "Breads",
  "Rice & Biryani",
  "Desserts",
  "Beverages",
  "Snacks",
  "Thali",
  "Chinese",
  "South Indian",
];

const MenuItemInput = ({ index, removeMenuItem }: Props) => {
  const { control, watch, setValue } = useFormContext();
  const isVeg = watch(`menuItems.${index}.isVeg`);
  const isPopular = watch(`menuItems.${index}.isPopular`);

  return (
    <div className="border rounded-xl p-4 bg-white space-y-3 shadow-sm">
      {/* Row 1: Name, Price, Veg toggle */}
      <div className="flex flex-wrap items-end gap-3">
        <FormField
          control={control}
          name={`menuItems.${index}.name`}
          render={({ field }) => (
            <FormItem className="flex-1 min-w-[180px]">
              <FormLabel className="flex items-center gap-1 text-sm font-medium">
                Name <FormMessage />
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Cheese Pizza"
                  className="bg-gray-50"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`menuItems.${index}.price`}
          render={({ field }) => (
            <FormItem className="w-24">
              <FormLabel className="flex items-center gap-1 text-sm font-medium">
                Price (₹) <FormMessage />
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="8.00" className="bg-gray-50" />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Veg/Non-Veg toggle */}
        <button
          type="button"
          onClick={() => setValue(`menuItems.${index}.isVeg`, !isVeg)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
            isVeg !== false
              ? "bg-green-50 border-green-400 text-green-700"
              : "bg-red-50 border-red-400 text-red-700"
          }`}
        >
          <span
            className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center ${
              isVeg !== false ? "border-green-600" : "border-red-600"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isVeg !== false ? "bg-green-600" : "bg-red-600"
              }`}
            />
          </span>
          {isVeg !== false ? "Veg" : "Non-Veg"}
        </button>

        {/* Popular toggle */}
        <button
          type="button"
          onClick={() => setValue(`menuItems.${index}.isPopular`, !isPopular)}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
            isPopular
              ? "bg-amber-50 border-amber-400 text-amber-700"
              : "bg-gray-50 border-gray-300 text-gray-500"
          }`}
        >
          <Star className="w-3.5 h-3.5" fill={isPopular ? "currentColor" : "none"} />
          Popular
        </button>
      </div>

      {/* Row 2: Description */}
      <FormField
        control={control}
        name={`menuItems.${index}.description`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                {...field}
                placeholder="A short description of the dish..."
                className="bg-gray-50 text-sm"
              />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Row 3: Category, Spice Level */}
      <div className="flex flex-wrap items-end gap-3">
        <FormField
          control={control}
          name={`menuItems.${index}.category`}
          render={({ field }) => (
            <FormItem className="flex-1 min-w-[140px]">
              <FormLabel className="text-xs text-gray-500">Category</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`menuItems.${index}.spiceLevel`}
          render={({ field }) => (
            <FormItem className="w-36">
              <FormLabel className="text-xs text-gray-500 flex items-center gap-1">
                <Flame className="w-3 h-3" /> Spice Level
              </FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm"
                >
                  <option value="mild">🌶 Mild</option>
                  <option value="medium">🌶🌶 Medium</option>
                  <option value="hot">🌶🌶🌶 Hot</option>
                  <option value="extra-hot">🌶🌶🌶🌶 Extra Hot</option>
                </select>
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={removeMenuItem}
          className="flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" />
          Remove
        </Button>
      </div>
    </div>
  );
};

export default MenuItemInput;
