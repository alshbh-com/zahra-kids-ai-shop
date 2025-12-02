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
import { ThankYou3D } from "@/components/ThankYou3D";

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
  const [showThankYou, setShowThankYou] = useState(false);

  const shippingCost = selectedGovernorate ? shippingPrices[selectedGovernorate] || 0 : 0;
  const finalTotal = totalAmount + shippingCost;

  const queryClient = useQueryClient();

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      // أولاً: إنشاء العميل
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .insert([{
          name: orderData.customerName,
          phone: orderData.customerPhone,
          address: orderData.customerAddress,
          governorate: orderData.governorate
        }])
        .select()
        .single();
      
      if (customerError) throw customerError;

      // ثانياً: إنشاء الطلب
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([{
          customer_id: customer.id,
          total_amount: orderData.total,
          shipping_cost: orderData.shipping,
          notes: orderData.notes,
          order_details: JSON.stringify(orderData.items)
        }])
        .select()
        .single();
      
      if (orderError) throw orderError;

      // ثالثاً: إنشاء order_items
      const orderItems = orderData.items.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        product_details: item.name_ar
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);
      
      if (itemsError) throw itemsError;

      return order;
    },
    onSuccess: (order) => {
      // عرض صفحة الشكر 3D
      setShowThankYou(true);
    },
    onError: (error) => {
      console.error("Order error:", error);
      toast.error("حدث خطأ في إرسال الطلب");
    },
  });

  const handleThankYouComplete = () => {
    // بعد 5 ثواني، افتح واتساب برسالة منظمة
    const message = `
═══════════════════════
🛍️ *طلب جديد من متجر زهرة* 🛍️
═══════════════════════

👤 *معلومات العميل:*
━━━━━━━━━━━━━━━━━━
📛 الاسم: ${customerName}
📞 الهاتف: ${customerPhone}
${customerEmail ? `📧 البريد: ${customerEmail}\n` : ''}📍 العنوان: ${customerAddress}
🗺️ المحافظة: ${selectedGovernorate}

🛒 *تفاصيل الطلب:*
━━━━━━━━━━━━━━━━━━
${cart.map((item, index) => `
${index + 1}. *${item.name_ar}*
   • الكمية: ${item.quantity}
   • السعر للقطعة: ${item.discount_price || item.price} جنيه
   • الإجمالي: ${(item.discount_price || item.price) * item.quantity} جنيه
`).join('')}

💰 *الملخص المالي:*
━━━━━━━━━━━━━━━━━━
• المنتجات: ${totalAmount} جنيه
• الشحن: ${shippingCost} جنيه
• *الإجمالي النهائي: ${finalTotal} جنيه* 💵

${notes ? `📝 *ملاحظات العميل:*\n${notes}\n` : ''}
═══════════════════════
✨ *شكراً لثقتكم في متجر زهرة* ✨
    `.trim();

    const whatsappUrl = `https://wa.me/201033050236?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    // مسح السلة والبيانات
    clearCart();
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setCustomerEmail("");
    setNotes("");
    setSelectedGovernorate("");
    setShowThankYou(false);

    toast.success("تم إرسال طلبك بنجاح! ✅");
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    navigate("/");
  };

  const handleSubmitOrder = () => {
    if (!customerName || !customerPhone || !customerAddress || !selectedGovernorate) {
      toast.error("برجاء ملء جميع البيانات المطلوبة بما في ذلك المحافظة");
      return;
    }

    if (cart.length === 0) {
      toast.error("السلة فارغة!");
      return;
    }

    createOrderMutation.mutate({
      customerName,
      customerPhone,
      customerAddress,
      governorate: selectedGovernorate,
      notes: notes || null,
      items: cart.map(item => ({
        id: item.id,
        name_ar: item.name_ar,
        quantity: item.quantity,
        price: item.discount_price || item.price
      })),
      total: finalTotal,
      shipping: shippingCost
    });
  };

  if (showThankYou) {
    return <ThankYou3D onComplete={handleThankYouComplete} />;
  }

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
                    {createOrderMutation.isPending ? "جاري الإرسال..." : "إكمال الطلب"}
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
