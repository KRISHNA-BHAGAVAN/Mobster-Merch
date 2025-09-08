-- Add cloudinary_public_id columns to existing tables
ALTER TABLE products ADD COLUMN cloudinary_public_id VARCHAR(255) NULL;
ALTER TABLE categories ADD COLUMN cloudinary_public_id VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN cloudinary_public_id VARCHAR(255) NULL;