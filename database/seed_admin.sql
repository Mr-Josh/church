USE church;

INSERT INTO users (name, email, password, role, is_active)
VALUES (
    'Pasteur Jean Emmanuel',
    'pastor@gospelbreakchainministry.org',
    '$2y$12$DQPf7aJwR3OA/gczo4FnP.QohHlieP650ddtV1TGccJzQ2S8GTp9q',
    'admin',
    TRUE
)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    password = VALUES(password),
    role = 'admin',
    is_active = TRUE;

INSERT INTO church_account_settings (id, primary_admin_user_id)
SELECT 1, id FROM users WHERE email = 'pastor@gospelbreakchainministry.org'
ON DUPLICATE KEY UPDATE primary_admin_user_id = VALUES(primary_admin_user_id);

-- Existing development seed credentials are kept here only for local development.
-- Change the password before production deployment.
