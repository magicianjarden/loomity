-- Create the marketplace bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('marketplace', 'marketplace', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files to the marketplace bucket
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'marketplace' AND
  (storage.foldername(name))[1] = 'marketplace'
);

-- Allow authenticated users to read files from the marketplace bucket
CREATE POLICY "Allow authenticated users to read files"
ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'marketplace');

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow users to delete their own files"
ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'marketplace' AND
  auth.uid()::text = (storage.foldername(name))[3]
);
