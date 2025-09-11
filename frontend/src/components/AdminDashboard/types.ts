export interface Product {
  product_id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_name: string;
  image_url: string;
  additional_info?: any;
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
  additional_info?: DynamicField[];
}

export interface DynamicField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'textarea';
  value: string;
  options?: string[];
  required?: boolean;
}

export interface CategoryFormData {
  name: string;
  description: string;
  image_url: string;
}