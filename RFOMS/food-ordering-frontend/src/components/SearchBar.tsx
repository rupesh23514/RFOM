import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem } from "./ui/form";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import CityDropdown from "./CityDropdown";

const formSchema = z.object({
  city: z.string().optional(),
  searchQuery: z.string().optional(),
});

export type SearchForm = z.infer<typeof formSchema>;

type Props = {
  onSubmit: (formData: SearchForm) => void;
  placeHolder: string;
  onReset?: () => void;
  searchQuery?: string;
  city?: string;
};

const SearchBar = ({
  onSubmit,
  onReset,
  placeHolder,
  searchQuery,
  city,
}: Props) => {
  const [selectedCity, setSelectedCity] = useState(city || "");
  const form = useForm<SearchForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      searchQuery,
      city: city || "",
    },
  });

  useEffect(() => {
    form.reset({ searchQuery, city: selectedCity });
  }, [form, searchQuery, selectedCity]);

  const handleReset = () => {
    form.reset({
      searchQuery: "",
      city: "",
    });
    setSelectedCity("");
    if (onReset) {
      onReset();
    }
  };

  const handleCityChange = (cityVal: string) => {
    setSelectedCity(cityVal);
    form.setValue("city", cityVal);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`flex items-center gap-3 justify-between flex-row bg-white border-2 border-gray-200 rounded-full p-2 md:p-3 shadow-sm hover:shadow-md focus-within:shadow-md focus-within:border-orange-300 transition-all ${
          form.formState.errors.searchQuery && "border-red-500"
        }`}
      >
        <Search
          strokeWidth={2.5}
          size={24}
          className="ml-2 text-orange-500 hidden md:block"
        />
        <div className="flex flex-1 items-center gap-2">
          <CityDropdown value={selectedCity} onChange={handleCityChange} />
          <div className="w-px h-6 bg-gray-200 hidden md:block" />
          <FormField
            control={form.control}
            name="searchQuery"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    {...field}
                    className="border-none shadow-none text-base md:text-lg focus-visible:ring-0 placeholder:text-gray-400"
                    placeholder={placeHolder}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <Button
          onClick={handleReset}
          type="button"
          variant="ghost"
          className="rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 text-sm"
        >
          Reset
        </Button>
        <Button type="submit" className="rounded-full bg-orange-500 hover:bg-orange-600 text-white px-6 shadow-md">
          Search
        </Button>
      </form>
    </Form>
  );
};

export default SearchBar;
