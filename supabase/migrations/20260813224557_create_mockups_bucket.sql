-- Create storage bucket for AI-generated mockups (used by generate-mockup edge function)
INSERT INTO storage.buckets (id, name, public)
VALUES ('mockups', 'mockups', true)
ON CONFLICT (id) DO NOTHING;

-- Public can view mockups (bucket is public, images are served directly in the UI)
CREATE POLICY "Public can view mockups" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'mockups');

-- Only the service role (edge function) writes to this bucket; block direct client writes
CREATE POLICY "Admins can upload mockups" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'mockups' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can delete mockups" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'mockups' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);
