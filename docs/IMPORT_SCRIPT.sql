-- ============================================================
-- SCRIPT D'IMPORT COMPLET POUR NOUVEAU PROJET EKIPTRADE
-- Généré le 31 janvier 2026
-- ============================================================
-- INSTRUCTIONS:
-- 1. Remixez le projet dans Lovable
-- 2. Attendez que les migrations soient appliquées
-- 3. Allez dans Cloud → Database → Run SQL
-- 4. Exécutez ce script section par section
-- ============================================================

-- ============================================================
-- SECTION 1: CATEGORIES (Exécuter EN PREMIER)
-- ============================================================

-- 1.1 Catégories parentes (sans parent_id)
INSERT INTO categories (id, name, slug, icon, description, parent_id, sort_order, created_at, updated_at) VALUES
('0ff03b42-b948-4ac6-b851-5e1699bd746f', 'Tracteurs', 'tracteurs', '🚜', 'Tracteurs agricoles, vignerons, forestiers et micro-tracteurs', NULL, 1, now(), now()),
('bd248966-f700-43fb-a98f-c11064baa0b9', 'Matériel de récolte', 'recolte', '🌾', 'Moissonneuses-batteuses, ensileuses, presses à balles et faucheuses', NULL, 2, now(), now()),
('d49342c8-ad0b-472f-8062-2cb7624e8fad', 'Travail du sol', 'travail-sol', '⚙️', 'Charrues, cultivateurs, herses et semoirs', NULL, 3, now(), now()),
('7d7618d3-4bc6-4b86-81f2-54a85115d643', 'Manutention', 'manutention', '🏗️', 'Chargeurs télescopiques, chariots élévateurs, remorques', NULL, 4, now(), now()),
('8610c676-bc12-4b83-87e4-65278d938a15', 'Matériel de chantier', 'chantier', '🔧', 'Pelles, mini-pelles, compacteurs', NULL, 5, now(), now()),
('2f897b5a-6929-4a36-83d7-51ab47c308a9', 'Pièces et accessoires', 'pieces', '🔩', 'Pneumatiques, hydraulique, électrique', NULL, 6, now(), now()),
('fb968f7c-84b5-4824-ab32-27893f098738', 'Autres matériels', 'autres', '📦', 'Pulvérisateurs, épandeurs, irrigation', NULL, 7, now(), now()),
('d2d4c69a-4a86-4bc1-8a0c-014b1d8e0df2', 'Fenaison', 'fenaison', '🌿', NULL, NULL, 8, now(), now()),
('e2093037-8a33-44ea-b115-ae2d4f1f9969', 'Remorques', 'remorques', '🚛', NULL, NULL, 9, now(), now()),
('648c2baa-9923-45a4-a154-5c09c0a72b76', 'Mélangeuses', 'melangeuses', '🥣', NULL, NULL, 10, now(), now()),
('dfe04943-212a-4563-a049-68e562ed033f', 'Distributeurs', 'distributeurs', '📦', NULL, NULL, 11, now(), now()),
('6a25cbc9-ce71-4a23-a330-d6cf11bf5da7', 'Tondeuses', 'tondeuse', '🌱', NULL, NULL, 12, now(), now()),
('b088c477-0404-4ab1-a327-6935b6803500', 'Clôtures', 'clotures', '🚧', NULL, NULL, 13, now(), now()),
('a0d85d0a-4bc3-4142-bc23-9a03549df970', 'Matériel de traite', 'traite', '🥛', NULL, NULL, 14, now(), now())
ON CONFLICT (id) DO NOTHING;

-- 1.2 Sous-catégories
INSERT INTO categories (id, name, slug, icon, description, parent_id, sort_order, created_at, updated_at) VALUES
('40c2933f-910f-4db5-903b-16bc720578ba', 'Tracteurs agricoles', 'tracteurs-agricoles', '🚜', NULL, '0ff03b42-b948-4ac6-b851-5e1699bd746f', 1, now(), now()),
('f82a6b5d-4a24-4132-a406-f70743a0c47a', 'Tracteurs vignerons', 'tracteurs-vignerons', '🍇', NULL, '0ff03b42-b948-4ac6-b851-5e1699bd746f', 2, now(), now()),
('412ec3bc-3b06-4838-84de-2940dc25a9b1', 'Tracteurs forestiers', 'tracteurs-forestiers', '🌲', NULL, '0ff03b42-b948-4ac6-b851-5e1699bd746f', 3, now(), now()),
('128f463f-db13-40b9-a01a-46fb1d19227a', 'Micro-tracteurs', 'micro-tracteurs', '🚜', NULL, '0ff03b42-b948-4ac6-b851-5e1699bd746f', 4, now(), now()),
('36021292-5466-406f-9004-ffc0e27de492', 'Moissonneuses-batteuses', 'moissonneuses-batteuses', '🌾', NULL, 'bd248966-f700-43fb-a98f-c11064baa0b9', 1, now(), now()),
('e3064098-8188-49f6-b700-4b62736a5b38', 'Ensileuses', 'ensileuses', '🌽', NULL, 'bd248966-f700-43fb-a98f-c11064baa0b9', 2, now(), now()),
('15fda63b-5cab-4897-968e-43683a019fa9', 'Presses à balles', 'presses-balles', '🎯', NULL, 'bd248966-f700-43fb-a98f-c11064baa0b9', 3, now(), now()),
('dc42d713-1688-4bf4-99bf-78afdd3b779a', 'Charrues', 'charrues', '⚙️', NULL, 'd49342c8-ad0b-472f-8062-2cb7624e8fad', 1, now(), now()),
('2caaa088-c4f2-4db4-8e46-a6de45b62326', 'Cultivateurs', 'cultivateurs', '🔧', NULL, 'd49342c8-ad0b-472f-8062-2cb7624e8fad', 2, now(), now()),
('002d2940-748c-4308-b9ad-427192c365d7', 'Herses', 'herses', '⚙️', NULL, 'd49342c8-ad0b-472f-8062-2cb7624e8fad', 3, now(), now()),
('b5a4aa25-30d7-4d9e-b461-8deacda1ab33', 'Chargeurs télescopiques', 'chargeurs-telescopiques', '🏗️', NULL, '7d7618d3-4bc6-4b86-81f2-54a85115d643', 1, now(), now()),
('b00d140f-86ef-4bbe-8dbc-f36db84e940c', 'Chariots élévateurs', 'chariots-elevateurs', '📦', NULL, '7d7618d3-4bc6-4b86-81f2-54a85115d643', 2, now(), now()),
('7bd00104-cf98-4dc5-8118-46bc5843ffed', 'Pelles', 'pelles', '🔧', NULL, '8610c676-bc12-4b83-87e4-65278d938a15', 1, now(), now()),
('5992e809-e430-4c7c-b793-b250e20dca70', 'Mini-pelles', 'mini-pelles', '🔧', NULL, '8610c676-bc12-4b83-87e4-65278d938a15', 2, now(), now()),
('6489accd-ff12-4cdf-9c63-fe0484241a5b', 'Compacteurs', 'compacteurs', '🚜', NULL, '8610c676-bc12-4b83-87e4-65278d938a15', 3, now(), now()),
('da88b468-6351-4724-97fb-f7439640c3e4', 'Pneumatiques', 'pneumatiques', '🔴', NULL, '2f897b5a-6929-4a36-83d7-51ab47c308a9', 1, now(), now()),
('7d80d73d-511f-4ddd-acef-fe4635aa33a9', 'Hydraulique', 'hydraulique', '💧', NULL, '2f897b5a-6929-4a36-83d7-51ab47c308a9', 2, now(), now()),
('72021d29-03d4-4754-8d5b-2b5089b5888b', 'Électrique', 'electrique', '⚡', NULL, '2f897b5a-6929-4a36-83d7-51ab47c308a9', 3, now(), now()),
('14d1d00e-443e-4c9e-941e-f1f5e71f8ce0', 'Pulvérisateurs', 'pulverisateurs', '💨', NULL, 'fb968f7c-84b5-4824-ab32-27893f098738', 1, now(), now()),
('0edba687-bf3d-4ec8-af77-f9a634cda36f', 'Épandeurs', 'epandeurs', '🌿', NULL, 'fb968f7c-84b5-4824-ab32-27893f098738', 2, now(), now()),
('825ecfe7-7d6e-4041-9f02-4068889907f2', 'Irrigation', 'irrigation', '💦', NULL, 'fb968f7c-84b5-4824-ab32-27893f098738', 3, now(), now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 2: SHIPPING ZONES
-- ============================================================

INSERT INTO shipping_zones (id, name, countries, min_days, max_days, is_active, sort_order, created_at, updated_at) VALUES
('e0df92ff-cee8-4b54-ba61-f88ea7f41af4', 'France métropolitaine', ARRAY['FR'], 3, 7, true, 1, now(), now()),
('18bec82b-d8e9-4bd2-85b6-c26d6ca41578', 'Europe de l''Ouest', ARRAY['BE','LU','DE','NL','CH','AT','IT','ES','PT'], 5, 10, true, 2, now(), now()),
('afa99d0f-0635-426d-8788-32b94a68efca', 'Europe de l''Est', ARRAY['PL','CZ','SK','HU','RO','BG','HR','SI'], 7, 14, true, 3, now(), now()),
('ba6a565a-df26-490a-983b-0bc4d8b2e64c', 'Royaume-Uni', ARRAY['GB','IE'], 7, 14, true, 4, now(), now()),
('56ffa735-aa46-499f-a069-7d58dfde7857', 'Reste du monde', ARRAY['*'], 14, 30, true, 5, now(), now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 3: BANK ACCOUNTS
-- ============================================================

INSERT INTO bank_accounts (id, name, holder, iban, bic, bank_name, account_key, threshold_min, threshold_max, is_active, created_at, updated_at) VALUES
('cfc5f63c-9cc6-464a-913c-980018308768', 'Compte principal', 'EQUIPTRADE SAS', 'FR76 1234 5678 9012 3456 7890 123', 'AGRIFRPP', 'Banque Agricole', 'account_a', 0.00, 4999.99, true, now(), now()),
('0cfed41d-11bc-4148-8e92-6e3a7215993b', 'Compte grands montants', 'EQUIPTRADE SAS', 'FR76 9876 5432 1098 7654 3210 987', 'BNPAFRPP', 'Banque Internationale', 'account_b', 5000.00, NULL, true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 4: PAYPAL SETTINGS
-- ============================================================

INSERT INTO paypal_settings (id, client_id, is_active, sandbox_mode, created_at, updated_at) VALUES
('585664e2-9203-48b8-a864-cea4bc1e4d31', NULL, true, true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 5: PROMOTIONS
-- ============================================================

INSERT INTO promotions (id, name, description, discount_type, discount_value, applies_to, target_categories, target_product_ids, start_date, end_date, is_active, priority, min_price, max_price, created_at, updated_at) VALUES
('09ee9bdd-c82a-407f-a242-483c497990e7', 'Vente Flash', NULL, 'percentage', 15, 'categories', ARRAY['tondeuse'], ARRAY[]::uuid[], '2026-01-28 10:17:16.914+00', '2026-05-19 23:00:00+00', true, 0, NULL, NULL, now(), now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 6: TESTIMONIALS
-- ============================================================

INSERT INTO testimonials (id, author_name, author_company, author_location, content, content_translations, rating, is_active, is_featured, created_at, updated_at) VALUES
('8f5e3cf9-2e0d-45df-be12-553210e418c7', 'Pierre Martin', 'Vignobles Martin', 'Bordeaux, France', 'Excellent service ! J''ai reçu mon tracteur en parfait état, livré en seulement 5 jours. L''équipe est très professionnelle et réactive. Je recommande vivement.', '{"fr": "Excellent service ! J''ai reçu mon tracteur en parfait état, livré en seulement 5 jours. L''équipe est très professionnelle et réactive. Je recommande vivement.", "en": "Excellent service! I received my tractor in perfect condition, delivered in just 5 days. The team is very professional and responsive. Highly recommended.", "de": "Hervorragender Service! Ich habe meinen Traktor in einwandfreiem Zustand erhalten, geliefert in nur 5 Tagen. Das Team ist sehr professionell und reaktionsschnell. Sehr empfehlenswert.", "es": "¡Excelente servicio! Recibí mi tractor en perfecto estado, entregado en solo 5 días. El equipo es muy profesional y receptivo. Muy recomendado.", "it": "Servizio eccellente! Ho ricevuto il mio trattore in condizioni perfette, consegnato in soli 5 giorni. Il team è molto professionale e reattivo. Altamente raccomandato.", "pt": "Excelente serviço! Recebi o meu trator em perfeitas condições, entregue em apenas 5 dias. A equipa é muito profissional e reativa. Altamente recomendado."}', 5, true, true, now(), now()),
('4de19283-f716-479b-a5e0-24a1c902fb5c', 'Hans Mueller', 'Mueller Agrar GmbH', 'Munich, Allemagne', 'Très satisfait de ma moissonneuse-batteuse. Le processus d''achat était simple et la livraison en Allemagne s''est faite sans problème. Super qualité !', '{"fr": "Très satisfait de ma moissonneuse-batteuse. Le processus d''achat était simple et la livraison en Allemagne s''est faite sans problème. Super qualité !", "en": "Very satisfied with my combine harvester. The purchasing process was simple and delivery to Germany went smoothly. Great quality!", "de": "Sehr zufrieden mit meinem Mähdrescher. Der Kaufprozess war einfach und die Lieferung nach Deutschland verlief problemlos. Tolle Qualität!", "es": "Muy satisfecho con mi cosechadora. El proceso de compra fue simple y la entrega a Alemania fue sin problemas. ¡Gran calidad!", "it": "Molto soddisfatto della mia mietitrebbia. Il processo di acquisto è stato semplice e la consegna in Germania è andata senza problemi. Ottima qualità!", "pt": "Muito satisfeito com a minha ceifeira-debulhadora. O processo de compra foi simples e a entrega na Alemanha correu sem problemas. Ótima qualidade!"}', 5, true, true, now(), now()),
('3f8c5cdd-7ff2-4df5-aa30-0ddf89caa98f', 'Maria Garcia', 'Finca La Esperanza', 'Madrid, Espagne', 'Service client exceptionnel. Ils ont répondu à toutes mes questions et m''ont aidée à choisir le bon équipement pour mon exploitation.', '{"fr": "Service client exceptionnel. Ils ont répondu à toutes mes questions et m''ont aidée à choisir le bon équipement pour mon exploitation.", "en": "Exceptional customer service. They answered all my questions and helped me choose the right equipment for my farm.", "de": "Außergewöhnlicher Kundenservice. Sie haben alle meine Fragen beantwortet und mir geholfen, die richtige Ausrüstung für meinen Betrieb auszuwählen.", "es": "Servicio al cliente excepcional. Respondieron a todas mis preguntas y me ayudaron a elegir el equipo adecuado para mi explotación.", "it": "Servizio clienti eccezionale. Hanno risposto a tutte le mie domande e mi hanno aiutato a scegliere l''attrezzatura giusta per la mia azienda agricola.", "pt": "Serviço ao cliente excecional. Responderam a todas as minhas perguntas e ajudaram-me a escolher o equipamento certo para a minha exploração."}', 5, true, true, now(), now()),
('64c53d3a-f285-4c07-a1a8-1f9281b3ed1c', 'Jean-Luc Dupont', 'EARL Dupont', 'Lyon, France', 'Deuxième achat chez EquipTrade. Toujours la même qualité de service. Les prix sont compétitifs et le matériel est conforme à la description.', '{"fr": "Deuxième achat chez EquipTrade. Toujours la même qualité de service. Les prix sont compétitifs et le matériel est conforme à la description.", "en": "Second purchase from EquipTrade. Always the same quality of service. Prices are competitive and the equipment matches the description.", "de": "Zweiter Kauf bei EquipTrade. Immer die gleiche Servicequalität. Die Preise sind wettbewerbsfähig und die Ausrüstung entspricht der Beschreibung.", "es": "Segunda compra en EquipTrade. Siempre la misma calidad de servicio. Los precios son competitivos y el equipo coincide con la descripción.", "it": "Secondo acquisto da EquipTrade. Sempre la stessa qualità del servizio. I prezzi sono competitivi e l''attrezzatura corrisponde alla descrizione.", "pt": "Segunda compra na EquipTrade. Sempre a mesma qualidade de serviço. Os preços são competitivos e o equipamento corresponde à descrição."}', 5, true, false, now(), now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 7: BRANDS (principales)
-- ============================================================

INSERT INTO brands (id, name, slug, logo_url, category_id, sort_order, created_at, updated_at) VALUES
('aaedea12-85f5-45e2-ab62-33e9ffd546a5', 'John Deere', 'john-deere', NULL, '0ff03b42-b948-4ac6-b851-5e1699bd746f', 1, now(), now()),
('211d0081-04d7-4f59-9df6-7ccbe0c6c820', 'Massey Ferguson', 'massey-ferguson', NULL, '0ff03b42-b948-4ac6-b851-5e1699bd746f', 2, now(), now()),
('fcc5edb2-bdd0-4847-8085-e92a8b3b4fc8', 'New Holland', 'new-holland', NULL, '0ff03b42-b948-4ac6-b851-5e1699bd746f', 3, now(), now()),
('61d144f2-947c-4fbb-b0cd-81eeda5365c0', 'Fendt', 'fendt', NULL, '0ff03b42-b948-4ac6-b851-5e1699bd746f', 4, now(), now()),
('bcaa4e9f-3db8-47df-a839-5d7de98f1c01', 'Case IH', 'case-ih', NULL, '0ff03b42-b948-4ac6-b851-5e1699bd746f', 5, now(), now()),
('638b988d-8fb2-4863-abfa-3d1c624ffd8c', 'Claas', 'claas-recolte', NULL, 'bd248966-f700-43fb-a98f-c11064baa0b9', 1, now(), now()),
('5d718639-41cc-4de8-8916-9a74dc0dd556', 'New Holland', 'new-holland-recolte', NULL, 'bd248966-f700-43fb-a98f-c11064baa0b9', 2, now(), now()),
('f38faeee-4b38-4ec4-9c66-0e8ca5291e24', 'John Deere', 'john-deere-recolte', NULL, 'bd248966-f700-43fb-a98f-c11064baa0b9', 3, now(), now()),
('f17fd444-a6c1-4981-809e-b76bd1c77dc9', 'Krone', 'krone', NULL, 'bd248966-f700-43fb-a98f-c11064baa0b9', 4, now(), now()),
('fb25a6cc-de9a-4bc7-a987-6ab8a8a84f5a', 'Fendt', 'fendt-recolte', NULL, 'bd248966-f700-43fb-a98f-c11064baa0b9', 5, now(), now()),
('70451d34-5c6c-4b67-bb5d-2987552d31ed', 'Kuhn', 'kuhn-sol', NULL, 'd49342c8-ad0b-472f-8062-2cb7624e8fad', 1, now(), now()),
('8c7c4f8f-92fe-4b17-ab7a-4b3cce519f9b', 'Lemken', 'lemken', NULL, 'd49342c8-ad0b-472f-8062-2cb7624e8fad', 2, now(), now()),
('cb6c9fc2-3c12-45da-84e7-5e5789009488', 'Amazone', 'amazone', NULL, 'd49342c8-ad0b-472f-8062-2cb7624e8fad', 3, now(), now()),
('67d35d5e-63f5-487d-8eec-4de07f709bc5', 'Kverneland', 'kverneland', NULL, 'd49342c8-ad0b-472f-8062-2cb7624e8fad', 4, now(), now()),
('af54cfc5-4e9f-4701-a43f-79e3509da03a', 'Kuhn', 'kuhn', NULL, 'd2d4c69a-4a86-4bc1-8a0c-014b1d8e0df2', 1, now(), now()),
('dd5473fb-081f-42ca-8e68-f9281d29010d', 'Maschio', 'maschio', NULL, 'd2d4c69a-4a86-4bc1-8a0c-014b1d8e0df2', 2, now(), now()),
('ef569fa0-bc13-4689-b310-eb74fa2521dc', 'Ferri', 'ferri', NULL, 'd2d4c69a-4a86-4bc1-8a0c-014b1d8e0df2', 3, now(), now()),
('d01a9c22-3c60-4c58-9c80-b52705d77994', 'Seppi', 'seppi', NULL, 'd2d4c69a-4a86-4bc1-8a0c-014b1d8e0df2', 4, now(), now()),
('2b970622-9040-4fb9-acd8-fc585b60a75e', 'Bobcat', 'bobcat', NULL, '7d7618d3-4bc6-4b86-81f2-54a85115d643', 4, now(), now()),
('0bb50404-d7d1-456f-bed5-4885af06447e', 'Volvo', 'volvo', NULL, '8610c676-bc12-4b83-87e4-65278d938a15', 3, now(), now()),
('c97ef1e9-2c09-4e16-8617-175f8af71b3f', 'Hitachi', 'hitachi', NULL, '8610c676-bc12-4b83-87e4-65278d938a15', 4, now(), now()),
('64581c9e-49cd-42f9-9690-71c490b59e6e', 'Rolland', 'rolland', NULL, 'e2093037-8a33-44ea-b115-ae2d4f1f9969', 1, now(), now()),
('32ecad97-86da-467f-b3d6-692215653642', 'Joskin', 'joskin', NULL, 'e2093037-8a33-44ea-b115-ae2d4f1f9969', 2, now(), now()),
('25b4aa9e-e8f0-4010-a26e-dc5e3504c73e', 'Fliegl', 'fliegl', NULL, 'e2093037-8a33-44ea-b115-ae2d4f1f9969', 3, now(), now()),
('b571a9ca-5181-4f75-b1e2-cf76153d400f', 'Ponge', 'ponge', NULL, 'e2093037-8a33-44ea-b115-ae2d4f1f9969', 4, now(), now()),
('b68f3a8f-b4d1-4b2f-a25e-f1119868961c', 'Berthoud', 'berthoud', NULL, '14d1d00e-443e-4c9e-941e-f1f5e71f8ce0', 1, now(), now()),
('da488b72-8407-43c8-a2a6-8d4931bc1041', 'Amazone', 'amazone-pulve', NULL, '14d1d00e-443e-4c9e-941e-f1f5e71f8ce0', 2, now(), now()),
('95ccb94c-f5ee-4a72-9334-f62ca97bc17a', 'Hardi', 'hardi', NULL, '14d1d00e-443e-4c9e-941e-f1f5e71f8ce0', 3, now(), now()),
('f12bd551-6f72-4bfe-a29f-d433a6c029ba', 'Tecnoma', 'tecnoma', NULL, '14d1d00e-443e-4c9e-941e-f1f5e71f8ce0', 4, now(), now()),
('7decf413-5bcb-4be9-a103-8f84cef29c0f', 'Kuhn', 'kuhn-pulve', NULL, '14d1d00e-443e-4c9e-941e-f1f5e71f8ce0', 5, now(), now()),
('2ff9641c-8252-4ea2-a2e7-90f4389945cc', 'Kuhn', 'kuhn-elevage', NULL, NULL, 1, now(), now()),
('f446ee13-15c9-43ec-9120-f0c424fc14d8', 'Siloking', 'siloking', NULL, NULL, 2, now(), now()),
('75e00c08-cb4b-4d27-88da-85dec8666f85', 'Delaval', 'delaval', NULL, NULL, 3, now(), now()),
('8714f4df-db74-4960-b4b8-10d67dcbc9f0', 'Lely', 'lely-elevage', NULL, NULL, 4, now(), now()),
('ddf6af77-c761-41fb-b634-b78b990c88ff', 'BlackStone', 'blackstone', NULL, NULL, 0, now(), now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 8: PRODUCTS
-- ============================================================
-- NOTE: Pour les 176 produits, utilisez l'export/import CSV:
-- 1. Projet original: Cloud → Database → Tables → products → Export CSV
-- 2. Nouveau projet: Cloud → Database → Tables → products → Import CSV
--
-- Ou demandez-moi de générer les INSERT après le remix
-- ============================================================

-- ============================================================
-- SECTION 9: CRÉER UN COMPTE ADMIN
-- ============================================================
-- Après l'import, appelez l'Edge Function create-admin-user:
--
-- Dans le chat Lovable du nouveau projet, demandez:
-- "Crée un compte admin pour email@example.com"
-- ============================================================
