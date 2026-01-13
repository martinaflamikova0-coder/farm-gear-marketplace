import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Lock } from 'lucide-react';
import logoEquiptrade from '@/assets/logo-equiptrade.png';

const schema = z
  .object({
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères').max(128, 'Mot de passe trop long'),
    confirmPassword: z.string().min(6).max(128),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

const AdminResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  const redirectToLogin = useMemo(() => `${window.location.origin}/admin/login`, []);

  useEffect(() => {
    // The recovery link sets a temporary session via URL tokens; ensure we have a session before showing the form.
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validation = schema.safeParse({ password, confirmPassword });
    if (!validation.success) {
      setError(validation.error.errors[0]?.message ?? 'Entrée invalide');
      return;
    }

    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setError('Lien invalide ou expiré. Veuillez demander un nouveau lien.');
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError('Impossible de mettre à jour le mot de passe. Veuillez réessayer.');
        return;
      }

      setSuccess('Mot de passe mis à jour. Vous pouvez vous connecter.');

      // After password change, send the user back to the login screen.
      setTimeout(() => navigate('/admin/login', { replace: true }), 800);
    } catch {
      setError('Une erreur inattendue est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logoEquiptrade} alt="EquipTrade" className="h-16 w-auto object-contain" />
          </div>
          <CardTitle className="text-2xl font-display">Définir un nouveau mot de passe</CardTitle>
          <CardDescription>
            {hasSession === false
              ? "Votre lien semble expiré. Retournez à la connexion pour en demander un nouveau."
              : 'Choisissez un nouveau mot de passe pour votre compte administrateur.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-4 border-green-500 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {hasSession === false ? (
            <Button className="w-full" onClick={() => (window.location.href = redirectToLogin)}>
              Retour à la connexion
            </Button>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminResetPassword;
