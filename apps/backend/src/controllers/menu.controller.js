import supabase from "../config/supabase.js";

/**
 * Normalizes a category name for use in file paths
 * - Converts to lowercase
 * - Replaces spaces and special characters with dashes
 */
function normalizeCategoryName(categoryName) {
  return categoryName
    .toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

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
        image_url,
        description,
        is_available
      )
    `)
    .eq("is_active", true);

  if (error) return res.status(500).json(error);
  res.json(data);
};

export const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, isNewCategory } = req.body;
    const files = req.files || {};
    const imageFile = files.image ? files.image[0] : null;
    const categoryImageFile = files.categoryImage ? files.categoryImage[0] : null;

    let image_url = req.body.image_url;

    // 1. Upload item image if provided
    if (imageFile) {
      const fileExt = imageFile.originalname.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `items/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("menu-images")
        .upload(filePath, imageFile.buffer, {
          contentType: imageFile.mimetype,
        });

      if (uploadError) throw uploadError;

      const { data: publicURLData } = supabase.storage
        .from("menu-images")
        .getPublicUrl(filePath);

      image_url = publicURLData.publicUrl;
    }

    // 2. Handle Category - find or create
    let categoryId;
    const { data: existingCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("name", category)
      .single();

    if (existingCategory) {
      categoryId = existingCategory.id;
    } else {
      // Create new category
      const { data: newCategory, error: createCatError } = await supabase
        .from("categories")
        .insert([{ name: category, is_active: true }])
        .select()
        .single();

      if (createCatError) throw createCatError;
      categoryId = newCategory.id;

      // 3. Upload category fallback image if provided for new category
      if (categoryImageFile && isNewCategory === "true") {
        const normalizedName = normalizeCategoryName(category);
        const categoryFilePath = `categories/${normalizedName}.webp`;

        const { error: catImageError } = await supabase.storage
          .from("menu-images")
          .upload(categoryFilePath, categoryImageFile.buffer, {
            contentType: categoryImageFile.mimetype,
            upsert: true, // Overwrite if exists
          });

        if (catImageError) {
          console.warn("Failed to upload category image:", catImageError);
          // Don't throw - category image is optional
        }
      }
    }

    // 4. Create the menu item
    const { data: newItem, error: itemError } = await supabase
      .from("menu_items")
      .insert([{
        name,
        description,
        price,
        category_id: categoryId,
        image_url: image_url || null, // Allow null for fallback to category image
        is_available: true
      }])
      .select()
      .single();

    if (itemError) throw itemError;

    res.status(201).json(newItem);

  } catch (error) {
    console.error("Error creating menu item:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category } = req.body;
    const file = req.file;

    // Start with existing item to preserve image if not provided
    const { data: currentItem, error: fetchError } = await supabase
      .from("menu_items")
      .select("image_url, category_id")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    let image_url = currentItem.image_url;

    // 1. Upload new image if provided
    if (file) {
      const fileExt = file.originalname.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `items/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("menu-images")
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
        });

      if (uploadError) throw uploadError;

      const { data: publicURLData } = supabase.storage
        .from("menu-images")
        .getPublicUrl(filePath);

      image_url = publicURLData.publicUrl;
    }

    // 2. Handle Category Change
    let categoryId = currentItem.category_id;
    if (category) {
      const { data: existingCategory } = await supabase
        .from("categories")
        .select("id")
        .eq("name", category)
        .single();

      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        const { data: newCategory, error: createCatError } = await supabase
          .from("categories")
          .insert([{ name: category, is_active: true }])
          .select()
          .single();

        if (createCatError) throw createCatError;
        categoryId = newCategory.id;
      }
    }

    // 3. Update Item
    const { data: updatedItem, error: updateError } = await supabase
      .from("menu_items")
      .update({
        name,
        description,
        price,
        category_id: categoryId,
        image_url,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json(updatedItem);

  } catch (error) {
    console.error("Error updating menu item:", error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.status(500).json({ error: error.message });
  }
};


