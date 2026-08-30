CREATE DATABASE IF NOT EXISTS church CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE church;

CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','developer') NOT NULL DEFAULT 'admin',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_role_active (role, is_active)
);

CREATE TABLE church_settings (
    id TINYINT UNSIGNED PRIMARY KEY,
    church_name VARCHAR(190) NOT NULL,
    slogan VARCHAR(255) NULL,
    mission TEXT NULL,
    vision TEXT NULL,
    address VARCHAR(255) NULL,
    phone VARCHAR(50) NULL,
    whatsapp VARCHAR(50) NULL,
    email VARCHAR(190) NULL,
    pastor_name VARCHAR(190) NULL,
    pastor_title VARCHAR(190) NULL,
    pastor_bio TEXT NULL,
    pastor_photo VARCHAR(500) NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE church_account_settings (
    id TINYINT UNSIGNED PRIMARY KEY,
    primary_admin_user_id INT UNSIGNED NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_primary_admin_user FOREIGN KEY (primary_admin_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE user_admin_audit (
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

CREATE TABLE pages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(120) NOT NULL UNIQUE,
    title VARCHAR(190) NOT NULL,
    content LONGTEXT NOT NULL,
    status ENUM('draft','published') NOT NULL DEFAULT 'published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE ministries (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(190) NOT NULL,
    slug VARCHAR(190) NOT NULL UNIQUE,
    description TEXT NULL,
    image VARCHAR(255) NULL,
    status ENUM('draft','published') NOT NULL DEFAULT 'published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(190) NOT NULL,
    slug VARCHAR(190) NOT NULL UNIQUE,
    description TEXT NULL,
    image VARCHAR(500) NULL,
    event_date DATETIME NOT NULL,
    start_at DATETIME NOT NULL,
    end_at DATETIME NOT NULL,
    location VARCHAR(255) NULL,
    status ENUM('draft','published') NOT NULL DEFAULT 'published',
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INT NOT NULL DEFAULT 0,
    archived_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_events_public_dates (status, archived_at, start_at, end_at),
    INDEX idx_events_featured (status, is_featured, display_order, start_at)
);

CREATE TABLE event_photos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    event_id INT UNSIGNED NOT NULL,
    image VARCHAR(500) NOT NULL,
    caption VARCHAR(255) NULL,
    position VARCHAR(32) NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_event_photos_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    INDEX idx_event_photos_event_order (event_id, sort_order, id)
);

CREATE TABLE testimonials (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(190) NOT NULL,
    content TEXT NOT NULL,
    photo VARCHAR(255) NULL,
    status ENUM('pending','published','rejected') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE prayer_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(190) NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(190) NULL,
    subject VARCHAR(190) NOT NULL,
    message TEXT NOT NULL,
    is_confidential BOOLEAN NOT NULL DEFAULT FALSE,
    is_urgent BOOLEAN NOT NULL DEFAULT FALSE,
    status ENUM('new','read','handled') NOT NULL DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE help_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(190) NULL,
    phone VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('new','read','handled') NOT NULL DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE donations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(190) NULL,
    phone VARCHAR(50) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    type VARCHAR(80) NOT NULL,
    payment_method VARCHAR(80) NOT NULL,
    transaction_id VARCHAR(190) NULL,
    status ENUM('pending','success','failed') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
