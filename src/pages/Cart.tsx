import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus, Trash2, ShoppingBag, Package, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";

const shippingPrices: Record<string, number> = {
  "القاهرة": 55,
  "الجيزة": 55,
  "القليوبية": 60,
  "الغربية": 65,
  "المنوفية": 65,
  "كفر الشيخ": 65,
  "الإسكندرية": 65,
  "الدقهلية": 65,
  "المنصورة": 65,
  "أجا": 65,
  "السنبلاوين": 65,
  "دمياط": 65,
  "الشرقية": 65,
  "بورسعيد": 65,
  "الإسماعيلية": 65,
  "السويس": 65,
  "الفيوم": 65,
  "البحيرة": 75,
  "بني سويف": 70,
  "المنيا": 70,
  "مرسى مطروح": 80,
  "البحر الأحمر": 85,
  "سوهاج": 70,
  "أسيوط": 70,
  "قنا": 70,
  "الغردقة": 85,
  "الأقصر": 70,
  "أسوان": 70,
  "الوادي الجديد": 85,
  "شمال سيناء": 100,
  "جنوب سيناء": 100,
  "الساحل الشمالي": 85,
  "برج العرب": 70,
};

const Cart = () => {
  const navigate = useNavigate();
  const { items: cart, updateQuantity, removeFromCart, clearCart, totalAmount } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedGovernorate, setSelectedGovernorate] = useState("");

  const shippingCost = selectedGovernorate ? shippingPrices[selectedGovernorate] || 0 : 0;
  const finalTotal = totalAmount + shippingCost;

  const queryClient = useQueryClient();

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
المحافظة: ${selectedGovernorate}

🛒 *تفاصيل الطلب:*
${cart.map(item => `
• ${item.name_ar}
  الكمية: ${item.quantity}
  السعر: ${(item.discount_price || item.price) * item.quantity} جنيه
`).join('\n')}

💰 *المبلغ الإجمالي للمنتجات: ${totalAmount} جنيه*
🚚 *تكلفة الشحن: ${shippingCost} جنيه*
💵 *الإجمالي الكلي: ${finalTotal} جنيه*

${notes ? `📝 ملاحظات: ${notes}` : ''}
      `.trim();

      const whatsappUrl = `https://wa.me/201033050236?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      // Clear cart and form
      clearCart();
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setCustomerEmail("");
      setNotes("");
      setSelectedGovernorate("");

      toast.success("تم إرسال طلبك بنجاح! ✅");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      console.error("Order error:", error);
      toast.error("حدث خطأ في إرسال الطلب");
    },
  });

  const handleSubmitOrder = () => {
    if (!customerName || !customerPhone || !customerAddress || !selectedGovernorate) {
      toast.error("برجاء ملء جميع البيانات المطلوبة بما في ذلك المحافظة");
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
        product_id: item.id,
        product_name: item.name_ar,
        quantity: item.quantity,
        price: item.discount_price || item.price,
      })),
      total_amount: finalTotal,
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
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.name_ar}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.name_ar}</h3>
                        <p className="text-sm text-muted-foreground">{item.name_en}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-2 border rounded-lg p-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <span className="font-bold text-lg text-primary">
                            {((item.discount_price || item.price) * item.quantity).toFixed(2)} جنيه
                          </span>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="mr-auto"
                            onClick={() => removeFromCart(item.id)}
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
                  <label className="text-sm font-medium">المحافظة *</label>
                  <Select value={selectedGovernorate} onValueChange={setSelectedGovernorate}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="اختر المحافظة" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(shippingPrices).sort().map((gov) => (
                        <SelectItem key={gov} value={gov}>
                          {gov} - {shippingPrices[gov]} جنيه
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-base">
                      <span>المنتجات:</span>
                      <span>{totalAmount.toFixed(2)} جنيه</span>
                    </div>
                    {shippingCost > 0 && (
                      <div className="flex justify-between text-base text-primary">
                        <span>الشحن ({selectedGovernorate}):</span>
                        <span>{shippingCost} جنيه</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>الإجمالي الكلي:</span>
                      <span className="text-primary">{finalTotal.toFixed(2)} جنيه</span>
                    </div>
                  </div>
                  <Button
                    className="w-full text-lg py-6"
                    onClick={handleSubmitOrder}
                    disabled={createOrderMutation.isPending || cart.length === 0}
                  >
                    {createOrderMutation.isPending ? "جاري الإرسال..." : "إرسال الطلب عبر واتساب 📱"}
                  </Button>
                  
                  {/* Policy Links */}
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate("/shipping-policy")}
                    >
                      <Package className="w-4 h-4 ml-1" />
                      سياسة الشحن
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate("/return-policy")}
                    >
                      <RefreshCw className="w-4 h-4 ml-1" />
                      سياسة الاستبدال
                    </Button>
                  </div>
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
