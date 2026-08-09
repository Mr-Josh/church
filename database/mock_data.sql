USE church;

INSERT INTO church_settings (id, church_name, slogan, mission, vision, address, phone, whatsapp, email)
VALUES (1, 'Gospel Break Chain Ministry', 'Brisons les chaînes par le pouvoir de Christ.', 'Gagner les âmes, faire des disciples, impacter notre génération par la parole de Dieu et l\'amour du Christ.', 'Être une église passionnée par la présence de Dieu et la transformation des nations.', 'Quartier Bonamoussadi, Rue 12, Douala, Cameroun', '+237 600 000 000', '+237 600 000 000', 'contact@gospelbreakchainministry.org')
ON DUPLICATE KEY UPDATE church_name = VALUES(church_name);

INSERT INTO pages (slug, title, content) VALUES
('about', 'À propos', 'Gospel Break Chain Ministry est un ministère centré sur l’Évangile, la prière, la délivrance, la guérison, la restauration et la formation de disciples.'),
('evangelisation', 'Évangélisation', 'Découvrir Jésus-Christ, comprendre l’Évangile et être accompagné dans sa marche avec Christ.')
ON DUPLICATE KEY UPDATE title = VALUES(title), content = VALUES(content);

INSERT INTO ministries (name, slug, description) VALUES
('Louange', 'louange', 'Conduire l’assemblée dans la présence de Dieu par la louange et l’adoration.'),
('Intercession', 'intercession', 'Porter les besoins de l’église, des familles et des nations dans la prière.'),
('Jeunesse', 'jeunesse', 'Accompagner les jeunes dans leur foi et leur engagement.'),
('Enfants', 'enfants', 'Former les enfants dans la foi chrétienne.'),
('Évangélisation', 'evangelisation', 'Partager l’Évangile et gagner des âmes à Christ.'),
('Accueil', 'accueil', 'Accueillir et orienter les personnes qui rejoignent l’église.'),
('Communication', 'communication', 'Soutenir la communication et la diffusion des activités de l’église.'),
('Média', 'media', 'Produire et diffuser les contenus audio-visuels du ministère.'),
('Protocole', 'protocole', 'Assurer l’organisation et le bon déroulement des activités.')
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);

INSERT INTO programs (title, description, day, start_time, end_time) VALUES
('Culte dominical', 'Culte principal de l’église.', 'Dimanche', '08:00:00', '11:00:00'),
('Culte de prière', 'Temps consacré à la prière.', 'Mercredi', '18:00:00', '20:00:00'),
('Veillée de prières', 'Temps de prière et d’intercession.', 'Vendredi', '21:00:00', '00:00:00'),
('École du dimanche', 'Enseignement biblique.', 'Dimanche', '08:00:00', '09:00:00');

INSERT INTO sermons (title, description, preacher, published_at) VALUES
('La puissance de la prière', 'Enseignement sur la puissance de la prière.', 'Pasteur Jean Emmanuel', NOW()),
('Marcher dans la délivrance', 'Enseignement sur la liberté en Christ.', 'Pasteur Jean Emmanuel', NOW()),
('Vivre la victoire en Christ', 'Message sur la victoire du croyant en Christ.', 'Pasteur Jean Emmanuel', NOW());

INSERT INTO testimonials (name, content, status) VALUES
('Témoignage 1', 'Dieu a transformé ma vie et m’a donné une nouvelle espérance.', 'published'),
('Témoignage 2', 'J’ai retrouvé la paix grâce à la prière et à l’accompagnement reçu.', 'published');
