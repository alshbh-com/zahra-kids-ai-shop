import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

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
            product_details
          )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">الطلبات</h2>

      <div className="space-y-4">
        {orders?.map((order) => {
          const customer = order.customers as any;
          const items = (order.order_items as any[]) || [];
          
          return (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">طلب #{order.order_number}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.created_at || ""), "dd MMMM yyyy - HH:mm", { locale: ar })}
                    </p>
                  </div>
                  <Badge variant={order.status === "pending" ? "secondary" : "default"}>
                    {order.status === "pending" ? "قيد الانتظار" : order.status}
                  </Badge>
                </div>

                {customer && (
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">العميل</p>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm">{customer.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">العنوان</p>
                      <p className="text-sm">{customer.address}</p>
                      {customer.governorate && (
                        <p className="text-sm text-muted-foreground">المحافظة: {customer.governorate}</p>
                      )}
                    </div>
                  </div>
                )}

                {order.notes && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">ملاحظات</p>
                    <p className="text-sm">{order.notes}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">المنتجات</p>
                  <div className="space-y-2">
                    {items.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.product_details || 'منتج'} × {item.quantity}
                        </span>
                        <span className="font-medium">{item.price * item.quantity} جنيه</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t">
                    <span>الإجمالي</span>
                    <span className="text-primary">{order.total_amount} جنيه</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {orders?.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            لا توجد طلبات حالياً
          </div>
        )}
      </div>
    </div>
  );
};
