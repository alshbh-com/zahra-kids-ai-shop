import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductManager } from "./admin/ProductManager";
import { OfferManager } from "./admin/OfferManager";
import { OrdersView } from "./admin/OrdersView";

export const AdminDashboard = () => {
  return (
    <Tabs defaultValue="products" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="products">المنتجات</TabsTrigger>
        <TabsTrigger value="offers">العروض</TabsTrigger>
        <TabsTrigger value="orders">الطلبات</TabsTrigger>
      </TabsList>

      <TabsContent value="products" className="mt-6">
        <ProductManager />
      </TabsContent>

      <TabsContent value="offers" className="mt-6">
        <OfferManager />
      </TabsContent>

      <TabsContent value="orders" className="mt-6">
        <OrdersView />
      </TabsContent>
    </Tabs>
  );
};
