import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { categories } from '@/data/products';

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground mt-16">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-2xl">
                🚜
              </div>
              <span className="font-display text-xl font-bold">AgriOccaz</span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Votre marketplace de référence pour l'achat et la vente de matériel agricole d'occasion. Des milliers d'annonces vérifiées par nos experts.
            </p>
            <div className="space-y-2 text-sm">
              <a href="tel:+33123456789" className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                <Phone className="h-4 w-4" />
                01 23 45 67 89
              </a>
              <a href="mailto:contact@agrioccaz.fr" className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                <Mail className="h-4 w-4" />
                contact@agrioccaz.fr
              </a>
              <div className="flex items-center gap-2 text-primary-foreground/70">
                <MapPin className="h-4 w-4" />
                Paris, France
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Catégories</h3>
            <ul className="space-y-2">
              {categories.slice(0, 6).map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/annonces?category=${category.slug}`}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/annonces"
                  className="text-sm text-accent hover:text-accent/80 transition-colors font-medium"
                >
                  Voir toutes les catégories →
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/annonces" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Toutes les annonces
                </Link>
              </li>
              <li>
                <Link to="/deposer-annonce" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Déposer une annonce
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/a-propos" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  À propos
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Informations légales</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/mentions-legales" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link to="/cgv" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Conditions générales de vente
                </Link>
              </li>
              <li>
                <Link to="/confidentialite" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Gestion des cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/60">
            © 2024 AgriOccaz. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-primary-foreground/40">
              Propulsé par la passion de l'agriculture
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
