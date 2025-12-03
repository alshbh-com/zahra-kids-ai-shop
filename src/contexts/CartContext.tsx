import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CartItem {
  id: string;
  name: string;
  name_ar?: string;
  name_en?: string;
  price: number;
  discount_price?: number;
  image_url?: string;
  quantity: number;
  maxStock?: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any) => Promise<void>;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  totalAmount: number;
  refreshStock: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((item: any) => ({
        ...item,
        name: item.name || item.name_ar || 'منتج'
      }));
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // جلب المخزون الحالي من قاعدة البيانات
  const getProductStock = async (productId: string): Promise<number> => {
    const { data } = await supabase
      .from('products')
      .select('stock')
      .eq('id', productId)
      .single();
    return data?.stock || 0;
  };

  // تحديث المخزون لكل المنتجات في السلة
  const refreshStock = async () => {
    if (items.length === 0) return;
    
    const productIds = items.map(item => item.id);
    const { data: products } = await supabase
      .from('products')
      .select('id, stock')
      .in('id', productIds);
    
    if (products) {
      setItems(prev => prev.map(item => {
        const product = products.find(p => p.id === item.id);
        const currentStock = product?.stock || 0;
        // إذا الكمية في السلة أكبر من المخزون، قلّلها
        if (item.quantity > currentStock) {
          if (currentStock === 0) {
            toast.error(`${item.name} نفد من المخزون وتم حذفه من السلة`);
            return null;
          }
          toast.warning(`تم تقليل كمية ${item.name} إلى ${currentStock} (الحد الأقصى المتاح)`);
          return { ...item, quantity: currentStock, maxStock: currentStock };
        }
        return { ...item, maxStock: currentStock };
      }).filter(Boolean) as CartItem[]);
    }
  };

  const addToCart = async (product: any) => {
    const currentStock = await getProductStock(product.id);
    
    if (currentStock <= 0) {
      toast.error('عذراً، هذا المنتج غير متوفر حالياً');
      return;
    }

    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      
      if (existing) {
        if (existing.quantity >= currentStock) {
          toast.error(`عذراً، الحد الأقصى المتاح هو ${currentStock} قطعة فقط`);
          return prev;
        }
        toast.success('تم زيادة الكمية');
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, maxStock: currentStock }
            : item
        );
      }
      
      toast.success('تم إضافة المنتج للسلة');
      return [
        ...prev,
        {
          id: product.id,
          name: product.name_ar || product.name || 'منتج',
          name_ar: product.name_ar,
          name_en: product.name_en,
          price: product.price,
          discount_price: product.discount_price,
          image_url: product.product_images?.[0]?.image_url || product.image_url,
          quantity: 1,
          maxStock: currentStock,
        },
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.success('تم حذف المنتج');
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    const currentStock = await getProductStock(id);
    
    if (quantity > currentStock) {
      toast.error(`عذراً، الحد الأقصى المتاح هو ${currentStock} قطعة فقط`);
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity: currentStock, maxStock: currentStock } : item))
      );
      return;
    }

    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity, maxStock: currentStock } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart');
  };

  const totalAmount = items.reduce(
    (sum, item) =>
      sum + (item.discount_price || item.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount, refreshStock }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
