import express from "express";
import pool from "../config/database.js";
import { getTotalStock, getProductDisplayPrice, getDefaultVariant, getDefaultVariantStock } from "../utils/variantHelper.js";

const router = express.Router();

// GET all active products
router.get("/get-available-products", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.category_id 
      WHERE p.is_deleted = FALSE 
      ORDER BY p.created_at DESC
    `);
    
    // Add variant information to each product
    const productsWithVariants = rows.map(product => {
      if (product.additional_info?.variants && product.additional_info.variants.length > 0) {
        const totalStock = getTotalStock(product.additional_info, product.stock);
        const displayPrice = getProductDisplayPrice(product);
        const defaultVariant = getDefaultVariant(product.additional_info);
        const defaultStock = getDefaultVariantStock(product.additional_info);
        
        return { 
          ...product, 
          total_variant_stock: totalStock,
          display_price: displayPrice,
          default_variant: defaultVariant,
          current_stock: defaultStock
        };
      }
      return {
        ...product,
        display_price: parseFloat(product.price),
        current_stock: product.stock
      };
    });
    
    res.json(productsWithVariants);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
});

// GET soft deleted products (admin only)
router.get("/not-available-products", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.category_id 
      WHERE p.is_deleted = TRUE 
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching deleted products" });
  }
});

// GET products by category
router.get("/:category_id", async (req, res) => {
  try {
    const categoryId = req.params.category_id;

    const [rows] = await pool.execute(
      `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.category_id 
      WHERE p.category_id = ? AND p.is_deleted = FALSE 
      ORDER BY p.created_at DESC
    `,
      [categoryId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products by category" });
  }
});

// GET single product
router.get("/single/:id", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.category_id 
      WHERE p.product_id = ? AND p.is_deleted = FALSE
    `,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    const product = rows[0];
    if (product.additional_info?.variants && product.additional_info.variants.length > 0) {
      const totalStock = getTotalStock(product.additional_info, product.stock);
      const displayPrice = getProductDisplayPrice(product);
      const defaultVariant = getDefaultVariant(product.additional_info);
      const defaultStock = getDefaultVariantStock(product.additional_info);
      
      product.total_variant_stock = totalStock;
      product.display_price = displayPrice;
      product.default_variant = defaultVariant;
      product.current_stock = defaultStock;
    } else {
      product.display_price = parseFloat(product.price);
      product.current_stock = product.stock;
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product" });
  }
});

export default router;
