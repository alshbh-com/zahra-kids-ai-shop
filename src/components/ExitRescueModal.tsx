import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Gift, Clock, X } from "lucide-react";

interface ExitRescueModalProps {
  onAcceptDiscount: () => void;
  cartHasItems: boolean;
}

export const ExitRescueModal = ({ onAcceptDiscount, cartHasItems }: ExitRescueModalProps) => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!cartHasItems) return;

    // التحقق إذا تم عرض العرض من قبل
    const hasSeenOffer = sessionStorage.getItem("exitRescueShown");
    if (hasSeenOffer) return;

    // اكتشاف محاولة الخروج من الصفحة
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!sessionStorage.getItem("exitRescueShown")) {
        e.preventDefault();
        e.returnValue = "";
        setShowModal(true);
        sessionStorage.setItem("exitRescueShown", "true");
      }
    };

    // اكتشاف زر الرجوع
    const handlePopState = () => {
      if (!sessionStorage.getItem("exitRescueShown")) {
        setShowModal(true);
        sessionStorage.setItem("exitRescueShown", "true");
        // منع الرجوع الفعلي
        window.history.pushState(null, "", window.location.href);
      }
    };

    // إضافة state للتاريخ لاكتشاف زر الرجوع
    window.history.pushState(null, "", window.location.href);

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [cartHasItems]);

  const handleAccept = () => {
    onAcceptDiscount();
    setShowModal(false);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <AlertDialog open={showModal} onOpenChange={setShowModal}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center animate-pulse">
              <Gift className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <AlertDialogTitle className="text-center text-xl">
            ✋ استنى ثانية!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-primary font-bold text-lg">
              <Clock className="w-5 h-5" />
              <span>خد خصم 5٪ لو كملت الطلب الآن!</span>
            </div>
            <p className="text-muted-foreground text-sm">
              عرض خاص ومحدود عشان متضيعش الفرصة 🔥
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <AlertDialogAction 
            onClick={handleAccept}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            🎁 أيوه، هكمل الطلب بالخصم
          </AlertDialogAction>
          <AlertDialogCancel 
            onClick={handleClose}
            className="w-full"
          >
            لا، مش عايز الخصم
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
