-- Fix function search paths for security
CREATE OR REPLACE FUNCTION public.generate_claim_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_number TEXT;
  year_part TEXT;
  sequence_part INTEGER;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  SELECT COALESCE(MAX(SUBSTRING(claim_number FROM 'VAT-[0-9]{4}-([0-9]+)')::INTEGER), 0) + 1
  INTO sequence_part
  FROM public.refund_claims
  WHERE claim_number LIKE 'VAT-' || year_part || '-%';
  
  new_number := 'VAT-' || year_part || '-' || LPAD(sequence_part::TEXT, 6, '0');
  RETURN new_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_claim_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.claim_number IS NULL OR NEW.claim_number = '' THEN
    NEW.claim_number := public.generate_claim_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix overly permissive RLS policies for audit_logs
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated users can insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = performed_by OR performed_by IS NULL);

-- Fix overly permissive RLS policies for notifications  
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "Staff can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff(auth.uid()) OR auth.uid() = user_id);