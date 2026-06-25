import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://yqiyxvnytgddydzeoboo.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxaXl4dm55dGdkZHlkemVvYm9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzOTU1MTYsImV4cCI6MjA5Nzk3MTUxNn0.2jJ6dH1Z3IJ16mtlZDHG8J33pypjDA34MU6nS1mL9Yg";

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Order = {
  id: string;
  created_at: string;
  customer_name: string;
  phone: string;
  occasion: string;
  service: string;
  message: string;
  status: "new" | "in_progress" | "wrapped" | "delivered";
  price: number | null;
};

export type Customer = {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  total_orders: number;
};