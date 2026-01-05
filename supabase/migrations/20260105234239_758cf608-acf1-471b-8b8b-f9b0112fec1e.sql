-- Create storage bucket for mockups
INSERT INTO storage.buckets (id, name, public)
VALUES ('mockups', 'mockups', true);

-- Allow public read access to mockups
CREATE POLICY "Public can view mockups"
ON storage.objects
FOR SELECT
USING (bucket_id = 'mockups');

-- Allow authenticated users (admins) to upload mockups
CREATE POLICY "Authenticated users can upload mockups"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'mockups' AND auth.role() = 'authenticated');

-- Allow authenticated users to update mockups
CREATE POLICY "Authenticated users can update mockups"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'mockups' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete mockups
CREATE POLICY "Authenticated users can delete mockups"
ON storage.objects
FOR DELETE
USING (bucket_id = 'mockups' AND auth.role() = 'authenticated');