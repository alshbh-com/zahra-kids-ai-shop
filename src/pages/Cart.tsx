import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

interface CartItem {
  id: string;
  product: any;
  quantity: number;
  size?: string;
  color?: string;
}

const Cart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");

  const queryClient = useQueryClient();

  const updateQuantity = (itemId: string, change: number) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeItem = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
    toast.success("تم حذف المنتج من السلة");
  };

  const totalAmount = cart.reduce((sum, item) => {
    const price = item.product.discount_price || item.product.price;
    return sum + (price * item.quantity);
  }, 0);

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const { data, error } = await supabase
        .from("orders")
        .insert([orderData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: async (order) => {
      // Create WhatsApp message
      const message = `
🛍️ *طلب جديد من متجر زهرة* 🛍️

📋 رقم الطلب: #${order.order_number}

👤 *معلومات العميل:*
الاسم: ${customerName}
الهاتف: ${customerPhone}
${customerEmail ? `البريد: ${customerEmail}` : ''}
العنوان: ${customerAddress}

🛒 *تفاصيل الطلب:*
${cart.map(item => `
• ${item.product.name_ar}
  الكمية: ${item.quantity}
  ${item.size ? `المقاس: ${item.size}` : ''}
  ${item.color ? `اللون: ${item.color}` : ''}
  السعر: ${(item.product.discount_price || item.product.price) * item.quantity} جنيه
`).join('\n')}

💰 *الإجمالي: ${totalAmount} جنيه*

${notes ? `📝 ملاحظات: ${notes}` : ''}
      `.trim();

      const whatsappUrl = `https://wa.me/201033050236?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      // Clear cart and form
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setCustomerEmail("");
      setNotes("");

      toast.success("تم إرسال طلبك بنجاح! ✅");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      console.error("Order error:", error);
      toast.error("حدث خطأ في إرسال الطلب");
    },
  });

  const handleSubmitOrder = () => {
    if (!customerName || !customerPhone || !customerAddress) {
      toast.error("برجاء ملء جميع البيانات المطلوبة");
      return;
    }

    if (cart.length === 0) {
      toast.error("السلة فارغة!");
      return;
    }

    const orderData = {
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: customerAddress,
      customer_email: customerEmail || null,
      notes: notes || null,
      items: cart.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name_ar,
        quantity: item.quantity,
        price: item.product.discount_price || item.product.price,
        size: item.size,
        color: item.color,
      })),
      total_amount: totalAmount,
      status: "pending",
    };

    createOrderMutation.mutate(orderData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pb-24">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">سلة التسوق</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-lg text-muted-foreground">السلة فارغة</p>
                  <p className="text-sm text-muted-foreground mt-2">ابدأ التسوق الآن!</p>
                </CardContent>
              </Card>
            ) : (
              cart.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={item.product.product_images?.[0]?.image_url || "/placeholder.svg"}
                        alt={item.product.name_ar}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.product.name_ar}</h3>
                        <p className="text-sm text-muted-foreground">{item.product.name_en}</p>
                        {item.size && <p className="text-sm">المقاس: {item.size}</p>}
                        {item.color && <p className="text-sm">اللون: {item.color}</p>}
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-2 border rounded-lg p-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, -1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <span className="font-bold text-lg text-primary">
                            {((item.product.discount_price || item.product.price) * item.quantity).toFixed(2)} جنيه
                          </span>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="mr-auto"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Order Form */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>معلومات الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">الاسم *</label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="أدخل اسمك"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">رقم الهاتف *</label>
                  <Input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="01xxxxxxxxx"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">البريد الإلكتروني</label>
                  <Input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">العنوان *</label>
                  <Textarea
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="أدخل عنوانك بالتفصيل"
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">ملاحظات</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="أي ملاحظات إضافية؟"
                    className="mt-1"
                    rows={2}
                  />
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between text-lg font-bold mb-4">
                    <span>الإجمالي:</span>
                    <span className="text-primary">{totalAmount.toFixed(2)} جنيه</span>
                  </div>
                  <Button
                    className="w-full text-lg py-6"
                    onClick={handleSubmitOrder}
                    disabled={createOrderMutation.isPending || cart.length === 0}
                  >
                    {createOrderMutation.isPending ? "جاري الإرسال..." : "إرسال الطلب عبر واتساب 📱"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
