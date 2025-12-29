import { useState, useRef } from 'react';
import { Upload, Music, X, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Track } from '@/data/sampleTracks';

interface MusicUploadProps {
  onTrackAdded: (track: Track) => void;
}

export const MusicUpload = ({ onTrackAdded }: MusicUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill title from filename
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      if (!title) setTitle(nameWithoutExt);
    }
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setCoverPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title || !artist) {
      toast.error('Please fill in title, artist, and select a file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const timestamp = Date.now();
      const audioFileName = `${timestamp}-${selectedFile.name}`;
      
      // Upload audio file
      setUploadProgress(20);
      const { data: audioData, error: audioError } = await supabase.storage
        .from('music')
        .upload(audioFileName, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (audioError) throw audioError;
      setUploadProgress(60);

      // Get public URL for audio
      const { data: audioUrlData } = supabase.storage
        .from('music')
        .getPublicUrl(audioFileName);

      let coverUrl = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop';

      // Upload cover if provided
      if (coverFile) {
        const coverFileName = `covers/${timestamp}-${coverFile.name}`;
        const { error: coverError } = await supabase.storage
          .from('music')
          .upload(coverFileName, coverFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (!coverError) {
          const { data: coverUrlData } = supabase.storage
            .from('music')
            .getPublicUrl(coverFileName);
          coverUrl = coverUrlData.publicUrl;
        }
      }

      setUploadProgress(90);

      // Create track object
      const newTrack: Track = {
        id: `uploaded-${timestamp}`,
        title,
        artist,
        album: album || 'Unknown Album',
        duration: 0, // Will be updated when audio loads
        coverUrl,
        audioUrl: audioUrlData.publicUrl,
      };

      onTrackAdded(newTrack);
      setUploadProgress(100);
      
      toast.success(`"${title}" uploaded successfully!`);
      
      // Reset form
      setTitle('');
      setArtist('');
      setAlbum('');
      setSelectedFile(null);
      setCoverFile(null);
      setCoverPreview(null);
      if (audioInputRef.current) audioInputRef.current.value = '';
      if (coverInputRef.current) coverInputRef.current.value = '';
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (audioInputRef.current) audioInputRef.current.value = '';
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Upload className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Upload Music</h3>
          <p className="text-sm text-muted-foreground">Add your own tracks</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Audio File Selection */}
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">Audio File</Label>
          {selectedFile ? (
            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/30">
              <Music className="w-5 h-5 text-primary" />
              <span className="flex-1 text-sm truncate">{selectedFile.name}</span>
              <Button variant="ghost" size="icon" onClick={clearFile} className="h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => audioInputRef.current?.click()}
              className="w-full p-6 border-2 border-dashed border-border/50 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center gap-2"
            >
              <Music className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to select audio file</span>
              <span className="text-xs text-muted-foreground/60">MP3, WAV, OGG, FLAC (max 50MB)</span>
            </button>
          )}
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Cover Image */}
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">Cover Image (optional)</Label>
          <div className="flex gap-3">
            {coverPreview ? (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                <button
                  onClick={() => {
                    setCoverFile(null);
                    setCoverPreview(null);
                    if (coverInputRef.current) coverInputRef.current.value = '';
                  }}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => coverInputRef.current?.click()}
                className="w-20 h-20 border-2 border-dashed border-border/50 rounded-lg hover:border-primary/50 transition-all flex items-center justify-center"
              >
                <Upload className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Track Details */}
        <div className="grid gap-3">
          <div>
            <Label className="text-sm text-muted-foreground mb-1 block">Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Track title"
              className="bg-background/50"
            />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground mb-1 block">Artist *</Label>
            <Input
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Artist name"
              className="bg-background/50"
            />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground mb-1 block">Album</Label>
            <Input
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              placeholder="Album name (optional)"
              className="bg-background/50"
            />
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="h-2 bg-background rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={isUploading || !selectedFile || !title || !artist}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Upload Track
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
