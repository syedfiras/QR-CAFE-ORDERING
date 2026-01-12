import supabase from "../config/supabase.js";

export const getAllActiveOrders = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      status,
      created_at,
      cafe_tables ( table_number ),
      order_items (
        id,
        quantity,
        is_cancelled,
        menu_items ( id, name, price )
      ),
      payments (
        status,
        method
      )
    `)
    .gte("created_at", today.toISOString())
    .order("created_at", { ascending: false });

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

    // 2. Check for existing active order (Only append to PENDING or PREPARING)
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id")
      .eq("table_id", table.id)
      .in("status", ["PENDING", "PREPARING"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

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

    // 1. Get table ID
    const { data: table } = await supabase
      .from("cafe_tables")
      .select("id")
      .eq("table_number", table_number)
      .single();

    if (!table) return res.json(null);

    // 2. Get active order
    const { data: order } = await supabase
      .from("orders")
      .select(`
        id,
        status,
        created_at,
        order_items (
          id,
          quantity,
          is_cancelled,
          menu_items (
            name,
            price
          )
        )
      `)
      .eq("table_id", table.id)
      .neq("status", "COMPLETED")
      .neq("status", "CANCELLED")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!order) return res.json(null);

    // 3. Calculate total (exclude cancelled items)
    const items = order.order_items.filter(i => !i.is_cancelled);

    const total = items.reduce(
      (sum, i) => sum + i.quantity * i.menu_items.price,
      0
    );

    res.json({
      id: order.id,
      status: order.status,
      items,
      total
    });
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

export const cancelOrderItem = async (req, res) => {
  try {
    const { item_id } = req.params;
    const { quantity } = req.body; // Optional quantity to cancel

    // 1. Get current item details
    const { data: item, error: fetchError } = await supabase
      .from("order_items")
      .select("order_id, menu_item_id, quantity, is_cancelled")
      .eq("id", item_id)
      .single();

    if (fetchError || !item) return res.status(404).json({ error: "Item not found" });

    // 2. If it's a partial cancellation
    if (quantity && quantity > 0 && quantity < item.quantity) {
      // Reduce original quantity
      const { error: updateError } = await supabase
        .from("order_items")
        .update({ quantity: item.quantity - quantity })
        .eq("id", item_id);

      if (updateError) throw updateError;

      // Insert new cancelled row for the cancelled part
      const { error: insertError } = await supabase
        .from("order_items")
        .insert([{
          order_id: item.order_id,
          menu_item_id: item.menu_item_id,
          quantity: quantity,
          is_cancelled: true
        }]);

      if (insertError) throw insertError;
    } 
    // 3. Full cancellation (as before)
    else {
      const { error } = await supabase
        .from("order_items")
        .update({ is_cancelled: true })
        .eq("id", item_id);

      if (error) throw error;
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during item cancellation" });
  }
};

export const cancelOrder = async (req, res) => {
  const { order_id } = req.params;

  const { error } = await supabase
    .from("orders")
    .update({ status: "CANCELLED" })
    .eq("id", order_id);

  if (error) return res.status(500).json(error);
  res.json({ success: true });
};

export const getOrderHistory = async (req, res) => {
  try {
    const { date } = req.query; // Expects YYYY-MM-DD
    if (!date) return res.status(400).json({ error: "Date is required" });

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        status,
        created_at,
        cafe_tables ( table_number ),
        order_items (
          id,
          quantity,
          is_cancelled,
          menu_items ( name, price )
        ),
        payments (
          status
        )
      `)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
};
