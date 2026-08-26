USE church;

-- The obsolete modules were verified to have no foreign-key dependencies.
-- Remove their dedicated tables as part of the permanent module removal.
DROP TABLE IF EXISTS gallery_items;
DROP TABLE IF EXISTS sermons;
