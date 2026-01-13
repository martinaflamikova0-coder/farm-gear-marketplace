import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQ = () => {
  const faqs = [
    {
      question: 'Comment publier une annonce ?',
      answer: 'Pour publier une annonce, vous devez d\'abord créer un compte vendeur. Une fois connecté, cliquez sur "Déposer une annonce" et remplissez le formulaire avec les informations de votre matériel. Ajoutez des photos de qualité pour augmenter vos chances de vente.',
    },
    {
      question: 'La publication d\'annonces est-elle gratuite ?',
      answer: 'Oui, la publication d\'annonces basiques est entièrement gratuite. Nous proposons également des options premium pour mettre en avant vos annonces et toucher plus d\'acheteurs potentiels.',
    },
    {
      question: 'Comment contacter un vendeur ?',
      answer: 'Chaque annonce dispose d\'un formulaire de contact. Remplissez vos coordonnées et votre message, et le vendeur recevra directement votre demande par email. Vous pouvez également appeler directement si le numéro est affiché.',
    },
    {
      question: 'Les vendeurs sont-ils vérifiés ?',
      answer: 'Nous vérifions l\'identité de tous les vendeurs professionnels. Les annonces sont également contrôlées avant publication pour garantir leur conformité à nos conditions d\'utilisation.',
    },
    {
      question: 'Comment fonctionne la garantie ?',
      answer: 'La garantie dépend du vendeur et du type de matériel. Les vendeurs professionnels sont tenus de respecter les obligations légales en matière de garantie. Nous vous conseillons de toujours demander les détails de la garantie avant l\'achat.',
    },
    {
      question: 'Puis-je faire livrer le matériel ?',
      answer: 'La livraison est à organiser directement avec le vendeur. Certains vendeurs proposent des services de transport, d\'autres préfèrent une remise en main propre. N\'hésitez pas à discuter des modalités lors de vos échanges.',
    },
    {
      question: 'Comment signaler une annonce frauduleuse ?',
      answer: 'Si vous suspectez une fraude, utilisez le bouton "Signaler" présent sur chaque annonce ou contactez notre service client. Nous traitons chaque signalement avec la plus grande attention.',
    },
    {
      question: 'Quels modes de paiement sont acceptés ?',
      answer: 'Le paiement s\'effectue directement entre l\'acheteur et le vendeur. Nous recommandons d\'utiliser des moyens de paiement sécurisés et traçables. Méfiez-vous des demandes de paiement inhabituelles.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="container-custom py-12">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="font-display text-4xl font-bold text-foreground mb-4">
                Questions fréquentes
              </h1>
              <p className="text-lg text-muted-foreground">
                Trouvez rapidement les réponses à vos questions
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-12 text-center p-8 bg-secondary rounded-lg">
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Vous n'avez pas trouvé votre réponse ?
              </h3>
              <p className="text-muted-foreground">
                Contactez notre équipe support à{' '}
                <a href="mailto:support@equiptrade.com" className="text-primary hover:underline">
                  support@equiptrade.com
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

export default FAQ;
