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
  try {
    const { table_number, items } = req.body;

    if (!table_number || !items || items.length === 0) {
      return res.status(400).json({ error: "Invalid order data" });
    }

    // 1. Get table UUID
    const { data: table, error: tableError } = await supabase
      .from("cafe_tables")
      .select("id")
      .eq("table_number", table_number)
      .single();

    if (tableError || !table) {
      return res.status(400).json({ error: "Invalid table number" });
    }

    // 2. Check for existing active order
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id")
      .eq("table_id", table.id)
      .neq("status", "COMPLETED")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let orderId;

    // 3. If active order exists → reuse it
    if (existingOrder) {
      orderId = existingOrder.id;
    } 
    // 4. Else → create new order
    else {
      const { data: newOrder, error: orderError } = await supabase
        .from("orders")
        .insert([{ table_id: table.id, status: "PENDING" }])
        .select()
        .single();

      if (orderError) {
        return res.status(500).json(orderError);
      }

      orderId = newOrder.id;
    }

    // 5. Insert items into order_items
    const orderItems = items.map((item) => ({
      order_id: orderId,
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      return res.status(500).json(itemsError);
    }

    res.json({ order_id: orderId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


/**
 * Get active order for a table
 */
export const getActiveOrderByTable = async (req, res) => {
  try {
    const { table_number } = req.params;

    // 1. Get table UUID
    const { data: table, error: tableError } = await supabase
      .from("cafe_tables")
      .select("id")
      .eq("table_number", table_number)
      .single();

    if (tableError || !table) {
      return res.json(null);
    }

    // 2. Get latest active order
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("table_id", table.id)
      .neq("status", "COMPLETED")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) return res.json(null);

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json(null);
  }
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
