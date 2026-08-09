USE church;

INSERT INTO users (name, email, password, role)
VALUES (
    'Pasteur Jean Emmanuel',
    'pastor@gospelbreakchainministry.org',
    '$2y$12$DQPf7aJwR3OA/gczo4FnP.QohHlieP650ddtV1TGccJzQ2S8GTp9q',
    'pastor'
)
ON DUPLICATE KEY UPDATE name = VALUES(name), password = VALUES(password), role = VALUES(role);

-- Mock login: pastor@gospelbreakchainministry.org / Pastor@123
