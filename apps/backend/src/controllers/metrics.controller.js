import supabase from "../config/supabase.js";

/**
 * Get aggregated metrics for admin dashboard
 * GET /api/orders/metrics
 */
export const getMetrics = async (req, res) => {
  try {
    // Get today's date range (start and end of day in IST)
    const getIstStart = () => {
      const d = new Date();
      const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
      const ist = new Date(utc + (3600000 * 5.5));
      ist.setHours(0,0,0,0);
      return new Date(ist.getTime() - (3600000 * 5.5)); // Start of day in IST as a UTC date object
    };
    
    const todayStart = getIstStart().toISOString();
    const todayEnd = new Date(getIstStart().getTime() + 24 * 60 * 60 * 1000).toISOString();

    // 1. Get all orders created today
    const { data: ordersToday, error: ordersError } = await supabase
      .from("orders")
      .select(`
        id,
        status,
        created_at,
        order_items (
          quantity,
          is_cancelled,
          menu_items ( price )
        ),
        payments ( status )
      `)
      .gte("created_at", todayStart)
      .lt("created_at", todayEnd);

    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
      return res.status(500).json({ error: "Failed to fetch metrics" });
    }

    // 2. Calculate metrics
    const metrics = {
      ordersToday: ordersToday.length,
      revenueToday: 0,
      paidOrders: 0,
      unpaidOrders: 0,
      completedToday: 0,
      cancelledToday: 0,
    };

    ordersToday.forEach((order) => {
      // Calculate order total (exclude cancelled items)
      const orderTotal = order.order_items
        .filter((item) => !item.is_cancelled)
        .reduce((sum, item) => sum + item.quantity * item.menu_items.price, 0);

      // Revenue only from completed orders
      if (order.status === "COMPLETED") {
        metrics.revenueToday += orderTotal;
        metrics.completedToday += 1;
      }

      // Count cancelled orders
      if (order.status === "CANCELLED") {
        metrics.cancelledToday += 1;
      }

      // Check payment status
      if (order.payments && order.payments.length > 0) {
        const isPaid = order.payments.some((p) => p.status === "PAID");
        if (isPaid) {
          metrics.paidOrders += 1;
        } else {
          metrics.unpaidOrders += 1;
        }
      } else {
        metrics.unpaidOrders += 1;
      }
    });

    res.json(metrics);
  } catch (err) {
    console.error("Metrics error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
