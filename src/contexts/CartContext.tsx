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
  selectedSizes?: string[]; // مقاسات متعددة
  selectedColors?: string[]; // ألوان متعددة
  size_options?: string[];
  color_options?: string[];
  // للتوافق مع الكود القديم
  selectedSize?: string;
  selectedColor?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, sizes?: string[], colors?: string[]) => Promise<void>;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  updateItemOptions: (id: string, sizes?: string[], colors?: string[]) => void;
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
        name: item.name || item.name_ar || 'منتج',
        // تحويل القيم القديمة للمصفوفات
        selectedSizes: item.selectedSizes || (item.selectedSize ? [item.selectedSize] : []),
        selectedColors: item.selectedColors || (item.selectedColor ? [item.selectedColor] : []),
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

  const addToCart = async (product: any, sizes?: string[], colors?: string[]) => {
    const currentStock = await getProductStock(product.id);
    
    if (currentStock <= 0) {
      toast.error('عذراً، هذا المنتج غير متوفر حالياً');
      return;
    }

    // حساب السعر النهائي مع دعم العروض
    const isOffer = product.is_offer && product.offer_price && product.offer_price < product.price;
    const finalPrice = isOffer ? product.offer_price : (product.discount_price || product.price);

    // الكمية المطلوبة = طول مصفوفة الألوان أو المقاسات أو 1
    const requestedQuantity = Math.max(
      sizes?.length || 0,
      colors?.length || 0,
      1
    );

    setItems((prev) => {
      // البحث عن منتج بنفس ID
      const existing = prev.find((item) => item.id === product.id);
      
      if (existing) {
        const newQuantity = existing.quantity + requestedQuantity;
        if (newQuantity > currentStock) {
          toast.error(`عذراً، الحد الأقصى المتاح هو ${currentStock} قطعة فقط`);
          return prev;
        }
        toast.success('تم زيادة الكمية');
        return prev.map((item) =>
          item.id === product.id
            ? { 
                ...item, 
                quantity: newQuantity, 
                maxStock: currentStock,
                selectedSizes: [...(item.selectedSizes || []), ...(sizes || [])],
                selectedColors: [...(item.selectedColors || []), ...(colors || [])],
              }
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
          discount_price: finalPrice,
          image_url: product.product_images?.[0]?.image_url || product.image_url,
          quantity: requestedQuantity,
          maxStock: currentStock,
          selectedSizes: sizes || [],
          selectedColors: colors || [],
          size_options: product.size_options || [],
          color_options: product.color_options || [],
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
      prev.map((item) => {
        if (item.id === id) {
          // تقليل المقاسات والألوان إذا تم تقليل الكمية
          const newSizes = (item.selectedSizes || []).slice(0, quantity);
          const newColors = (item.selectedColors || []).slice(0, quantity);
          return { ...item, quantity, maxStock: currentStock, selectedSizes: newSizes, selectedColors: newColors };
        }
        return item;
      })
    );
  };

  const updateItemOptions = (id: string, sizes?: string[], colors?: string[]) => {
    setItems((prev) =>
      prev.map((item) => 
        item.id === id 
          ? { 
              ...item, 
              selectedSizes: sizes !== undefined ? sizes : item.selectedSizes,
              selectedColors: colors !== undefined ? colors : item.selectedColors,
            } 
          : item
      )
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
      value={{ items, addToCart, removeFromCart, updateQuantity, updateItemOptions, clearCart, totalAmount, refreshStock }}
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
