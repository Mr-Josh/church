USE church;

-- Existing installations may have been created from an older schema that did not
-- contain the public interaction resources. Keep this migration idempotent.
CREATE TABLE IF NOT EXISTS testimonials (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(190) NOT NULL,
    content TEXT NOT NULL,
    photo VARCHAR(255) NULL,
    status ENUM('pending','published','rejected') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prayer_requests (
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

CREATE TABLE IF NOT EXISTS help_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(190) NULL,
    phone VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('new','read','handled') NOT NULL DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
