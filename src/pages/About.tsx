import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Truck, Award } from 'lucide-react';

const About = () => {
  const { t } = useTranslation();

  const values = [
    {
      icon: Shield,
      title: 'Confiance',
      description: 'Tous nos vendeurs sont vérifiés et chaque annonce est contrôlée pour garantir votre sécurité.',
    },
    {
      icon: Users,
      title: 'Communauté',
      description: 'Plus de 5 000 professionnels du secteur agricole nous font confiance chaque jour.',
    },
    {
      icon: Truck,
      title: 'Service',
      description: 'Un accompagnement personnalisé pour faciliter vos transactions de A à Z.',
    },
    {
      icon: Award,
      title: 'Qualité',
      description: 'Une sélection rigoureuse de matériel pour répondre aux exigences des professionnels.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="container-custom py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-display text-4xl font-bold text-foreground mb-6">
              À propos d'EquipTrade
            </h1>
            
            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-lg text-muted-foreground leading-relaxed">
                EquipTrade est la marketplace de référence pour l'achat et la vente de matériel agricole 
                et industriel d'occasion en France et en Europe. Depuis notre création, nous connectons 
                des milliers de professionnels pour faciliter leurs transactions.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed mt-4">
                Notre mission est simple : offrir une plateforme fiable, transparente et efficace 
                pour permettre aux agriculteurs, concessionnaires et entreprises de trouver le matériel 
                dont ils ont besoin au meilleur prix.
              </p>
            </div>

            <h2 className="font-display text-2xl font-bold text-foreground mb-6">
              Nos valeurs
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-6 mb-12">
              {values.map((value, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <value.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="font-display">{value.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-8 text-center">
                <h3 className="font-display text-2xl font-bold mb-4">
                  Rejoignez notre communauté
                </h3>
                <p className="text-primary-foreground/80 mb-6">
                  Plus de 1 000 annonces publiées chaque mois par des professionnels vérifiés.
                </p>
                <div className="flex justify-center gap-8 text-center">
                  <div>
                    <div className="text-3xl font-bold">5 000+</div>
                    <div className="text-sm text-primary-foreground/70">Utilisateurs</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">10 000+</div>
                    <div className="text-sm text-primary-foreground/70">Annonces</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">95%</div>
                    <div className="text-sm text-primary-foreground/70">Satisfaction</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
