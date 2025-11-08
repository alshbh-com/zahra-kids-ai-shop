import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload } from "lucide-react";
import { toast } from "sonner";

export const ProductManager = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name_ar: "",
    name_en: "",
    description_ar: "",
    description_en: "",
    price: "",
    discount_price: "",
    category_id: "",
    stock_quantity: "",
  });
  const [images, setImages] = useState<File[]>([]);

  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`*, product_images(*)`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      // Insert product
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert([productData])
        .select()
        .single();

      if (productError) throw productError;

      // Upload images
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const fileName = `${product.id}/${Date.now()}_${file.name}`;
          
          const { error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from("product-images")
            .getPublicUrl(fileName);

          await supabase.from("product_images").insert([{
            product_id: product.id,
            image_url: publicUrl,
            display_order: i,
          }]);
        }
      }

      return product;
    },
    onSuccess: () => {
      toast.success("تم إضافة المنتج بنجاح!");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setIsAdding(false);
      setFormData({
        name_ar: "",
        name_en: "",
        description_ar: "",
        description_en: "",
        price: "",
        discount_price: "",
        category_id: "",
        stock_quantity: "",
      });
      setImages([]);
    },
    onError: (error) => {
      console.error("Error adding product:", error);
      toast.error("حدث خطأ في إضافة المنتج");
    },
  });

  const handleSubmit = () => {
    if (!formData.name_ar || !formData.price) {
      toast.error("برجاء ملء الاسم بالعربي والسعر");
      return;
    }

    if (editingProduct) {
      updateProductMutation.mutate({
        id: editingProduct.id,
        ...formData,
        price: parseFloat(formData.price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : 0,
      });
    } else {
      addProductMutation.mutate({
        name_ar: formData.name_ar,
        name_en: formData.name_en || formData.name_ar,
        description_ar: formData.description_ar || null,
        description_en: formData.description_en || null,
        price: parseFloat(formData.price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        category_id: formData.category_id || null,
        stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : 0,
      });
    }
  };

  const updateProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const { id, ...updateData } = productData;
      const { data, error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("تم تحديث المنتج بنجاح!");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setEditingProduct(null);
      setIsAdding(false);
      setFormData({
        name_ar: "",
        name_en: "",
        description_ar: "",
        description_en: "",
        price: "",
        discount_price: "",
        category_id: "",
        stock_quantity: "",
      });
    },
    onError: (error) => {
      console.error("Error updating product:", error);
      toast.error("حدث خطأ في تحديث المنتج");
    },
  });

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsAdding(true);
    setFormData({
      name_ar: product.name_ar || "",
      name_en: product.name_en || "",
      description_ar: product.description_ar || "",
      description_en: product.description_en || "",
      price: product.price?.toString() || "",
      discount_price: product.discount_price?.toString() || "",
      category_id: product.category_id || "",
      stock_quantity: product.stock_quantity?.toString() || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setIsAdding(false);
    setFormData({
      name_ar: "",
      name_en: "",
      description_ar: "",
      description_en: "",
      price: "",
      discount_price: "",
      category_id: "",
      stock_quantity: "",
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة المنتجات</h2>
        <Button onClick={() => { 
          if (isAdding && !editingProduct) {
            setIsAdding(false);
          } else {
            handleCancelEdit();
            setIsAdding(!isAdding);
          }
        }}>
          <Plus className="w-4 h-4 ml-2" />
          {isAdding ? "إلغاء" : "إضافة منتج"}
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>{editingProduct ? "تعديل المنتج" : "منتج جديد"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">الاسم بالعربي *</label>
                <Input
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  placeholder="فستان أطفال"
                />
              </div>
              <div>
                <label className="text-sm font-medium">الاسم بالإنجليزي</label>
                <Input
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="Kids Dress (اختياري)"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">الوصف بالعربي</label>
                <Textarea
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  placeholder="وصف المنتج"
                />
              </div>
              <div>
                <label className="text-sm font-medium">الوصف بالإنجليزي</label>
                <Textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  placeholder="Product description"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">السعر *</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="299"
                />
              </div>
              <div>
                <label className="text-sm font-medium">سعر الخصم</label>
                <Input
                  type="number"
                  value={formData.discount_price}
                  onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                  placeholder="249"
                />
              </div>
              <div>
                <label className="text-sm font-medium">الكمية</label>
                <Input
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  placeholder="50"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">الفئة (اختياري)</label>
              <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name_ar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">صور المنتج</label>
              <div className="mt-2">
                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {images.length > 0 ? `${images.length} صورة محددة` : "اختر صور"}
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={addProductMutation.isPending}>
                {addProductMutation.isPending ? "جاري الحفظ..." : "حفظ المنتج"}
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products?.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-4">
              <img
                src={product.product_images?.[0]?.image_url || "/placeholder.svg"}
                alt={product.name_ar}
                className="w-full h-48 object-cover rounded-lg mb-3"
              />
              <h3 className="font-semibold">{product.name_ar}</h3>
              <p className="text-sm text-muted-foreground">{product.name_en}</p>
              <p className="text-lg font-bold text-primary mt-2">{product.price} جنيه</p>
              <p className="text-sm text-muted-foreground">المخزن: {product.stock_quantity}</p>
              <Button
                onClick={() => handleEdit(product)}
                className="w-full mt-3"
                variant="outline"
                size="sm"
              >
                تعديل المنتج
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
