-- Attach multiple mission/action photos to events.
CREATE TABLE IF NOT EXISTS event_photos (
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
