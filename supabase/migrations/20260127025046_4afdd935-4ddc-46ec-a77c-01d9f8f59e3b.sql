-- Expand allowed order statuses to include the workflow statuses used by the app
-- (Fixes: new row for relation "orders" violates check constraint "orders_status_check")

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (
    status = ANY (
      ARRAY[
        'pending'::text,
        'payment_uploaded'::text,
        'confirmed'::text,
        'paid'::text,
        'shipped'::text,
        'delivered'::text,
        'cancelled'::text
      ]
    )
  );
