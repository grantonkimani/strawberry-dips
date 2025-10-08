-- Analytics function for order statistics
-- Restores the helper used by the admin analytics endpoints

CREATE OR REPLACE FUNCTION get_order_statistics(date_filter TEXT DEFAULT '')
RETURNS TABLE (
  total_orders BIGINT,
  total_revenue NUMERIC,
  pending_orders BIGINT,
  completed_orders BIGINT,
  cancelled_orders BIGINT,
  average_order_value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_orders,
    COALESCE(SUM(total), 0) as total_revenue,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
    COUNT(*) FILTER (WHERE status = 'delivered') as completed_orders,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders,
    CASE
      WHEN COUNT(*) > 0 THEN COALESCE(SUM(total), 0) / COUNT(*)
      ELSE 0
    END as average_order_value
  FROM orders
  WHERE CASE
    WHEN date_filter != '' THEN
      created_at >= (date_filter::TEXT)::TIMESTAMP
    ELSE TRUE
  END;
END;
$$ LANGUAGE plpgsql;


