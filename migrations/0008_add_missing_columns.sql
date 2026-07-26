-- Add missing columns that exist in the code but were never migrated
ALTER TABLE publications ADD COLUMN promoteur TEXT DEFAULT '';
ALTER TABLE publications ADD COLUMN texte_publication TEXT DEFAULT '';
ALTER TABLE publications ADD COLUMN accessibilite TEXT DEFAULT '';
ALTER TABLE publications ADD COLUMN payment_phone TEXT DEFAULT '';
