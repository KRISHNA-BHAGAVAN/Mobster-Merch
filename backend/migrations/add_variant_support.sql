-- Add variant support to cart table
ALTER TABLE cart ADD COLUMN variant_id VARCHAR(50) NULL AFTER product_id;

-- Add variant support to order_items table  
ALTER TABLE order_items ADD COLUMN variant_id VARCHAR(50) NULL AFTER product_id;
ALTER TABLE order_items ADD COLUMN variant_details JSON NULL AFTER variant_id;