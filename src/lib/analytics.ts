type AnalyticsValue = string | number | boolean | null | undefined | AnalyticsItem[] | Record<string, unknown>;

interface AnalyticsItem {
  item_id?: string;
  item_name?: string;
  item_category?: string;
  item_brand?: string;
}

interface AnalyticsCourse {
  slug?: string;
  title?: string;
  category?: string;
  promo_price?: string | null;
  original_price?: string | null;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const cleanParams = (params: Record<string, AnalyticsValue>) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== null));

const parsePrice = (value?: string | null) => {
  const clean = String(value || "")
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".")
    .trim();
  const numeric = Number(clean);
  return Number.isFinite(numeric) && numeric > 0 ? Number(numeric.toFixed(2)) : undefined;
};

const courseItem = (course: AnalyticsCourse): AnalyticsItem => ({
  item_id: course.slug,
  item_name: course.title,
  item_category: course.category,
  item_brand: "FAESDE",
});

export const trackEvent = (eventName: string, params: Record<string, AnalyticsValue> = {}) => {
  if (typeof window === "undefined") return;
  window.gtag?.("event", eventName, cleanParams(params));
};

export const trackPageView = (path: string, title: string) => {
  if (typeof window === "undefined") return;
  trackEvent("page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: title,
  });
};

export const trackCourseView = (course: AnalyticsCourse) => {
  const value = parsePrice(course.promo_price || course.original_price);
  trackEvent("view_course", {
    course_slug: course.slug,
    course_name: course.title,
    course_category: course.category,
    value,
    currency: value ? "BRL" : undefined,
  });
  trackEvent("view_item", {
    currency: value ? "BRL" : undefined,
    value,
    items: [courseItem(course)],
  });
};

export const trackCourseCategoryView = (categorySlug: string, categoryName: string, resultCount: number) => {
  trackEvent("view_course_category", {
    course_category: categorySlug,
    category_name: categoryName,
    result_count: resultCount,
  });
};

export const trackCourseSearch = (searchTerm: string, resultCount: number, categorySlug: string) => {
  trackEvent("search", {
    search_term: searchTerm,
    result_count: resultCount,
    course_category: categorySlug,
  });
};

export const trackCourseSelect = (course: AnalyticsCourse, listName: string) => {
  trackEvent("select_item", {
    item_list_name: listName,
    items: [courseItem(course)],
  });
};

export const trackLeadIntent = (method: string, course?: AnalyticsCourse, location?: string) => {
  trackEvent("generate_lead", {
    method,
    course_slug: course?.slug,
    course_name: course?.title,
    course_category: course?.category,
    location,
  });
};
