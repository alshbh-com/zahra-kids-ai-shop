import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const OfferManager = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);
  const [formData, setFormData] = useState({
    title_ar: "",
    title_en: "",
    description_ar: "",
    description_en: "",
    discount_percentage: "",
    remaining_quantity: "",
    start_date: "",
    end_date: "",
    is_active: true,
  });

  const queryClient = useQueryClient();

  const { data: offers } = useQuery({
    queryKey: ["admin-offers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addOfferMutation = useMutation({
    mutationFn: async (offerData: any) => {
      const { data, error } = await supabase
        .from("offers")
        .insert([offerData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("تم إضافة العرض بنجاح!");
      queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      setIsAdding(false);
      setFormData({
        title_ar: "",
        title_en: "",
        description_ar: "",
        description_en: "",
        discount_percentage: "",
        remaining_quantity: "",
        start_date: "",
        end_date: "",
        is_active: true,
      });
    },
    onError: (error) => {
      console.error("Error adding offer:", error);
      toast.error("حدث خطأ في إضافة العرض");
    },
  });

  const updateOfferMutation = useMutation({
    mutationFn: async (offerData: any) => {
      const { id, ...updateData } = offerData;
      const { data, error } = await supabase
        .from("offers")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("تم تحديث العرض بنجاح!");
      queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      setEditingOffer(null);
      setIsAdding(false);
      setFormData({
        title_ar: "",
        title_en: "",
        description_ar: "",
        description_en: "",
        discount_percentage: "",
        remaining_quantity: "",
        start_date: "",
        end_date: "",
        is_active: true,
      });
    },
    onError: (error) => {
      console.error("Error updating offer:", error);
      toast.error("حدث خطأ في تحديث العرض");
    },
  });

  const deleteOfferMutation = useMutation({
    mutationFn: async (offerId: string) => {
      const { error } = await supabase
        .from("offers")
        .delete()
        .eq("id", offerId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم حذف العرض بنجاح!");
      queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
    },
    onError: (error) => {
      console.error("Error deleting offer:", error);
      toast.error("حدث خطأ في حذف العرض");
    },
  });

  const handleSubmit = () => {
    if (!formData.title_ar || !formData.title_en) {
      toast.error("برجاء ملء العنوان بالعربي والإنجليزي");
      return;
    }

    if (editingOffer) {
      updateOfferMutation.mutate({
        id: editingOffer.id,
        title_ar: formData.title_ar,
        title_en: formData.title_en,
        description_ar: formData.description_ar || null,
        description_en: formData.description_en || null,
        discount_percentage: formData.discount_percentage ? parseInt(formData.discount_percentage) : null,
        remaining_quantity: formData.remaining_quantity ? parseInt(formData.remaining_quantity) : null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        is_active: formData.is_active,
      });
    } else {
      addOfferMutation.mutate({
        title_ar: formData.title_ar,
        title_en: formData.title_en,
        description_ar: formData.description_ar || null,
        description_en: formData.description_en || null,
        discount_percentage: formData.discount_percentage ? parseInt(formData.discount_percentage) : null,
        remaining_quantity: formData.remaining_quantity ? parseInt(formData.remaining_quantity) : null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        is_active: formData.is_active,
      });
    }
  };

  const handleEdit = (offer: any) => {
    setEditingOffer(offer);
    setIsAdding(true);
    setFormData({
      title_ar: offer.title_ar || "",
      title_en: offer.title_en || "",
      description_ar: offer.description_ar || "",
      description_en: offer.description_en || "",
      discount_percentage: offer.discount_percentage?.toString() || "",
      remaining_quantity: offer.remaining_quantity?.toString() || "",
      start_date: offer.start_date ? new Date(offer.start_date).toISOString().slice(0, 16) : "",
      end_date: offer.end_date ? new Date(offer.end_date).toISOString().slice(0, 16) : "",
      is_active: offer.is_active ?? true,
    });
  };

  const handleCancelEdit = () => {
    setEditingOffer(null);
    setIsAdding(false);
    setFormData({
      title_ar: "",
      title_en: "",
      description_ar: "",
      description_en: "",
      discount_percentage: "",
      remaining_quantity: "",
      start_date: "",
      end_date: "",
      is_active: true,
    });
  };

  const handleDelete = (offerId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا العرض؟")) {
      deleteOfferMutation.mutate(offerId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة العروض</h2>
        {!editingOffer && (
          <Button onClick={() => setIsAdding(!isAdding)}>
            <Plus className="w-4 h-4 ml-2" />
            {isAdding ? "إلغاء" : "إضافة عرض"}
          </Button>
        )}
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>{editingOffer ? "تعديل العرض" : "عرض جديد"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">العنوان بالعربي *</label>
                <Input
                  value={formData.title_ar}
                  onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                  placeholder="خصم 50% على جميع الفساتين"
                />
              </div>
              <div>
                <label className="text-sm font-medium">العنوان بالإنجليزي *</label>
                <Input
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  placeholder="50% Off All Dresses"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">الوصف بالعربي</label>
                <Textarea
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  placeholder="تفاصيل العرض"
                />
              </div>
              <div>
                <label className="text-sm font-medium">الوصف بالإنجليزي</label>
                <Textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  placeholder="Offer details"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">نسبة الخصم %</label>
                <Input
                  type="number"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                  placeholder="50"
                />
              </div>
              <div>
                <label className="text-sm font-medium">الكمية المتبقية</label>
                <Input
                  type="number"
                  value={formData.remaining_quantity}
                  onChange={(e) => setFormData({ ...formData, remaining_quantity: e.target.value })}
                  placeholder="100"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">تاريخ البداية</label>
                <Input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">تاريخ النهاية</label>
                <Input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <label className="text-sm font-medium">تفعيل العرض</label>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSubmit} 
                disabled={addOfferMutation.isPending || updateOfferMutation.isPending}
              >
                {(addOfferMutation.isPending || updateOfferMutation.isPending) 
                  ? "جاري الحفظ..." 
                  : editingOffer 
                    ? "تحديث العرض" 
                    : "حفظ العرض"}
              </Button>
              <Button variant="outline" onClick={handleCancelEdit}>
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {offers?.map((offer) => (
          <Card key={offer.id} className={!offer.is_active ? "opacity-50" : ""}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{offer.title_ar}</h3>
                {offer.is_active ? (
                  <span className="text-xs bg-green-500/20 text-green-700 px-2 py-1 rounded">نشط</span>
                ) : (
                  <span className="text-xs bg-gray-500/20 text-gray-700 px-2 py-1 rounded">غير نشط</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">{offer.title_en}</p>
              {offer.description_ar && <p className="text-sm mb-2">{offer.description_ar}</p>}
              {offer.discount_percentage && (
                <p className="text-accent font-bold mb-3">خصم {offer.discount_percentage}%</p>
              )}
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={() => handleEdit(offer)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Pencil className="w-4 h-4 ml-2" />
                  تعديل
                </Button>
                <Button
                  onClick={() => handleDelete(offer.id)}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
