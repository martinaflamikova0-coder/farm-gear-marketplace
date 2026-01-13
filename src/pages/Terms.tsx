import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="container-custom py-12">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <h1 className="font-display text-4xl font-bold text-foreground mb-8">
              Conditions Générales d'Utilisation
            </h1>
            
            <p className="text-muted-foreground">Dernière mise à jour : Janvier 2026</p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">1. Objet</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les 
              modalités et conditions d'utilisation de la plateforme EquipTrade, ainsi que les droits 
              et obligations des utilisateurs.
            </p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">2. Accès à la plateforme</h2>
            <p className="text-muted-foreground leading-relaxed">
              L'accès à la plateforme est gratuit pour les acheteurs. La publication d'annonces 
              nécessite la création d'un compte vendeur. L'utilisateur s'engage à fournir des 
              informations exactes et à les maintenir à jour.
            </p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">3. Annonces</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les vendeurs s'engagent à publier des annonces exactes et non trompeuses. Les photos 
              doivent représenter fidèlement le matériel proposé. Toute annonce frauduleuse sera 
              supprimée et pourra entraîner la suspension du compte.
            </p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">4. Responsabilités</h2>
            <p className="text-muted-foreground leading-relaxed">
              EquipTrade agit en qualité d'intermédiaire et ne peut être tenu responsable des 
              transactions effectuées entre utilisateurs. Chaque utilisateur est responsable de 
              vérifier les informations des annonces et la qualité du matériel.
            </p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">5. Propriété intellectuelle</h2>
            <p className="text-muted-foreground leading-relaxed">
              L'ensemble des éléments de la plateforme (logos, textes, images) sont protégés par 
              le droit de la propriété intellectuelle. Toute reproduction sans autorisation est interdite.
            </p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">6. Modification des CGU</h2>
            <p className="text-muted-foreground leading-relaxed">
              EquipTrade se réserve le droit de modifier les présentes CGU à tout moment. Les 
              utilisateurs seront informés de toute modification substantielle.
            </p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">7. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pour toute question relative aux présentes CGU, vous pouvez nous contacter à l'adresse : 
              <a href="mailto:legal@equiptrade.com" className="text-primary hover:underline ml-1">
                legal@equiptrade.com
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
