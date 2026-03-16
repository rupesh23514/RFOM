import { Button } from "@/components/ui/button";
import { FormDescription, FormField, FormItem } from "@/components/ui/form";
import { useFieldArray, useFormContext } from "react-hook-form";
import MenuItemInput from "./MenuItemInput";
import { Plus } from "lucide-react";

const MenuSection = () => {
  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "menuItems",
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Menu Items</h2>
        <FormDescription>
          Create your menu — add items with name, price, description, veg/non-veg, category &amp; spice level
        </FormDescription>
      </div>
      <FormField
        control={control}
        name="menuItems"
        render={() => (
          <FormItem className="flex flex-col gap-3">
            {fields.map((field, index) => (
              <MenuItemInput
                key={field.id}
                index={index}
                removeMenuItem={() => remove(index)}
              />
            ))}
          </FormItem>
        )}
      />
      <Button
        type="button"
        variant="outline"
        className="flex items-center gap-2 border-dashed"
        onClick={() =>
          append({
            name: "",
            price: "",
            description: "",
            isVeg: true,
            category: "Main Course",
            spiceLevel: "medium",
            isPopular: false,
          })
        }
      >
        <Plus className="w-4 h-4" />
        Add Menu Item
      </Button>
    </div>
  );
};

export default MenuSection;
