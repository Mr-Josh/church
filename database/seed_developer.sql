USE church;

-- Local development account only.
-- Email: developer@gospelbreakchainministry.org
-- Password: Dev@12345
-- Change/remove this account before production deployment.

INSERT INTO users (name, email, password, role, is_active)
VALUES (
    'Developer',
    'developer@gospelbreakchainministry.org',
    '$2y$12$t9GAQAfmnSCGDxbgbzLuce.l/Wg.J9hLvOf/hQqW0PekaxoulwvWK',
    'developer',
    TRUE
)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    password = VALUES(password),
    role = 'developer',
    is_active = TRUE;
