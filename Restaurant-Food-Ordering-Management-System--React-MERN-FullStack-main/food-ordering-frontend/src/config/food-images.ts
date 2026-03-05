/**
 * Maps common Indian food keywords to high-quality Unsplash images.
 * Used to display appetizing photos for menu items that don't have their own image.
 */
const FOOD_IMAGE_MAP: Record<string, string> = {
  // North Indian
  "butter chicken": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80",
  "dal makhani": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80",
  "paneer tikka": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80",
  "paneer": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80",
  "naan": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80",
  "tandoori": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80",
  "chicken": "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=400&q=80",
  "biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80",
  "kebab": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80",
  "kulcha": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80",

  // South Indian
  "dosa": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&q=80",
  "masala dosa": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&q=80",
  "idli": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80",
  "sambar": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80",

  // Snacks / Street Food
  "vada pav": "https://images.unsplash.com/photo-1606491956689-2ea866880049?w=400&q=80",
  "pav bhaji": "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=400&q=80",
  "samosa": "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400&q=80",
  "chaat": "https://images.unsplash.com/photo-1606491956689-2ea866880049?w=400&q=80",
  "roll": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
  "bhaji": "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=400&q=80",

  // Rice / Main
  "rice": "https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=400&q=80",
  "fried rice": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80",
  "thali": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80",
  "dal": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80",
  "curry": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80",
  "fish": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
  "stew": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80",
  "appam": "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&q=80",

  // Desserts and drinks
  "gulab jamun": "https://images.unsplash.com/photo-1666190050431-e9e1e8e3b6c4?w=400&q=80",
  "lassi": "https://images.unsplash.com/photo-1571006682375-d4c0e6e9e2aa?w=400&q=80",
  "chai": "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&q=80",
  "dhokla": "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400&q=80",

  // Generic
  "pizza": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
  "burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
  "pasta": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&q=80",
  "salad": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80",
  "soup": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80",
};

/** Default fallback image when no keyword matches */
const DEFAULT_FOOD_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80";

/**
 * Returns an appetizing food image URL for a given menu item name.
 * Matches against known keywords; falls back to a generic food photo.
 */
export function getFoodImage(itemName: string): string {
  const lower = itemName.toLowerCase();

  // Try exact match first
  if (FOOD_IMAGE_MAP[lower]) return FOOD_IMAGE_MAP[lower];

  // Try partial keyword match
  for (const [keyword, url] of Object.entries(FOOD_IMAGE_MAP)) {
    if (lower.includes(keyword) || keyword.includes(lower)) {
      return url;
    }
  }

  return DEFAULT_FOOD_IMAGE;
}

export default FOOD_IMAGE_MAP;
