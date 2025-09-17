import express from 'express';
import pool from '../config/database.js';

import { validateVariantSelection, findVariantById, getDefaultVariant, getVariantPrice } from '../utils/variantHelper.js';

const router = express.Router();

// Add to cart
router.post('/', async (req, res) => {
  try {
    const { product_id, quantity, variant_id } = req.body;
    const user_id = req.session.userId;

    // Get product info to validate variant
    const [productRows] = await pool.execute(
      'SELECT additional_info FROM products WHERE product_id = ? AND is_deleted = FALSE',
      [product_id]
    );
    
    if (productRows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const product = productRows[0];
    console.log(`Product rows: ${JSON.stringify(product)}`);

    
    // Validate variant if provided
    if (variant_id) {
      const validation = validateVariantSelection(product.additional_info, variant_id);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.error });
      }
    }

    // Check if item already in cart (including variant)
    const [existing] = await pool.execute(
      'SELECT cart_id, quantity FROM cart WHERE user_id = ? AND product_id = ? AND (variant_id = ? OR (variant_id IS NULL AND ? IS NULL))',
      [user_id, product_id, variant_id, variant_id]
    );

    if (existing.length > 0) {
      // Update quantity
      const newQuantity = existing[0].quantity + quantity;
      await pool.execute(
        'UPDATE cart SET quantity = ? WHERE cart_id = ?',
        [newQuantity, existing[0].cart_id]
      );
      res.json({ message: 'Cart updated', cart_id: existing[0].cart_id });
    } else {
      // Insert new item
      const [result] = await pool.execute(
        'INSERT INTO cart (user_id, product_id, quantity, variant_id) VALUES (?, ?, ?, ?)',
        [user_id, product_id, quantity, variant_id]
      );
      console.log(`REsult from cart: ${result}`)
      res.status(201).json({ message: 'Added to cart', cart_id: result.insertId });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error adding to cart' });
  }
});

// Get cart items
router.get('/', async (req, res) => {
  try {
    const user_id = req.session.userId;
    const [rows] = await pool.execute(`
      SELECT c.cart_id, c.quantity, c.variant_id, p.product_id, p.name, p.price, p.image_url, p.stock, p.additional_info
      FROM cart c
      JOIN products p ON c.product_id = p.product_id
      WHERE c.user_id = ?
    `, [user_id]);
    
    // Calculate variant-specific pricing and details
    const cartWithVariants = rows.map(item => {
      let finalPrice = item.price;
      let variantDetails = null;
      
      if (item.variant_id && item.additional_info?.variants) {
        const variant = findVariantById(item.additional_info, item.variant_id);
        if (variant) {
          finalPrice = parseFloat(variant.price) || 0;
          variantDetails = {
            id: variant.id,
            name: variant.name,
            options: variant.options
          };
        }
      } else if (item.additional_info?.variants && item.additional_info.variants.length > 0) {
        // Product has variants but no specific variant selected, use default variant price
        const defaultVariant = getDefaultVariant(item.additional_info);
        if (defaultVariant) {
          finalPrice = parseFloat(defaultVariant.price) || 0;
        }
      }
      
      return {
        ...item,
        final_price: finalPrice,
        subtotal: item.quantity * finalPrice,
        variant_details: variantDetails
      };
    });
    
    res.json(cartWithVariants);
  } catch (error) {
    console.error('Cart fetch error:', error);
    res.status(500).json({ message: 'Error fetching cart' });
  }
});

// Update cart quantity
router.put('/:cart_id', async (req, res) => {
  try {
    const { quantity } = req.body;
    const [result] = await pool.execute(
      'UPDATE cart SET quantity = ? WHERE cart_id = ?',
      [quantity, req.params.cart_id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    
    res.json({ message: 'Cart updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart' });
  }
});

// Remove from cart
router.delete('/:cart_id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM cart WHERE cart_id = ?', [req.params.cart_id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing from cart' });
  }
});

// Update cart quantity by product_id
router.put('/product/:product_id', async (req, res) => {
  try {
    const { quantity } = req.body;
    const user_id = req.session.userId;
    const product_id = req.params.product_id;
    
    const [result] = await pool.execute(
      'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
      [quantity, user_id, product_id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    
    res.json({ message: 'Cart updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart' });
  }
});

// Remove from cart by product_id
router.delete('/product/:product_id', async (req, res) => {
  try {
    const user_id = req.session.userId;
    const product_id = req.params.product_id;
    
    const [result] = await pool.execute(
      'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
      [user_id, product_id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing from cart' });
  }
});

export default router;