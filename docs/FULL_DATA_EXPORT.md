# Guide d'export complet des données pour remix

Ce guide explique comment exporter TOUTES les données du projet actuel pour les importer dans un remix.

## ⚠️ Important

Le remix de Lovable copie le code mais **PAS** la base de données. Vous devez exporter les données manuellement.

## Étape 1 : Exporter les produits (le plus important)

Les produits contiennent les traductions et toutes les informations des annonces.

### Via l'interface Cloud :
1. Ouvrez le Backend (Cloud → Database → Tables)
2. Sélectionnez la table `products`
3. Cliquez sur le bouton d'export (icône téléchargement)
4. Téléchargez le fichier CSV

### Garder ce fichier précieusement !

## Étape 2 : Utiliser le script SQL d'import

Après le remix, exécutez le script `docs/IMPORT_SCRIPT.sql` qui contient :
- Categories
- Brands  
- Shipping zones
- Testimonials
- Bank accounts
- PayPal settings
- Merchant center settings
- Promotions

## Étape 3 : Importer les produits

Dans le nouveau projet :
1. Ouvrez Cloud → Database → Tables → `products`
2. Cliquez sur le bouton d'import
3. Uploadez le fichier CSV exporté à l'étape 1

## Étape 4 : Images

**Bonne nouvelle :** Les URLs des images stockées dans le bucket `product-images` de l'ancien projet continueront de fonctionner ! 

Les images sont référencées par URL absolue dans la base de données, donc elles resteront accessibles tant que l'ancien projet existe.

**Option alternative :** Si vous supprimez l'ancien projet, vous devrez re-uploader les images via l'admin.

## Étape 5 : Recréer les comptes admin

Les comptes utilisateurs ne sont pas exportables. Après le remix :

1. Déployez le projet remix
2. Appelez la Edge Function `create-admin-user` avec les informations d'admin :

```bash
curl -X POST "https://[NOUVEAU_PROJECT_ID].supabase.co/functions/v1/create-admin-user" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "VotreMotDePasse"}'
```

Ou utilisez l'outil de test d'Edge Functions dans Lovable.

## Récapitulatif

| Donnée | Méthode d'export | Méthode d'import |
|--------|------------------|------------------|
| Produits | Export CSV via Cloud | Import CSV via Cloud |
| Catégories | Script SQL | Exécuter IMPORT_SCRIPT.sql |
| Marques | Script SQL | Exécuter IMPORT_SCRIPT.sql |
| Zones livraison | Script SQL | Exécuter IMPORT_SCRIPT.sql |
| Témoignages | Script SQL | Exécuter IMPORT_SCRIPT.sql |
| Comptes bancaires | Script SQL | Exécuter IMPORT_SCRIPT.sql |
| Settings | Script SQL | Exécuter IMPORT_SCRIPT.sql |
| Images | Restent accessibles via URL | Aucune action |
| Admins | Non exportable | Recréer via Edge Function |

## Alternative : Collaboration sans remix

Si vous souhaitez simplement ajouter des collaborateurs sans dupliquer le projet :
1. Allez dans Settings → People
2. Invitez les membres de votre équipe par email
3. Ils auront accès au même projet, même base de données, mêmes images
