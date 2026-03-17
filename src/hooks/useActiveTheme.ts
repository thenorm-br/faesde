import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PromotionalTheme {
  id: string;
  name: string;
  slug: string;
  theme_style: string;
  discount_percentage: number;
  coupon_code: string | null;
  is_active: boolean;
  scheduled_months: number[];
  banner_title: string | null;
  banner_subtitle: string | null;
  banner_emoji: string | null;
  banner_cta_text: string | null;
  banner_cta_emoji: string | null;
  exit_popup_title: string | null;
  exit_popup_subtitle: string | null;
  banner_bottom_text: string | null;
}

export const useActiveTheme = () => {
  const [theme, setTheme] = useState<PromotionalTheme | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheme = async () => {
      // First try to find theme marked as active
      const { data } = await supabase
        .from("promotional_themes")
        .select("*")
        .eq("is_active", true)
        .limit(1);

      let selectedTheme: PromotionalTheme | null = null;

      if (data && data.length > 0) {
        selectedTheme = data[0] as PromotionalTheme;
      } else {
        // Fallback: find by current month schedule
        const currentMonth = new Date().getMonth() + 1;
        const { data: scheduled } = await supabase
          .from("promotional_themes")
          .select("*")
          .contains("scheduled_months", [currentMonth])
          .limit(1);

        if (scheduled && scheduled.length > 0) {
          selectedTheme = scheduled[0] as PromotionalTheme;
        }
      }

      // Always fallback to default theme if nothing found
      if (!selectedTheme) {
        const { data: defaultTheme } = await supabase
          .from("promotional_themes")
          .select("*")
          .eq("slug", "padrao")
          .limit(1);
        if (defaultTheme && defaultTheme.length > 0) {
          selectedTheme = defaultTheme[0] as PromotionalTheme;
        }
      }

      setTheme(selectedTheme);
      setLoading(false);
    };
    fetchTheme();
  }, []);

  return { theme, loading };
};
