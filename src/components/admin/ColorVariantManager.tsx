import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Palette, Save, X } from "lucide-react";
import { toast } from "sonner";

interface SizePrice {
  size: string;
  extra_price: number;
}

interface ColorVariant {
  id: string;
  product_id: string;
  color: string;
  sizes: string[];
  stock: number;
  size_prices?: SizePrice[];
}

export const ColorVariantManager = () => {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [newStock, setNewStock] = useState("");
  const [sizes, setSizes] = useState<SizePrice[]>([]);
  const [newSizeName, setNewSizeName] = useState("");
  const [newSizePrice, setNewSizePrice] = useState("");
  const [editingVariant, setEditingVariant] = useState<ColorVariant | null>(null);

  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ["admin-products-for-variants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name_ar, name, color_options")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const selectedProduct = products?.find(p => p.id === selectedProductId);
  const availableColors: string[] = selectedProduct?.color_options || [];

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
      return (data || []).map(item => ({
        ...item,
        size_prices: (Array.isArray(item.size_prices) ? item.size_prices : []) as unknown as SizePrice[]
      })) as ColorVariant[];
    },
    enabled: !!selectedProductId,
  });

  // الألوان المضافة بالفعل
  const usedColors = variants?.map(v => v.color) || [];
  // الألوان المتاحة للإضافة
  const colorsToAdd = availableColors.filter(c => !usedColors.includes(c));

  const addVariantMutation = useMutation({
    mutationFn: async (variantData: { product_id: string; color: string; sizes: string[]; stock: number; size_prices: SizePrice[] }) => {
      const { data, error } = await supabase
        .from("product_color_variants")
        .insert([{
          product_id: variantData.product_id,
          color: variantData.color,
          sizes: variantData.sizes,
          stock: variantData.stock,
          size_prices: JSON.parse(JSON.stringify(variantData.size_prices))
        }])
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
    mutationFn: async (variantData: { id: string; color: string; sizes: string[]; stock: number; size_prices: SizePrice[] }) => {
      const { id, ...updateData } = variantData;
      const { data, error } = await supabase
        .from("product_color_variants")
        .update({
          color: updateData.color,
          sizes: updateData.sizes,
          stock: updateData.stock,
          size_prices: JSON.parse(JSON.stringify(updateData.size_prices))
        })
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
    setSelectedColor("");
    setNewStock("");
    setSizes([]);
    setNewSizeName("");
    setNewSizePrice("");
    setEditingVariant(null);
  };

  // إضافة مقاس جديد
  const handleAddSize = () => {
    if (!newSizeName.trim()) {
      toast.error("برجاء إدخال اسم المقاس");
      return;
    }
    if (sizes.some(s => s.size === newSizeName.trim())) {
      toast.error("هذا المقاس موجود بالفعل");
      return;
    }
    setSizes([...sizes, { size: newSizeName.trim(), extra_price: parseInt(newSizePrice) || 0 }]);
    setNewSizeName("");
    setNewSizePrice("");
  };

  // حذف مقاس
  const handleRemoveSize = (sizeToRemove: string) => {
    setSizes(sizes.filter(s => s.size !== sizeToRemove));
  };

  const handleSaveVariant = () => {
    if (!selectedProductId) {
      toast.error("برجاء اختيار منتج أولاً");
      return;
    }
    if (!selectedColor && !editingVariant) {
      toast.error("برجاء اختيار لون");
      return;
    }

    const sizeNames = sizes.map(s => s.size);

    if (editingVariant) {
      updateVariantMutation.mutate({
        id: editingVariant.id,
        color: editingVariant.color,
        sizes: sizeNames,
        stock: parseInt(newStock) || 0,
        size_prices: sizes,
      });
    } else {
      addVariantMutation.mutate({
        product_id: selectedProductId,
        color: selectedColor,
        sizes: sizeNames,
        stock: parseInt(newStock) || 0,
        size_prices: sizes,
      });
    }
  };

  const handleEditVariant = (variant: ColorVariant) => {
    setEditingVariant(variant);
    setSelectedColor(variant.color);
    setNewStock(variant.stock.toString());
    // تحميل المقاسات مع الأسعار
    if (variant.size_prices && variant.size_prices.length > 0) {
      setSizes(variant.size_prices);
    } else {
      // إذا كانت المقاسات موجودة بدون أسعار
      setSizes(variant.sizes.map(s => ({ size: s, extra_price: 0 })));
    }
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
          <Select value={selectedProductId} onValueChange={(val) => { setSelectedProductId(val); resetForm(); }}>
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
            {/* إضافة/تعديل لون */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium">{editingVariant ? `تعديل لون: ${editingVariant.color}` : "إضافة لون جديد"}</h4>
              
              <div className="grid md:grid-cols-2 gap-4">
                {/* اختيار اللون */}
                {!editingVariant && (
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">اللون *</label>
                    {colorsToAdd.length > 0 ? (
                      <Select value={selectedColor} onValueChange={setSelectedColor}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="اختر لون" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border z-50">
                          {colorsToAdd.map((color) => (
                            <SelectItem key={color} value={color}>
                              {color}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-muted-foreground p-2 border rounded bg-background">
                        {availableColors.length === 0 
                          ? "⚠️ لا توجد ألوان مضافة لهذا المنتج من الأدمن الخارجي"
                          : "✅ تم إضافة جميع الألوان المتاحة"}
                      </p>
                    )}
                  </div>
                )}

                {/* المخزون */}
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">المخزون</label>
                  <Input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    placeholder="الكمية المتاحة"
                  />
                </div>
              </div>

              {/* إضافة المقاسات */}
              <div className="space-y-3">
                <label className="text-sm font-medium">المقاسات وأسعارها الإضافية</label>
                
                {/* المقاسات المضافة */}
                {sizes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((sizeItem) => (
                      <Badge
                        key={sizeItem.size}
                        variant="secondary"
                        className="flex items-center gap-2 py-1.5 px-3"
                      >
                        <span>{sizeItem.size}</span>
                        {sizeItem.extra_price > 0 && (
                          <span className="text-green-600 font-bold">+{sizeItem.extra_price}ج</span>
                        )}
                        <button
                          onClick={() => handleRemoveSize(sizeItem.size)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* إضافة مقاس جديد */}
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground">اسم المقاس</label>
                    <Input
                      value={newSizeName}
                      onChange={(e) => setNewSizeName(e.target.value)}
                      placeholder="مثال: XL, XXL, 3 سنين"
                      onKeyPress={(e) => e.key === "Enter" && handleAddSize()}
                    />
                  </div>
                  <div className="w-28">
                    <label className="text-xs text-muted-foreground">زيادة السعر (اختياري)</label>
                    <Input
                      type="number"
                      value={newSizePrice}
                      onChange={(e) => setNewSizePrice(e.target.value)}
                      placeholder="0"
                      onKeyPress={(e) => e.key === "Enter" && handleAddSize()}
                    />
                  </div>
                  <Button onClick={handleAddSize} size="icon" variant="outline" className="shrink-0">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* أزرار الحفظ/الإلغاء */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleSaveVariant}
                  disabled={addVariantMutation.isPending || updateVariantMutation.isPending || (!editingVariant && !selectedColor)}
                >
                  {editingVariant ? <Save className="w-4 h-4 ml-2" /> : <Plus className="w-4 h-4 ml-2" />}
                  {editingVariant ? "حفظ التعديلات" : "إضافة اللون"}
                </Button>
                {editingVariant && (
                  <Button onClick={resetForm} variant="outline">
                    <X className="w-4 h-4 ml-2" />
                    إلغاء
                  </Button>
                )}
              </div>
            </div>

            {/* قائمة الألوان */}
            <div className="space-y-3">
              <h4 className="font-medium">الألوان المتاحة ({variants?.length || 0})</h4>
              {variantsLoading ? (
                <p className="text-muted-foreground text-sm">جاري التحميل...</p>
              ) : variants && variants.length > 0 ? (
                <div className="space-y-2">
                  {variants.map((variant) => (
                    <div
                      key={variant.id}
                      className={`flex flex-col md:flex-row md:items-center justify-between p-3 border rounded-lg gap-3 ${
                        variant.stock === 0 ? "bg-destructive/10 border-destructive/30" : "bg-background"
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge
                          variant="outline"
                          className={`text-base ${variant.stock === 0 ? "opacity-50 line-through" : ""}`}
                        >
                          {variant.color}
                        </Badge>
                        <div className="flex flex-wrap gap-1">
                          {variant.sizes.length > 0 ? (
                            variant.sizes.map((size, i) => {
                              const priceInfo = variant.size_prices?.find(sp => sp.size === size);
                              return (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {size}
                                  {priceInfo && priceInfo.extra_price > 0 && (
                                    <span className="text-green-600 mr-1">+{priceInfo.extra_price}ج</span>
                                  )}
                                </Badge>
                              );
                            })
                          ) : (
                            <span className="text-xs text-muted-foreground">لا توجد مقاسات</span>
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
