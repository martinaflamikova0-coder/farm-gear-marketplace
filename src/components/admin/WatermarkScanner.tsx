import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Scan, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  ExternalLink,
  Image as ImageIcon 
} from 'lucide-react';

interface WatermarkResult {
  productId: string;
  productTitle: string;
  referenceNumber: number;
  hasWatermark: boolean;
  detectedBrands: string[];
  affectedImages: string[];
  confidence: number;
}

interface ScanResponse {
  results: WatermarkResult[];
  scannedCount: number;
  issuesFound: number;
  error?: string;
}

export const WatermarkScanner = () => {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<WatermarkResult[]>([]);
  const [scanStats, setScanStats] = useState<{ scanned: number; issues: number } | null>(null);
  const [hasScanned, setHasScanned] = useState(false);

  const runScan = async (limit: number = 50) => {
    setIsScanning(true);
    setScanResults([]);
    setScanStats(null);

    try {
      const { data, error } = await supabase.functions.invoke<ScanResponse>('detect-watermarks', {
        body: { limit, scanAll: false },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setScanResults(data?.results || []);
      setScanStats({
        scanned: data?.scannedCount || 0,
        issues: data?.issuesFound || 0,
      });
      setHasScanned(true);

      toast({
        title: 'Scan terminé',
        description: `${data?.scannedCount} produits analysés, ${data?.issuesFound} problèmes détectés`,
        variant: data?.issuesFound && data.issuesFound > 0 ? 'destructive' : 'default',
      });
    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: 'Erreur de scan',
        description: error instanceof Error ? error.message : 'Impossible de scanner les images',
        variant: 'destructive',
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5 text-primary" />
          Détection de watermarks
        </CardTitle>
        <CardDescription>
          Analyse IA des images pour détecter les watermarks et logos tiers (AGRIEURO, etc.)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => runScan(50)}
            disabled={isScanning}
            className="gap-2"
          >
            {isScanning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Scan className="h-4 w-4" />
            )}
            Scanner 50 produits
          </Button>
          <Button
            variant="outline"
            onClick={() => runScan(200)}
            disabled={isScanning}
            className="gap-2"
          >
            {isScanning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Scan className="h-4 w-4" />
            )}
            Scanner tous (200)
          </Button>
        </div>

        {isScanning && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Analyse en cours... Cela peut prendre quelques minutes.
            </p>
            <Progress value={undefined} className="w-full" />
          </div>
        )}

        {hasScanned && scanStats && !isScanning && (
          <Alert variant={scanStats.issues > 0 ? 'destructive' : 'default'}>
            {scanStats.issues > 0 ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <AlertTitle>Résultats du scan</AlertTitle>
            <AlertDescription>
              {scanStats.issues > 0 ? (
                <>
                  <strong>{scanStats.issues}</strong> produits avec watermarks détectés sur{' '}
                  <strong>{scanStats.scanned}</strong> analysés.
                </>
              ) : (
                <>
                  Aucun watermark détecté sur les <strong>{scanStats.scanned}</strong> produits
                  analysés.
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        {scanResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Produits avec watermarks détectés :</h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {scanResults.map((result) => (
                <div
                  key={result.productId}
                  className="flex items-start gap-3 p-3 bg-destructive/5 border border-destructive/20 rounded-lg"
                >
                  <ImageIcon className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">
                        {result.productTitle}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        REF{result.referenceNumber.toString().padStart(5, '0')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {result.detectedBrands.map((brand, idx) => (
                        <Badge key={idx} variant="destructive" className="text-xs">
                          {brand}
                        </Badge>
                      ))}
                      <span className="text-xs text-muted-foreground">
                        Confiance: {Math.round(result.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  <a
                    href={`/admin/products/${result.productId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
