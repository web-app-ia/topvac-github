-- Add type column to publications (activities or shopping)
ALTER TABLE publications ADD COLUMN type TEXT DEFAULT 'activities';
