import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Package, User, MapPin, Phone, FileText, Truck } from "lucide-react";

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  processing: "قيد التجهيز",
  shipped: "تم الشحن",
  delivered: "تم التوصيل",
  cancelled: "ملغي",
  returned: "مرتجع"
};

export const OrdersView = () => {
  const { data: orders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          customers (
            name,
            phone,
            address,
            governorate
          ),
          order_items (
            id,
            quantity,
            price,
            size,
            color,
            product_details,
            products (
              name,
              name_ar
            )
          )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">الطلبات ({orders?.length || 0})</h2>

      <div className="space-y-4">
        {orders?.map((order) => {
          const customer = order.customers as any;
          const items = (order.order_items as any[]) || [];
          const productsTotal = Number(order.total_amount) || 0;
          const shippingCost = Number(order.shipping_cost) || 0;
          const grandTotal = productsTotal + shippingCost;
          
          return (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Header */}
                <div className="bg-muted/50 p-4 flex justify-between items-center border-b">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">طلب #{order.order_number}</h3>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.created_at || ""), "dd MMMM yyyy - hh:mm a", { locale: ar })}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={order.status === "pending" ? "secondary" : order.status === "delivered" ? "default" : "outline"}
                    className="text-sm"
                  >
                    {statusLabels[order.status || "pending"] || order.status}
                  </Badge>
                </div>

                <div className="p-4 space-y-4">
                  {/* Customer Info */}
                  {customer && (
                    <div className="grid md:grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">العميل</p>
                          <p className="font-semibold">{customer.name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">الهاتف</p>
                          <p className="font-medium" dir="ltr">{customer.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 md:col-span-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">العنوان</p>
                          <p className="text-sm">{customer.address}</p>
                          {customer.governorate && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              {customer.governorate}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {order.notes && (
                    <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <FileText className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-yellow-700 dark:text-yellow-400">ملاحظات العميل</p>
                        <p className="text-sm">{order.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Products */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 px-3 py-2 border-b">
                      <p className="text-sm font-semibold">المنتجات ({items.length})</p>
                    </div>
                    <div className="divide-y">
                      {items.map((item: any, index: number) => {
                        const productName = item.product_details || item.products?.name_ar || item.products?.name || `منتج ${index + 1}`;
                        return (
                        <div key={item.id} className="p-3 flex justify-between items-center">
                          <div className="flex-1">
                            <p className="font-medium">{productName}</p>
                            <div className="flex gap-2 mt-1 flex-wrap">
                              <Badge variant="secondary" className="text-xs">
                                الكمية: {item.quantity}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                السعر: {item.price} جنيه
                              </Badge>
                              {item.size && (
                                <Badge variant="outline" className="text-xs">
                                  المقاسات: {item.size}
                                </Badge>
                              )}
                              {item.color && (
                                <Badge variant="outline" className="text-xs">
                                  الألوان: {item.color}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="font-bold text-primary">
                            {(item.price * item.quantity).toFixed(2)} جنيه
                          </p>
                        </div>
                      );})}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="bg-primary/5 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">إجمالي المنتجات:</span>
                      <span className="font-medium">{productsTotal.toFixed(2)} جنيه</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Truck className="w-4 h-4" />
                        تكلفة الشحن:
                      </span>
                      <span className="font-medium">{shippingCost.toFixed(2)} جنيه</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-primary/20">
                      <span>الإجمالي الكلي:</span>
                      <span className="text-primary">{grandTotal.toFixed(2)} جنيه</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {orders?.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>لا توجد طلبات حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
};
