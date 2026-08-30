USE church;

-- Upgrade the existing event model without removing legacy event_date.
-- event_date remains for compatibility with existing seed data and older clients.
ALTER TABLE events
    ADD COLUMN slug VARCHAR(190) NULL AFTER title,
    ADD COLUMN start_at DATETIME NULL AFTER event_date,
    ADD COLUMN end_at DATETIME NULL AFTER start_at,
    ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT FALSE AFTER status,
    ADD COLUMN display_order INT NOT NULL DEFAULT 0 AFTER is_featured,
    ADD COLUMN archived_at DATETIME NULL AFTER display_order;

UPDATE events
SET start_at = COALESCE(start_at, event_date),
    end_at = COALESCE(end_at, event_date),
    slug = CASE
        WHEN slug IS NOT NULL AND slug <> '' THEN slug
        ELSE CONCAT('event-', id)
    END
WHERE start_at IS NULL OR end_at IS NULL OR slug IS NULL OR slug = '';

ALTER TABLE events
    MODIFY COLUMN slug VARCHAR(190) NOT NULL,
    MODIFY COLUMN start_at DATETIME NOT NULL,
    MODIFY COLUMN end_at DATETIME NOT NULL,
    ADD UNIQUE KEY uq_events_slug (slug),
    ADD INDEX idx_events_public_dates (status, archived_at, start_at, end_at),
    ADD INDEX idx_events_featured (status, is_featured, display_order, start_at);
