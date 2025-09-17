import pool from '../config/database.js';

async function migrateToAbsolutePricing() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Starting absolute pricing migration...');
    
    // Get all products with variants
    const [products] = await connection.execute(
      'SELECT product_id, price, additional_info FROM products WHERE additional_info IS NOT NULL AND is_deleted = FALSE'
    );
    
    let updatedCount = 0;
    
    for (const product of products) {
      try {
        const additionalInfo = typeof product.additional_info === 'string' 
          ? JSON.parse(product.additional_info) 
          : product.additional_info;
        
        if (additionalInfo.variants && additionalInfo.variants.length > 0) {
          const basePrice = parseFloat(product.price);
          let hasChanges = false;
          
          // Convert price modifiers to absolute prices
          additionalInfo.variants = additionalInfo.variants.map(variant => {
            const oldModifier = parseFloat(variant.price || 0);
            const newAbsolutePrice = basePrice + oldModifier;
            
            if (variant.price !== newAbsolutePrice) {
              hasChanges = true;
              return {
                ...variant,
                price: newAbsolutePrice
              };
            }
            return variant;
          });
          
          if (hasChanges) {
            // Update the product
            await connection.execute(
              'UPDATE products SET additional_info = ? WHERE product_id = ?',
              [JSON.stringify(additionalInfo), product.product_id]
            );
            
            updatedCount++;
            console.log(`Updated product ${product.product_id} - converted to absolute pricing`);
          }
        }
      } catch (error) {
        console.error(`Error processing product ${product.product_id}:`, error);
      }
    }
    
    console.log(`Migration completed. Updated ${updatedCount} products.`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

migrateToAbsolutePricing();