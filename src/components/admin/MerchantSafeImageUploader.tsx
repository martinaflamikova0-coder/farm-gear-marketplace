import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image as ImageIcon, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MerchantSafeImageUploaderProps {
  merchantSafeImageUrl: string | null;
  onImageChange: (url: string | null) => void;
  normalImage?: string;
}

const MerchantSafeImageUploader = ({
  merchantSafeImageUrl,
  onImageChange,
  normalImage,
}: MerchantSafeImageUploaderProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const uploadFile = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `merchant-safe-${crypto.randomUUID()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Type de fichier invalide',
        description: 'Seules les images sont acceptées',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Fichier trop volumineux',
        description: 'La taille maximale est de 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const url = await uploadFile(file);
      if (url) {
        onImageChange(url);
        toast({
          title: 'Image Merchant-safe uploadée',
          description: 'Cette image sera utilisée pour Google Merchant Center',
        });
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Erreur d'upload",
        description: error.message || "Impossible d'uploader l'image",
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async () => {
    if (merchantSafeImageUrl) {
      // Extract file path from URL
      const urlParts = merchantSafeImageUrl.split('/product-images/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('product-images').remove([filePath]);
      }
    }
    onImageChange(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm">
        <ShieldCheck className="h-4 w-4 text-success" />
        <span className="font-medium">Image Merchant-safe (Google Merchant Center)</span>
      </div>

      <Alert>
        <AlertDescription className="text-xs">
          Cette image sera utilisée pour le flux Google Merchant Center. Elle doit être une photo propre du produit, 
          <strong> sans texte, prix, badge, logo, watermark, bordure ou overlay</strong>.
        </AlertDescription>
      </Alert>

      {/* Side by side preview */}
      {normalImage && (
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Image normale</p>
            <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
              <img
                src={normalImage}
                alt="Image normale"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">
              Image Merchant-safe
              {!merchantSafeImageUrl && (
                <span className="text-destructive ml-1">(manquante)</span>
              )}
            </p>
            <div className="aspect-square rounded-lg overflow-hidden border bg-muted relative">
              {merchantSafeImageUrl ? (
                <>
                  <img
                    src={merchantSafeImageUrl}
                    alt="Image Merchant-safe"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="absolute top-2 left-2 bg-success text-success-foreground text-xs px-2 py-0.5 rounded flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    MC-safe
                  </span>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 text-warning" />
                  <span className="text-xs">Non configurée</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Zone */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-4 text-center transition-colors',
          dragActive ? 'border-success bg-success/5' : 'border-border hover:border-success/50',
          isUploading && 'pointer-events-none opacity-60'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          id="merchant-safe-upload"
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
          disabled={isUploading}
        />
        <label
          htmlFor="merchant-safe-upload"
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          ) : (
            <Upload className="h-8 w-8 text-success" />
          )}
          <div className="text-sm">
            <span className="font-medium text-success">Uploader une image Merchant-safe</span>
          </div>
          <p className="text-xs text-muted-foreground">
            PNG, JPG ou WebP (max. 5MB) - Photo propre sans overlay
          </p>
        </label>
      </div>
    </div>
  );
};

export default MerchantSafeImageUploader;
