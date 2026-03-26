-- Secure user_roles: add explicit restrictive INSERT policy for non-admin authenticated users
CREATE POLICY "Non-admins cannot insert roles" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));