import supabase from "../config/supabase.js";

export const getAllActiveOrders = async (req, res) => {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      status,
      created_at,
      cafe_tables ( table_number ),
      order_items (
        quantity,
        menu_items ( name )
      )
    `)
    .neq("status", "COMPLETED")
    .order("created_at", { ascending: true });

  if (error) return res.status(500).json(error);
  res.json(data);
};


/**
 * Create new order
 */
export const createOrder = async (req, res) => {
  const { table_id, items } = req.body;

  // 1. Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert([{ table_id, status: "PENDING" }])
    .select()
    .single();

  if (orderError) return res.status(400).json(orderError);

  // 2. Create order items
  const orderItems = items.map((item) => ({
    order_id: order.id,
    menu_item_id: item.menu_item_id,
    quantity: item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) return res.status(400).json(itemsError);

  res.json({ order_id: order.id });
};

/**
 * Get active order for a table
 */
export const getActiveOrderByTable = async (req, res) => {
  const { table_id } = req.params;

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("table_id", table_id)
    .neq("status", "COMPLETED")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) return res.json(null);
  res.json(data);
};

/**
 * Update order status (staff)
 */
export const updateOrderStatus = async (req, res) => {
  const { order_id } = req.params;
  const { status } = req.body;

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", order_id);

  if (error) return res.status(400).json(error);

  res.json({ success: true });
};

export const markPaymentPaid = async (req, res) => {
  const { order_id } = req.params;

  const { error } = await supabase
    .from("payments")
    .insert([
      {
        order_id,
        method: "COUNTER",
        status: "PAID",
      },
    ]);

  if (error) return res.status(500).json(error);
  res.json({ success: true });
};
