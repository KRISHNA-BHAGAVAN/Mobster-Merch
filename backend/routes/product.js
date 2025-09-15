import express from "express";
import pool from "../config/database.js";
import { calculateVariantPrice, getTotalStock } from "../utils/variantHelper.js";

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
      if (product.additional_info?.variants) {
        const totalStock = getTotalStock(product.additional_info, product.stock);
        return { ...product, total_variant_stock: totalStock };
      }
      return product;
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
    if (product.additional_info?.variants) {
      const totalStock = getTotalStock(product.additional_info, product.stock);
      product.total_variant_stock = totalStock;
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product" });
  }
});

export default router;
