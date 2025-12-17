import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Palette, Save, X } from "lucide-react";
import { toast } from "sonner";

interface ColorVariant {
  id: string;
  product_id: string;
  color: string;
  sizes: string[];
  stock: number;
}

export const ColorVariantManager = () => {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [newColor, setNewColor] = useState("");
  const [newSizes, setNewSizes] = useState("");
  const [newStock, setNewStock] = useState("");
  const [editingVariant, setEditingVariant] = useState<ColorVariant | null>(null);

  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ["admin-products-for-variants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name_ar, name")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: variants, isLoading: variantsLoading } = useQuery({
    queryKey: ["color-variants", selectedProductId],
    queryFn: async () => {
      if (!selectedProductId) return [];
      const { data, error } = await supabase
        .from("product_color_variants")
        .select("*")
        .eq("product_id", selectedProductId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as ColorVariant[];
    },
    enabled: !!selectedProductId,
  });

  const addVariantMutation = useMutation({
    mutationFn: async (variantData: { product_id: string; color: string; sizes: string[]; stock: number }) => {
      const { data, error } = await supabase
        .from("product_color_variants")
        .insert([variantData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("تم إضافة اللون بنجاح!");
      queryClient.invalidateQueries({ queryKey: ["color-variants", selectedProductId] });
      resetForm();
    },
    onError: (error: any) => {
      if (error.code === "23505") {
        toast.error("هذا اللون موجود بالفعل لهذا المنتج");
      } else {
        toast.error("حدث خطأ في إضافة اللون");
      }
    },
  });

  const updateVariantMutation = useMutation({
    mutationFn: async (variantData: { id: string; color: string; sizes: string[]; stock: number }) => {
      const { id, ...updateData } = variantData;
      const { data, error } = await supabase
        .from("product_color_variants")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("تم تحديث اللون بنجاح!");
      queryClient.invalidateQueries({ queryKey: ["color-variants", selectedProductId] });
      setEditingVariant(null);
      resetForm();
    },
    onError: () => {
      toast.error("حدث خطأ في تحديث اللون");
    },
  });

  const deleteVariantMutation = useMutation({
    mutationFn: async (variantId: string) => {
      const { error } = await supabase
        .from("product_color_variants")
        .delete()
        .eq("id", variantId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم حذف اللون بنجاح!");
      queryClient.invalidateQueries({ queryKey: ["color-variants", selectedProductId] });
    },
    onError: () => {
      toast.error("حدث خطأ في حذف اللون");
    },
  });

  const resetForm = () => {
    setNewColor("");
    setNewSizes("");
    setNewStock("");
  };

  const handleAddVariant = () => {
    if (!selectedProductId) {
      toast.error("برجاء اختيار منتج أولاً");
      return;
    }
    if (!newColor.trim()) {
      toast.error("برجاء إدخال اسم اللون");
      return;
    }

    const sizesArray = newSizes
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);

    if (editingVariant) {
      updateVariantMutation.mutate({
        id: editingVariant.id,
        color: newColor.trim(),
        sizes: sizesArray,
        stock: parseInt(newStock) || 0,
      });
    } else {
      addVariantMutation.mutate({
        product_id: selectedProductId,
        color: newColor.trim(),
        sizes: sizesArray,
        stock: parseInt(newStock) || 0,
      });
    }
  };

  const handleEditVariant = (variant: ColorVariant) => {
    setEditingVariant(variant);
    setNewColor(variant.color);
    setNewSizes(variant.sizes.join(", "));
    setNewStock(variant.stock.toString());
  };

  const handleCancelEdit = () => {
    setEditingVariant(null);
    resetForm();
  };

  const handleDeleteVariant = (variantId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا اللون؟")) {
      deleteVariantMutation.mutate(variantId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          إدارة الألوان والمقاسات والمخزون
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* اختيار المنتج */}
        <div>
          <label className="text-sm font-medium mb-2 block">اختر المنتج</label>
          <Select value={selectedProductId} onValueChange={setSelectedProductId}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="اختر منتج لإدارة ألوانه" />
            </SelectTrigger>
            <SelectContent className="bg-background border z-50">
              {products?.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name_ar || product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedProductId && (
          <>
            {/* إضافة لون جديد */}
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium">{editingVariant ? "تعديل اللون" : "إضافة لون جديد"}</h4>
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">اللون *</label>
                  <Input
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    placeholder="أحمر، أسود، أبيض..."
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">المقاسات (مفصولة بفاصلة)</label>
                  <Input
                    value={newSizes}
                    onChange={(e) => setNewSizes(e.target.value)}
                    placeholder="S, M, L, XL"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">المخزون</label>
                  <Input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    placeholder="50"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddVariant}
                  disabled={addVariantMutation.isPending || updateVariantMutation.isPending}
                  size="sm"
                >
                  {editingVariant ? <Save className="w-4 h-4 ml-2" /> : <Plus className="w-4 h-4 ml-2" />}
                  {editingVariant ? "حفظ التعديلات" : "إضافة اللون"}
                </Button>
                {editingVariant && (
                  <Button onClick={handleCancelEdit} variant="outline" size="sm">
                    <X className="w-4 h-4 ml-2" />
                    إلغاء
                  </Button>
                )}
              </div>
            </div>

            {/* قائمة الألوان */}
            <div className="space-y-3">
              <h4 className="font-medium">الألوان المتاحة</h4>
              {variantsLoading ? (
                <p className="text-muted-foreground text-sm">جاري التحميل...</p>
              ) : variants && variants.length > 0 ? (
                <div className="space-y-2">
                  {variants.map((variant) => (
                    <div
                      key={variant.id}
                      className={`flex items-center justify-between p-3 border rounded-lg ${
                        variant.stock === 0 ? "bg-destructive/10 border-destructive/30" : "bg-background"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={variant.stock === 0 ? "opacity-50 line-through" : ""}
                        >
                          {variant.color}
                        </Badge>
                        <div className="text-sm">
                          <span className="text-muted-foreground">المقاسات: </span>
                          {variant.sizes.length > 0 ? (
                            variant.sizes.map((size, i) => (
                              <Badge key={i} variant="secondary" className="text-xs mr-1">
                                {size}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">لم يتم تحديد مقاسات</span>
                          )}
                        </div>
                        <Badge
                          className={
                            variant.stock === 0
                              ? "bg-destructive text-destructive-foreground"
                              : variant.stock <= 5
                              ? "bg-orange-500"
                              : "bg-green-500"
                          }
                        >
                          مخزون: {variant.stock}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditVariant(variant)}
                        >
                          تعديل
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteVariant(variant.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">لا توجد ألوان مضافة لهذا المنتج</p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
