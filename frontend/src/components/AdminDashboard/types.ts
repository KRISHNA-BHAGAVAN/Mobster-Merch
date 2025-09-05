export interface Product {
  product_id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_name: string;
  image_url: string;
}

export interface Notification {
  notification_id: number;
  type: string;
  title: string;
  message: string;
  order_id?: string;
  user_id?: number;
  is_read: boolean;
  created_at: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
}

export interface CategoryFormData {
  name: string;
  description: string;
  image_url: string;
}