import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Search, MessageCircle, Handshake, CheckCircle } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      step: '1',
      title: 'Recherchez',
      description: 'Parcourez notre catalogue de milliers de machines agricoles et industrielles. Utilisez les filtres pour affiner votre recherche par catégorie, marque, prix ou localisation.',
    },
    {
      icon: MessageCircle,
      step: '2',
      title: 'Contactez',
      description: 'Une annonce vous intéresse ? Contactez directement le vendeur via notre formulaire sécurisé. Posez vos questions et demandez des informations complémentaires.',
    },
    {
      icon: Handshake,
      step: '3',
      title: 'Négociez',
      description: 'Échangez avec le vendeur pour convenir du prix et des modalités. Organisez une visite pour inspecter le matériel avant l\'achat.',
    },
    {
      icon: CheckCircle,
      step: '4',
      title: 'Finalisez',
      description: 'Concluez la transaction directement avec le vendeur. Nous vous accompagnons pour garantir une expérience d\'achat sereine.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="container-custom py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="font-display text-4xl font-bold text-foreground mb-4">
                Comment ça marche ?
              </h1>
              <p className="text-lg text-muted-foreground">
                Acheter ou vendre du matériel agricole n'a jamais été aussi simple
              </p>
            </div>

            <div className="space-y-6">
              {steps.map((item, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex gap-6 items-start">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <span className="text-2xl font-bold">{item.step}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <item.icon className="h-5 w-5 text-primary" />
                          <h3 className="font-display text-xl font-semibold text-foreground">
                            {item.title}
                          </h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-12 bg-secondary">
              <CardContent className="p-8 text-center">
                <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                  Vous êtes vendeur ?
                </h3>
                <p className="text-muted-foreground mb-4">
                  Publiez gratuitement vos annonces et touchez des milliers d'acheteurs potentiels. 
                  Notre équipe vérifie chaque annonce pour garantir la qualité de notre plateforme.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;
