-- Create a public storage bucket for music files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('music', 'music', true, 52428800, ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/m4a', 'audio/aac']);

-- Allow anyone to read music files (public playback)
CREATE POLICY "Public read access for music"
ON storage.objects FOR SELECT
USING (bucket_id = 'music');

-- Allow authenticated users to upload music
CREATE POLICY "Authenticated users can upload music"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'music');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own music"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'music' AND auth.uid()::text = (storage.foldername(name))[1]);