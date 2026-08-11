USE church;

-- Existing installations: migrate the old pastor role to the explicit admin role.
ALTER TABLE users
    MODIFY role ENUM('admin','developer','pastor') NOT NULL DEFAULT 'admin';

UPDATE users SET role = 'admin' WHERE role = 'pastor';

ALTER TABLE users
    MODIFY role ENUM('admin','developer') NOT NULL DEFAULT 'admin';

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX idx_users_role_active ON users(role, is_active);

CREATE TABLE IF NOT EXISTS church_account_settings (
    id TINYINT UNSIGNED PRIMARY KEY,
    primary_admin_user_id INT UNSIGNED NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_primary_admin_user FOREIGN KEY (primary_admin_user_id) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO church_account_settings (id, primary_admin_user_id)
SELECT 1, MIN(id) FROM users WHERE role = 'admin'
ON DUPLICATE KEY UPDATE primary_admin_user_id = COALESCE(church_account_settings.primary_admin_user_id, VALUES(primary_admin_user_id));

CREATE TABLE IF NOT EXISTS user_admin_audit (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    actor_user_id INT UNSIGNED NOT NULL,
    target_user_id INT UNSIGNED NULL,
    action VARCHAR(32) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_actor FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_audit_target FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_admin_audit_actor (actor_user_id),
    INDEX idx_user_admin_audit_target (target_user_id)
);

CREATE OR REPLACE VIEW developer_site_summary AS
SELECT
    (SELECT COUNT(*) FROM users WHERE is_active = TRUE) AS active_users,
    (SELECT COUNT(*) FROM users WHERE role = 'admin' AND is_active = TRUE) AS active_admins,
    (SELECT COUNT(*) FROM users WHERE role = 'developer' AND is_active = TRUE) AS active_developers,
    (SELECT primary_admin_user_id FROM church_account_settings WHERE id = 1) AS primary_admin_user_id;
