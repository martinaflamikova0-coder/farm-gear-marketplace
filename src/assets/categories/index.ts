import tracteurs from './tracteurs.jpg';
import recolte from './recolte.jpg';
import travailSol from './travail-sol.jpg';
import manutention from './manutention.jpg';
import chantier from './chantier.jpg';
import pieces from './pieces.jpg';
import melangeuses from './melangeuses.jpg';
import distributeurs from './distributeurs.jpg';
import traite from './traite.jpg';
import clotures from './clotures.jpg';
import autres from './autres.jpg';

const categoryImages: Record<string, string> = {
  tracteurs,
  recolte,
  'travail-sol': travailSol,
  manutention,
  chantier,
  pieces,
  melangeuses,
  distributeurs,
  traite,
  clotures,
  autres,
};

export default categoryImages;
