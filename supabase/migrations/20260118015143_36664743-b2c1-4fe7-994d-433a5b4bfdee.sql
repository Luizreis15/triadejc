-- Create storage bucket for PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdfs', 'pdfs', true);

-- Allow authenticated users to view/download PDFs
CREATE POLICY "Authenticated users can view pdfs" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'pdfs');

-- Allow admins to upload PDFs
CREATE POLICY "Admins can upload pdfs" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'pdfs' AND 
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow admins to delete PDFs
CREATE POLICY "Admins can delete pdfs" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'pdfs' AND 
  public.has_role(auth.uid(), 'admin'::public.app_role)
);