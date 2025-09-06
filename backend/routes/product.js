import express from "express";
import pool from "../config/database.js";

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
    res.json(rows);
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
router.get("/:id", async (req, res) => {
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
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product" });
  }
});

export default router;
