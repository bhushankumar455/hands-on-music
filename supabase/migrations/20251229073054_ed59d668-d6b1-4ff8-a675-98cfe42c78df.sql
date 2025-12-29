-- Drop existing upload policy that requires auth
DROP POLICY IF EXISTS "Authenticated users can upload music" ON storage.objects;

-- Allow anyone to upload music (anonymous uploads)
CREATE POLICY "Anyone can upload music"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'music');