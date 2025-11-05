import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const OfferManager = () => {
  const [isAdding, setIsAdding] = useState(false);
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

  const handleSubmit = () => {
    if (!formData.title_ar || !formData.title_en) {
      toast.error("برجاء ملء العنوان بالعربي والإنجليزي");
      return;
    }

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
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة العروض</h2>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="w-4 h-4 ml-2" />
          إضافة عرض
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>عرض جديد</CardTitle>
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
              <Button onClick={handleSubmit} disabled={addOfferMutation.isPending}>
                {addOfferMutation.isPending ? "جاري الحفظ..." : "حفظ العرض"}
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
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
                <p className="text-accent font-bold">خصم {offer.discount_percentage}%</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
