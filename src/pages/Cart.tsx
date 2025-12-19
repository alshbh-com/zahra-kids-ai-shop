import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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
import { CartSuggestion } from "@/components/CartSuggestion";
import { ExitRescueModal } from "@/components/ExitRescueModal";

const Cart = () => {
  const navigate = useNavigate();
  const { items: cart, updateQuantity, removeFromCart, clearCart, totalAmount, refreshStock } = useCart();
  const [customerName, setCustomerName] = useState("");

  // تحديث المخزون عند فتح السلة
  useEffect(() => {
    refreshStock();
  }, []);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedGovernorate, setSelectedGovernorate] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);
  const [wheelDiscount, setWheelDiscount] = useState<{discount: number, minOrder: number} | null>(null);
  const [exitDiscount, setExitDiscount] = useState(0);

  // Check for wheel discount
  useEffect(() => {
    const savedDiscount = localStorage.getItem('wheelDiscount');
    if (savedDiscount) {
      try {
        setWheelDiscount(JSON.parse(savedDiscount));
      } catch (e) {
        console.error('Error parsing wheel discount:', e);
      }
    }
  }, []);

  // جلب المحافظات من قاعدة البيانات
  const { data: governorates = [] } = useQuery({
    queryKey: ["governorates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("governorates")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    }
  });

  // إنشاء خريطة أسعار الشحن من قاعدة البيانات
  const shippingPrices: Record<string, number> = governorates.reduce((acc: Record<string, number>, gov) => {
    acc[gov.name] = gov.shipping_cost;
    return acc;
  }, {});

  const shippingCost = selectedGovernorate ? shippingPrices[selectedGovernorate] || 0 : 0;
  
  // Calculate wheel discount
  const appliedWheelDiscount = wheelDiscount && totalAmount >= wheelDiscount.minOrder ? wheelDiscount.discount : 0;
  // Calculate exit rescue discount (real 2%)
  const appliedExitDiscount = exitDiscount > 0 ? Math.round(totalAmount * 0.02) : 0;
  const finalTotal = totalAmount + shippingCost - appliedWheelDiscount - appliedExitDiscount;

  // Handle exit rescue discount acceptance
  const handleExitDiscountAccept = () => {
    setExitDiscount(2);
  };

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
          total_amount: orderData.productsTotal,
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
        product_details: item.name,
        color: item.colors?.length > 0 ? item.colors.join(', ') : null,
        size: item.sizes?.length > 0 ? item.sizes.join(', ') : null
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);
      
      if (itemsError) throw itemsError;

      // رابعاً: تقليل المخزون من المنتجات
      for (const item of orderData.items) {
        const { data: product } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.id)
          .single();
        
        if (product) {
          await supabase
            .from("products")
            .update({ stock: Math.max(0, (product.stock || 0) - item.quantity) })
            .eq("id", item.id);
        }
      }

      return order;
    },
    onSuccess: () => {
      setShowThankYou(true);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      console.error("Order error:", error);
      toast.error("حدث خطأ في إرسال الطلب");
    },
  });

  const handleThankYouComplete = () => {
    const itemsDetails = cart.map((item, index) => {
      let details = `${index + 1}. *${item.name}*\n   • الكمية: ${item.quantity}`;
      if (item.selectedColors && item.selectedColors.length > 0) {
        details += `\n   • الألوان: ${item.selectedColors.join(', ')}`;
      }
      if (item.selectedSizes && item.selectedSizes.length > 0) {
        details += `\n   • المقاسات: ${item.selectedSizes.join(', ')}`;
      }
      details += `\n   • السعر للقطعة: ${item.discount_price || item.price} جنيه`;
      details += `\n   • الإجمالي: ${(item.discount_price || item.price) * item.quantity} جنيه`;
      return details;
    }).join('\n');

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
${itemsDetails}

💰 *الملخص المالي:*
━━━━━━━━━━━━━━━━━━
• المنتجات: ${totalAmount} جنيه
• الشحن: ${shippingCost} جنيه${appliedWheelDiscount > 0 ? `\n• 🎁 خصم عجلة الحظ: -${appliedWheelDiscount} جنيه` : ''}${appliedExitDiscount > 0 ? `\n• 🎁 خصم خاص: -${appliedExitDiscount} جنيه` : ''}
• *الإجمالي النهائي: ${finalTotal} جنيه* 💵

${notes ? `📝 *ملاحظات العميل:*\n${notes}\n` : ''}
═══════════════════════
✨ *شكراً لثقتكم في متجر زهرة* ✨
    `.trim();

    const whatsappUrl = `https://wa.me/201033050236?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    // Clear wheel discount after use
    if (appliedWheelDiscount > 0) {
      localStorage.removeItem('wheelDiscount');
    }

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
        name: item.name,
        quantity: item.quantity,
        price: item.discount_price || item.price,
        colors: item.selectedColors || [],
        sizes: item.selectedSizes || []
      })),
      productsTotal: totalAmount,
      shipping: shippingCost
    });
  };

  if (showThankYou) {
    return <ThankYou3D onComplete={handleThankYouComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pb-24">
      {/* Exit Rescue Modal */}
      <ExitRescueModal 
        onAcceptDiscount={handleExitDiscountAccept} 
        cartHasItems={cart.length > 0} 
      />
      
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
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.name_en}</p>
                        
                        {/* عرض الألوان والمقاسات المختارة */}
                        {((item.selectedColors && item.selectedColors.length > 0) || (item.selectedSizes && item.selectedSizes.length > 0)) && (
                          <div className="flex flex-wrap gap-2 mt-2 text-xs">
                            {item.selectedColors && item.selectedColors.length > 0 && (
                              <span className="bg-primary/10 text-primary px-2 py-1 rounded-full">
                                الألوان: {item.selectedColors.join(', ')}
                              </span>
                            )}
                            {item.selectedSizes && item.selectedSizes.length > 0 && (
                              <span className="bg-secondary/50 text-secondary-foreground px-2 py-1 rounded-full">
                                المقاسات: {item.selectedSizes.join(', ')}
                              </span>
                            )}
                          </div>
                        )}
                        
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

            {/* اقتراح منتج */}
            {cart.length > 0 && (
              <CartSuggestion cartProductIds={cart.map(item => item.id)} />
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
                      {governorates.map((gov) => (
                        <SelectItem key={gov.id} value={gov.name}>
                          {gov.name} - {gov.shipping_cost} جنيه
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
                    {appliedWheelDiscount > 0 && (
                      <div className="flex justify-between text-base text-green-600">
                        <span>🎁 خصم عجلة الحظ:</span>
                        <span>-{appliedWheelDiscount} جنيه</span>
                      </div>
                    )}
                    {appliedExitDiscount > 0 && (
                      <div className="flex justify-between text-base text-green-600">
                        <span>🎁 خصم خاص:</span>
                        <span>-{appliedExitDiscount} جنيه</span>
                      </div>
                    )}
                    {wheelDiscount && totalAmount < wheelDiscount.minOrder && (
                      <div className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                        💡 أضف منتجات بقيمة {wheelDiscount.minOrder - totalAmount} جنيه للحصول على خصم {wheelDiscount.discount} جنيه!
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
