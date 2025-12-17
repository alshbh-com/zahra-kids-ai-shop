import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ColorVariant {
  id: string;
  product_id: string;
  color: string;
  sizes: string[];
  stock: number;
}

export const useColorVariants = (productId: string) => {
  return useQuery({
    queryKey: ["color-variants", productId],
    queryFn: async () => {
      if (!productId) return [];
      const { data, error } = await supabase
        .from("product_color_variants")
        .select("*")
        .eq("product_id", productId)
        .gt("stock", 0) // فقط الألوان المتوفرة
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as ColorVariant[];
    },
    enabled: !!productId,
  });
};
