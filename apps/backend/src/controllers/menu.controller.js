import supabase from "../config/supabase.js";

export const getMenu = async (req, res) => {
  const { data, error } = await supabase
    .from("categories")
    .select(`
      id,
      name,
      menu_items (
        id,
        name,
        price,
        is_available
      )
    `)
    .eq("is_active", true);

  if (error) return res.status(500).json(error);
  res.json(data);
};
