import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Cookies = () => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  const handleSave = () => {
    toast({
      title: 'Préférences enregistrées',
      description: 'Vos préférences de cookies ont été mises à jour.',
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="container-custom py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-display text-4xl font-bold text-foreground mb-8">
              Politique de Cookies
            </h1>

            <div className="prose prose-lg mb-12">
              <p className="text-muted-foreground leading-relaxed">
                Notre site utilise des cookies pour améliorer votre expérience de navigation. 
                Cette page vous explique ce que sont les cookies, comment nous les utilisons 
                et comment gérer vos préférences.
              </p>

              <h2 className="font-display text-2xl font-semibold text-foreground mt-8">Qu'est-ce qu'un cookie ?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Un cookie est un petit fichier texte stocké sur votre appareil lorsque vous 
                visitez un site web. Les cookies nous permettent de reconnaître votre navigateur 
                et de mémoriser vos préférences.
              </p>

              <h2 className="font-display text-2xl font-semibold text-foreground mt-8">Types de cookies utilisés</h2>
            </div>

            <div className="space-y-4 mb-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display">Cookies nécessaires</CardTitle>
                    <Switch checked={preferences.necessary} disabled />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Ces cookies sont essentiels au fonctionnement du site. Ils permettent 
                    la navigation et l'accès aux fonctionnalités de base. Ils ne peuvent pas être désactivés.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display">Cookies analytiques</CardTitle>
                    <Switch 
                      checked={preferences.analytics} 
                      onCheckedChange={(checked) => setPreferences({ ...preferences, analytics: checked })}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Ces cookies nous aident à comprendre comment les visiteurs utilisent notre site. 
                    Ils nous permettent d'améliorer notre plateforme et votre expérience utilisateur.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display">Cookies marketing</CardTitle>
                    <Switch 
                      checked={preferences.marketing} 
                      onCheckedChange={(checked) => setPreferences({ ...preferences, marketing: checked })}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Ces cookies sont utilisés pour vous proposer des publicités pertinentes. 
                    Ils permettent également de mesurer l'efficacité de nos campagnes publicitaires.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Button onClick={handleSave} className="mb-12">
              Enregistrer mes préférences
            </Button>

            <div className="prose prose-lg">
              <h2 className="font-display text-2xl font-semibold text-foreground">Gérer les cookies dans votre navigateur</h2>
              <p className="text-muted-foreground leading-relaxed">
                Vous pouvez également gérer les cookies directement depuis les paramètres de votre navigateur. 
                Consultez l'aide de votre navigateur pour savoir comment supprimer ou bloquer les cookies.
              </p>

              <h2 className="font-display text-2xl font-semibold text-foreground mt-8">Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                Pour toute question concernant notre utilisation des cookies, contactez-nous à : 
                <a href="mailto:privacy@equiptrade.com" className="text-primary hover:underline ml-1">
                  privacy@equiptrade.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cookies;
