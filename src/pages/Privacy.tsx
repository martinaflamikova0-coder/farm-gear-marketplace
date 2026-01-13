import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="container-custom py-12">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <h1 className="font-display text-4xl font-bold text-foreground mb-8">
              Politique de Confidentialité
            </h1>
            
            <p className="text-muted-foreground">Dernière mise à jour : Janvier 2026</p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">1. Collecte des données</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous collectons les données que vous nous fournissez lors de la création de votre compte 
              (nom, email, téléphone) ainsi que les données relatives à vos annonces et à votre 
              utilisation de la plateforme.
            </p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">2. Utilisation des données</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vos données sont utilisées pour :
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li>Gérer votre compte et vos annonces</li>
              <li>Permettre la mise en relation entre acheteurs et vendeurs</li>
              <li>Améliorer nos services</li>
              <li>Vous envoyer des communications relatives à votre compte</li>
            </ul>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">3. Partage des données</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vos coordonnées de contact (téléphone, email) ne sont visibles que par les utilisateurs 
              qui souhaitent vous contacter via une annonce. Nous ne vendons jamais vos données à des tiers.
            </p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">4. Sécurité</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos 
              données contre tout accès non autorisé, modification ou destruction.
            </p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">5. Vos droits</h2>
            <p className="text-muted-foreground leading-relaxed">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li>Droit d'accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l'effacement</li>
              <li>Droit à la portabilité</li>
              <li>Droit d'opposition</li>
            </ul>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">6. Conservation</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vos données sont conservées pendant la durée de votre inscription et jusqu'à 3 ans 
              après la suppression de votre compte, conformément à nos obligations légales.
            </p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">7. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pour exercer vos droits ou pour toute question, contactez notre DPO à : 
              <a href="mailto:privacy@equiptrade.com" className="text-primary hover:underline ml-1">
                privacy@equiptrade.com
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
