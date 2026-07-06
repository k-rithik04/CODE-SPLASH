-- Run this in Supabase SQL Editor to reset the admin password
-- Password: admin123

UPDATE profiles
SET password = '$2b$12$2gcbillES.3X4dTnU8tkruZsMJFfacx2s5qsixa42vB0aV3S3gDFi'
WHERE username = 'admin';
