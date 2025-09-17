import pool from '../config/database.js';

async function migrateDefaultVariants() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Starting default variant migration...');
    
    // Get all products with variants
    const [products] = await connection.execute(
      'SELECT product_id, additional_info FROM products WHERE additional_info IS NOT NULL AND is_deleted = FALSE'
    );
    
    let updatedCount = 0;
    
    for (const product of products) {
      try {
        const additionalInfo = typeof product.additional_info === 'string' 
          ? JSON.parse(product.additional_info) 
          : product.additional_info;
        
        if (additionalInfo.variants && additionalInfo.variants.length > 0) {
          // Check if any variant already has is_default set
          const hasDefault = additionalInfo.variants.some(v => v.is_default === true);
          
          if (!hasDefault) {
            // Set the first variant as default
            additionalInfo.variants[0].is_default = true;
            
            // Update the product
            await connection.execute(
              'UPDATE products SET additional_info = ? WHERE product_id = ?',
              [JSON.stringify(additionalInfo), product.product_id]
            );
            
            updatedCount++;
            console.log(`Updated product ${product.product_id} - set first variant as default`);
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

migrateDefaultVariants();