USE church;

INSERT INTO church_settings (id, church_name, slogan, mission, vision, address, phone, whatsapp, email, pastor_name, pastor_title, pastor_bio)
VALUES (
  1,
  'Gospel Break Chain Ministry',
  'Brisons les chaînes par le pouvoir de Christ',
  'Porter l’Évangile du Seigneur Jésus-Christ partout où le besoin se fait sentir.',
  'Restaurer, libérer et impacter.',
  'Mora, Extrême-Nord, Cameroun',
  '694880056',
  '+237692765158',
  'narcisse.arenthes@yahoo.fr',
  'Jean Emmanuel',
  'Fondateur & visionnaire du ministère',
  'Porter l’Évangile sur le terrain, accompagner les personnes vulnérables et contribuer à la restauration des vies.'
)
ON DUPLICATE KEY UPDATE
  church_name = VALUES(church_name),
  slogan = VALUES(slogan),
  mission = VALUES(mission),
  vision = VALUES(vision),
  address = VALUES(address),
  phone = VALUES(phone),
  whatsapp = VALUES(whatsapp),
  email = VALUES(email),
  pastor_name = VALUES(pastor_name),
  pastor_title = VALUES(pastor_title),
  pastor_bio = VALUES(pastor_bio);

INSERT INTO pages (slug, title, content) VALUES
('about', 'Un ministère envoyé sur le terrain', 'Gospel Break Chain Ministry est un ministère chrétien dédié à l’évangélisation, aux missions et à la restauration des vies.'),
('evangelisation', 'Évangélisation', 'Porter l’Évangile auprès des peuples non atteints et des communautés qui ont encore peu accès à la Bonne Nouvelle de Jésus-Christ.')
ON DUPLICATE KEY UPDATE title = VALUES(title), content = VALUES(content);

INSERT INTO ministries (name, slug, description) VALUES
('Évangélisation & missions', 'evangelisation-missions', 'Aller vers les peuples non atteints et les communautés difficiles d’accès.'),
('Enfance & solidarité', 'enfance-solidarite', 'Scolariser et accompagner les orphelins et demi-orphelins victimes de guerre.'),
('Relation d’aide chrétienne', 'relation-aide', 'Écouter, accompagner, soutenir et prier pour les personnes en période de crise.')
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);

INSERT INTO testimonials (name, content, status) VALUES
('Témoignage 1', 'Dieu a transformé ma vie et m’a donné une nouvelle espérance.', 'published'),
('Témoignage 2', 'J’ai retrouvé la paix grâce à la prière et à l’accompagnement reçu.', 'published');
