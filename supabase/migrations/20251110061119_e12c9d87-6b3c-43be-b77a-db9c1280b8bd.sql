-- Update admin password to new value
UPDATE site_settings 
SET value = 'Magdi17121997', updated_at = now()
WHERE key = 'admin_password';