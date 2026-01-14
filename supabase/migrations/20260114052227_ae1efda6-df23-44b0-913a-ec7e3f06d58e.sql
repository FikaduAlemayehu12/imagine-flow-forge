-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('taxpayer', 'officer', 'supervisor', 'risk_analyst', 'auditor', 'admin');

-- Create enum for claim status
CREATE TYPE public.claim_status AS ENUM ('draft', 'submitted', 'under_review', 'risk_assessment', 'officer_review', 'supervisor_approval', 'approved', 'rejected', 'payment_processing', 'paid');

-- Create enum for risk level
CREATE TYPE public.risk_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  tin_number TEXT, -- Taxpayer Identification Number
  business_name TEXT,
  business_category TEXT,
  business_address TEXT,
  registration_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE (user_id, role)
);

-- Create refund_claims table
CREATE TABLE public.refund_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number TEXT NOT NULL UNIQUE,
  taxpayer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vat_period TEXT NOT NULL,
  claim_amount DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'ETB',
  description TEXT,
  status claim_status NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  bank_account_number TEXT,
  bank_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create claim_documents table
CREATE TABLE public.claim_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID REFERENCES public.refund_claims(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  document_type TEXT, -- invoice, bank_statement, vat_return, etc.
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create risk_parameters table (configurable by admin)
CREATE TABLE public.risk_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parameter_name TEXT NOT NULL UNIQUE,
  parameter_code TEXT NOT NULL UNIQUE,
  description TEXT,
  weight DECIMAL(5,2) NOT NULL DEFAULT 1.0,
  threshold_low DECIMAL(10,2),
  threshold_medium DECIMAL(10,2),
  threshold_high DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  category TEXT, -- compliance, financial, behavioral, peer_comparison
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create risk_assessments table
CREATE TABLE public.risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID REFERENCES public.refund_claims(id) ON DELETE CASCADE NOT NULL,
  assessed_by UUID REFERENCES auth.users(id),
  risk_level risk_level NOT NULL,
  risk_score DECIMAL(5,2) NOT NULL,
  assessment_details JSONB, -- stores individual parameter scores
  peer_comparison_data JSONB,
  historical_analysis JSONB,
  recommendation TEXT,
  auto_assessed BOOLEAN DEFAULT true,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create workflow_states table
CREATE TABLE public.workflow_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID REFERENCES public.refund_claims(id) ON DELETE CASCADE NOT NULL,
  from_status claim_status,
  to_status claim_status NOT NULL,
  action_by UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL, -- submit, approve, reject, escalate, return
  comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
  old_values JSONB,
  new_values JSONB,
  performed_by UUID REFERENCES auth.users(id),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- info, success, warning, error
  related_claim_id UUID REFERENCES public.refund_claims(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create category_benchmarks table (for peer comparison)
CREATE TABLE public.category_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_category TEXT NOT NULL,
  avg_refund_amount DECIMAL(15,2),
  avg_claim_frequency DECIMAL(5,2),
  avg_approval_rate DECIMAL(5,2),
  avg_processing_days INTEGER,
  sample_size INTEGER,
  period_start DATE,
  period_end DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refund_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_benchmarks ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Create function to check if user is staff (officer, supervisor, risk_analyst, auditor, admin)
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('officer', 'supervisor', 'risk_analyst', 'auditor', 'admin')
  )
$$;

-- Create function to generate claim number
CREATE OR REPLACE FUNCTION public.generate_claim_number()
RETURNS TEXT
LANGUAGE plpgsql
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

-- Create trigger for auto-generating claim number
CREATE OR REPLACE FUNCTION public.set_claim_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.claim_number IS NULL OR NEW.claim_number = '' THEN
    NEW.claim_number := public.generate_claim_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_claim_number
  BEFORE INSERT ON public.refund_claims
  FOR EACH ROW
  EXECUTE FUNCTION public.set_claim_number();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_refund_claims_updated_at
  BEFORE UPDATE ON public.refund_claims
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_risk_parameters_updated_at
  BEFORE UPDATE ON public.risk_parameters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to auto-create profile and default role on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'), NEW.email);
  
  -- Default role is taxpayer
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'taxpayer');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_staff(auth.uid()));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for refund_claims
CREATE POLICY "Taxpayers can view their own claims"
  ON public.refund_claims FOR SELECT
  USING (auth.uid() = taxpayer_id);

CREATE POLICY "Taxpayers can create their own claims"
  ON public.refund_claims FOR INSERT
  WITH CHECK (auth.uid() = taxpayer_id);

CREATE POLICY "Taxpayers can update draft claims"
  ON public.refund_claims FOR UPDATE
  USING (auth.uid() = taxpayer_id AND status = 'draft');

CREATE POLICY "Staff can view all claims"
  ON public.refund_claims FOR SELECT
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update claims"
  ON public.refund_claims FOR UPDATE
  USING (public.is_staff(auth.uid()));

-- RLS Policies for claim_documents
CREATE POLICY "Users can view their claim documents"
  ON public.claim_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.refund_claims
      WHERE id = claim_id AND taxpayer_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload documents to their claims"
  ON public.claim_documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.refund_claims
      WHERE id = claim_id AND taxpayer_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all claim documents"
  ON public.claim_documents FOR SELECT
  USING (public.is_staff(auth.uid()));

-- RLS Policies for risk_parameters
CREATE POLICY "Staff can view risk parameters"
  ON public.risk_parameters FOR SELECT
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Admins can manage risk parameters"
  ON public.risk_parameters FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for risk_assessments
CREATE POLICY "Taxpayers can view their risk assessments"
  ON public.risk_assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.refund_claims
      WHERE id = claim_id AND taxpayer_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all risk assessments"
  ON public.risk_assessments FOR SELECT
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Risk analysts can create assessments"
  ON public.risk_assessments FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'risk_analyst') OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Risk analysts can update assessments"
  ON public.risk_assessments FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'risk_analyst') OR
    public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for workflow_states
CREATE POLICY "Users can view workflow for their claims"
  ON public.workflow_states FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.refund_claims
      WHERE id = claim_id AND taxpayer_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all workflow states"
  ON public.workflow_states FOR SELECT
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can create workflow states"
  ON public.workflow_states FOR INSERT
  WITH CHECK (public.is_staff(auth.uid()));

-- RLS Policies for audit_logs
CREATE POLICY "Auditors and admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    public.has_role(auth.uid(), 'auditor') OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- RLS Policies for notifications
CREATE POLICY "Users can view their notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- RLS Policies for category_benchmarks
CREATE POLICY "Staff can view benchmarks"
  ON public.category_benchmarks FOR SELECT
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Admins can manage benchmarks"
  ON public.category_benchmarks FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for claim documents
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('claim-documents', 'claim-documents', false, 10485760);

-- Storage policies for claim documents
CREATE POLICY "Users can upload to their claims folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'claim-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'claim-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Staff can view all documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'claim-documents' AND
    public.is_staff(auth.uid())
  );

-- Insert default risk parameters (39 minimum as per requirements)
INSERT INTO public.risk_parameters (parameter_name, parameter_code, description, weight, category) VALUES
('VAT Return Frequency', 'VAT_FREQ', 'Consistency of VAT return filing', 1.5, 'compliance'),
('Late Filing History', 'LATE_FILE', 'Number of late filings in past 3 years', 2.0, 'compliance'),
('Payment Compliance Rate', 'PAY_COMPLY', 'Percentage of on-time tax payments', 1.8, 'compliance'),
('Audit History Score', 'AUDIT_HIST', 'Results from previous audits', 2.5, 'compliance'),
('Penalty History', 'PENALTY_HIST', 'History of tax penalties', 2.0, 'compliance'),
('Amendment Frequency', 'AMEND_FREQ', 'Frequency of return amendments', 1.3, 'compliance'),
('Declaration Accuracy', 'DECL_ACC', 'Accuracy of past declarations', 1.8, 'compliance'),
('Document Quality Score', 'DOC_QUAL', 'Quality and completeness of submitted documents', 1.5, 'compliance'),
('Registration Age', 'REG_AGE', 'Years since business registration', 1.0, 'financial'),
('Revenue Trend', 'REV_TREND', 'Revenue growth/decline pattern', 1.5, 'financial'),
('Refund to Revenue Ratio', 'REF_REV_RATIO', 'Proportion of refunds to declared revenue', 2.5, 'financial'),
('Claim Amount Variance', 'CLAIM_VAR', 'Variance in claim amounts over time', 1.8, 'financial'),
('Bank Statement Consistency', 'BANK_CONSIST', 'Consistency between bank statements and declarations', 2.0, 'financial'),
('Supplier Verification Score', 'SUPP_VERIFY', 'Verification status of declared suppliers', 2.2, 'financial'),
('Customer Verification Score', 'CUST_VERIFY', 'Verification status of declared customers', 2.0, 'financial'),
('Transaction Pattern Score', 'TRANS_PATTERN', 'Analysis of transaction patterns', 1.8, 'financial'),
('Cash Flow Consistency', 'CASH_FLOW', 'Consistency of cash flow patterns', 1.5, 'financial'),
('Invoice Matching Rate', 'INV_MATCH', 'Rate of invoice matching with counterparties', 2.5, 'financial'),
('Claim Frequency', 'CLAIM_FREQ', 'Frequency of refund claims', 1.5, 'behavioral'),
('Seasonal Claim Pattern', 'SEASON_CLAIM', 'Alignment with expected seasonal patterns', 1.2, 'behavioral'),
('Last Minute Filing', 'LAST_MIN', 'Tendency to file near deadlines', 1.0, 'behavioral'),
('Support Request History', 'SUPPORT_HIST', 'History of support/dispute requests', 0.8, 'behavioral'),
('Response Time Score', 'RESP_TIME', 'Average response time to inquiries', 0.5, 'behavioral'),
('Data Quality Score', 'DATA_QUAL', 'Quality of submitted data', 1.5, 'behavioral'),
('Voluntary Disclosure', 'VOL_DISCL', 'History of voluntary disclosures', -1.0, 'behavioral'),
('Cooperation Score', 'COOP_SCORE', 'Level of cooperation with authorities', 0.8, 'behavioral'),
('Industry Average Comparison', 'IND_AVG', 'Comparison to industry averages', 2.0, 'peer_comparison'),
('Sector Refund Rate', 'SECT_REF', 'Refund rate compared to sector', 2.2, 'peer_comparison'),
('Size Category Benchmark', 'SIZE_BENCH', 'Performance against similar-sized businesses', 1.8, 'peer_comparison'),
('Geographic Benchmark', 'GEO_BENCH', 'Comparison to regional averages', 1.5, 'peer_comparison'),
('Growth Rate Comparison', 'GROWTH_COMP', 'Growth rate vs sector average', 1.2, 'peer_comparison'),
('Profit Margin Benchmark', 'PROFIT_BENCH', 'Profit margin vs industry standard', 1.5, 'peer_comparison'),
('Employee Count Ratio', 'EMP_RATIO', 'Revenue per employee vs benchmark', 1.0, 'peer_comparison'),
('Asset Turnover Comparison', 'ASSET_TURN', 'Asset turnover vs industry', 1.2, 'peer_comparison'),
('Credit History Score', 'CREDIT_HIST', 'Business credit history', 1.5, 'financial'),
('Related Party Transactions', 'RELATED_TRANS', 'Volume of related party transactions', 2.0, 'financial'),
('Export Documentation', 'EXPORT_DOC', 'Quality of export documentation', 1.8, 'compliance'),
('Import Duty Compliance', 'IMPORT_DUTY', 'Compliance with import duties', 1.5, 'compliance'),
('Digital Filing Adoption', 'DIGITAL_FILE', 'Use of digital filing systems', 0.5, 'behavioral');

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.refund_claims;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workflow_states;