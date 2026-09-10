import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Department = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  head_name: string | null;
  image_url: string | null;
  sort_order: number;
};

export type Course = {
  id: string;
  name: string;
  slug: string;
  course_code: string | null;
  department_id: string | null;
  category: string;
  description: string | null;
  duration: string | null;
  entry_requirement: string | null;
  minimum_grade: string | null;
  exam_body: string | null;
  level: string | null;
  fee: number | null;
  mode_of_study: string | null;
  intake: string | null;
  instructor: string | null;
  image_url: string | null;
  featured: boolean;
  accepting_applications: boolean;
  sort_order: number;
};

const unwrap = <T,>(res: { data: T | null; error: { message: string } | null }): T => {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T;
};

export const departmentsQuery = queryOptions({
  queryKey: ["departments"],
  queryFn: async () =>
    unwrap<Department[]>(
      await supabase.from("departments").select("*").order("sort_order", { ascending: true }),
    ),
});

export const departmentQuery = (slug: string) =>
  queryOptions({
    queryKey: ["department", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as Department | null;
    },
  });

export const coursesQuery = queryOptions({
  queryKey: ["courses"],
  queryFn: async () =>
    unwrap<Course[]>(
      await supabase
        .from("courses")
        .select("*")
        .order("category", { ascending: true })
        .order("sort_order", { ascending: true }),
    ),
});

export const courseQuery = (slug: string) =>
  queryOptions({
    queryKey: ["course", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as Course | null;
    },
  });

export const newsQuery = queryOptions({
  queryKey: ["news"],
  queryFn: async () =>
    unwrap<
      Array<{
        id: string;
        title: string;
        slug: string;
        excerpt: string | null;
        body: string | null;
        image_url: string | null;
        category: string | null;
        published_at: string | null;
        created_at: string;
      }>
    >(
      await supabase
        .from("news_posts")
        .select("*")
        .order("published_at", { ascending: false, nullsFirst: false }),
    ),
});

export const newsPostQuery = (slug: string) =>
  queryOptions({
    queryKey: ["news", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_posts")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });

export const eventsQuery = queryOptions({
  queryKey: ["events"],
  queryFn: async () =>
    unwrap<
      Array<{
        id: string;
        title: string;
        slug: string;
        description: string | null;
        location: string | null;
        starts_at: string | null;
        ends_at: string | null;
        image_url: string | null;
      }>
    >(await supabase.from("events").select("*").order("starts_at", { ascending: true })),
});

export const eventQuery = (slug: string) =>
  queryOptions({
    queryKey: ["event", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });

export const albumsQuery = queryOptions({
  queryKey: ["albums"],
  queryFn: async () =>
    unwrap<
      Array<{
        id: string;
        title: string;
        slug: string;
        description: string | null;
        cover_url: string | null;
      }>
    >(await supabase.from("gallery_albums").select("*").order("sort_order", { ascending: true })),
});

export const albumQuery = (slug: string) =>
  queryOptions({
    queryKey: ["album", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_albums")
        .select("*, gallery_images(*)")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as
        | {
            id: string;
            title: string;
            description: string | null;
            gallery_images: Array<{ id: string; image_url: string; caption: string | null }>;
          }
        | null;
    },
  });

export const documentsQuery = queryOptions({
  queryKey: ["documents"],
  queryFn: async () =>
    unwrap<
      Array<{
        id: string;
        title: string;
        description: string | null;
        file_url: string;
        category: string | null;
      }>
    >(await supabase.from("documents").select("*").order("created_at", { ascending: false })),
});

export const staffQuery = queryOptions({
  queryKey: ["staff"],
  queryFn: async () =>
    unwrap<
      Array<{
        id: string;
        full_name: string;
        position: string | null;
        bio: string | null;
        photo_url: string | null;
        email: string | null;
      }>
    >(await supabase.from("staff_profiles").select("*").order("sort_order", { ascending: true })),
});

export const faqsQuery = queryOptions({
  queryKey: ["faqs"],
  queryFn: async () =>
    unwrap<
      Array<{ id: string; question: string; answer: string; category: string | null }>
    >(await supabase.from("faqs").select("*").order("sort_order", { ascending: true })),
});

export const storiesQuery = queryOptions({
  queryKey: ["stories"],
  queryFn: async () =>
    unwrap<
      Array<{
        id: string;
        student_name: string;
        course_name: string | null;
        story: string;
        photo_url: string | null;
      }>
    >(await supabase.from("success_stories").select("*").order("created_at", { ascending: false })),
});
