/**
 * Declarative resource definitions that drive the generic admin CRUD screens.
 * Every table listed here is protected by RLS on the server; the UI only
 * decides what to show. Permissions here are for navigation/hints only.
 */

export const CONTENT_STATUSES = ["draft", "published", "scheduled", "unpublished", "archived"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const STATUS_META: Record<ContentStatus, { label: string; tone: string }> = {
  draft: { label: "Draft", tone: "bg-muted text-muted-foreground" },
  published: { label: "Published", tone: "bg-emerald-100 text-emerald-800" },
  scheduled: { label: "Scheduled", tone: "bg-sky-100 text-sky-800" },
  unpublished: { label: "Unpublished", tone: "bg-amber-100 text-amber-800" },
  archived: { label: "Archived", tone: "bg-rose-100 text-rose-800" },
};

export type FieldType =
  | "text"
  | "slug"
  | "textarea"
  | "richtext"
  | "number"
  | "switch"
  | "select"
  | "date"
  | "datetime"
  | "image"
  | "file"
  | "tags"
  | "images"
  | "units"
  | "relation";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** for relation fields */
  relation?: { table: string; labelColumn: string; valueColumn?: string; filter?: Record<string, unknown> };
  /** derive slug from this field */
  slugFrom?: string;
  /** which column group / tab */
  group?: string;
  width?: "full" | "half";
  max?: number;
};

export type ColumnDef = {
  name: string;
  label: string;
  type?: "text" | "image" | "date" | "datetime" | "boolean" | "status" | "number" | "badge";
  className?: string;
};

export type Permission = "content" | "admissions" | "academics" | "admin" | "finance" | "any";

export type ResourceDef = {
  key: string;
  table: string;
  label: string;
  singular: string;
  description: string;
  permission: Permission;
  fields: FieldDef[];
  columns: ColumnDef[];
  searchColumns: string[];
  orderBy?: { column: string; ascending?: boolean };
  /** has status/publish_at columns */
  statusable?: boolean;
  /** has featured column */
  featurable?: boolean;
  /** has sort_order column */
  sortable?: boolean;
  /** default values on create */
  defaults?: Record<string, unknown>;
  /** extra filter applied to all list queries */
  baseFilter?: Record<string, unknown>;
  /** public preview URL builder */
  previewUrl?: (row: Record<string, unknown>) => string | null;
  /** filter dropdowns */
  filters?: { name: string; label: string; options: { value: string; label: string }[] }[];
};

const seoFields = (group = "SEO"): FieldDef[] => [
  { name: "seo_title", label: "SEO title", type: "text", group, help: "Shown in browser tabs and search results (max 60 chars)", max: 60 },
  { name: "seo_description", label: "SEO description", type: "textarea", group, help: "Max 160 characters", max: 160 },
];

const statusFields = (group = "Publishing"): FieldDef[] => [
  {
    name: "status",
    label: "Status",
    type: "select",
    group,
    required: true,
    options: CONTENT_STATUSES.map((s) => ({ value: s, label: STATUS_META[s].label })),
  },
  { name: "publish_at", label: "Publish on", type: "datetime", group, help: "Used when status is Scheduled" },
];

export const RESOURCES: Record<string, ResourceDef> = {
  news: {
    key: "news",
    table: "news_posts",
    label: "News & Articles",
    singular: "Article",
    description: "Publish news, notices and stories. Drafts are never shown on the public site.",
    permission: "content",
    statusable: true,
    featurable: true,
    searchColumns: ["title", "excerpt", "category"],
    orderBy: { column: "created_at", ascending: false },
    defaults: { status: "draft", category: "general", tags: [], images: [] },
    previewUrl: (r) => `/news/${r["slug"]}`,
    filters: [
      {
        name: "category",
        label: "Category",
        options: ["general", "admissions", "events", "achievements", "community", "digital-skills"].map((c) => ({ value: c, label: c })),
      },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "slug", slugFrom: "title", required: true, width: "half" },
      { name: "category", label: "Category", type: "relation", relation: { table: "news_categories", labelColumn: "name", valueColumn: "slug" }, width: "half" },
      { name: "excerpt", label: "Short summary", type: "textarea", help: "Shown in listings and social previews" },
      { name: "body", label: "Article body", type: "richtext" },
      { name: "image_url", label: "Featured image", type: "image", width: "half" },
      { name: "images", label: "Additional images", type: "images" },
      { name: "author_name", label: "Author", type: "text", width: "half" },
      { name: "tags", label: "Tags", type: "tags", width: "half" },
      { name: "featured", label: "Feature on homepage", type: "switch", width: "half" },
      { name: "published_at", label: "Display date", type: "datetime", width: "half", help: "Defaults to the publish time" },
      ...statusFields(),
      ...seoFields(),
      { name: "og_image_url", label: "Social share image", type: "image", group: "SEO" },
    ],
    columns: [
      { name: "image_url", label: "", type: "image" },
      { name: "title", label: "Title" },
      { name: "category", label: "Category", type: "badge" },
      { name: "status", label: "Status", type: "status" },
      { name: "featured", label: "Featured", type: "boolean" },
      { name: "published_at", label: "Date", type: "date" },
    ],
  },
  events: {
    key: "events",
    table: "events",
    label: "Events",
    singular: "Event",
    description: "Open days, graduations, workshops and community activities.",
    permission: "content",
    statusable: true,
    featurable: true,
    searchColumns: ["title", "location", "category"],
    orderBy: { column: "starts_at", ascending: false },
    defaults: { status: "draft" },
    previewUrl: (r) => `/events/${r["slug"]}`,
    fields: [
      { name: "title", label: "Event title", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "slug", slugFrom: "title", required: true, width: "half" },
      { name: "category", label: "Category", type: "select", width: "half", options: ["Open Day", "Graduation", "Workshop", "Community", "Sports", "Exams", "Other"].map((c) => ({ value: c, label: c })) },
      { name: "description", label: "Description", type: "richtext" },
      { name: "starts_at", label: "Starts", type: "datetime", width: "half", required: true },
      { name: "ends_at", label: "Ends", type: "datetime", width: "half" },
      { name: "location", label: "Location", type: "text", width: "half", placeholder: "OOTI Campus, Loitokitok" },
      { name: "contact_info", label: "Contact info", type: "text", width: "half" },
      { name: "image_url", label: "Cover image", type: "image", width: "half" },
      { name: "poster_url", label: "Poster", type: "image", width: "half" },
      { name: "album_id", label: "Photo album", type: "relation", relation: { table: "gallery_albums", labelColumn: "title" }, width: "half", help: "Link a gallery album to show event photos" },
      { name: "registration_link", label: "Registration link", type: "text", width: "half", placeholder: "https://…" },
      { name: "featured", label: "Feature on homepage", type: "switch", width: "half" },
      ...statusFields(),
      ...seoFields(),
    ],
    columns: [
      { name: "image_url", label: "", type: "image" },
      { name: "title", label: "Title" },
      { name: "starts_at", label: "Starts", type: "datetime" },
      { name: "location", label: "Location" },
      { name: "status", label: "Status", type: "status" },
      { name: "featured", label: "Featured", type: "boolean" },
    ],
  },
  announcements: {
    key: "announcements",
    table: "announcements",
    label: "Announcements",
    singular: "Announcement",
    description: "Short notices for the public, students, trainers or staff.",
    permission: "content",
    statusable: true,
    searchColumns: ["title", "message", "category"],
    orderBy: { column: "created_at", ascending: false },
    defaults: { status: "draft", audience: "public", priority: "normal", category: "general" },
    filters: [
      { name: "audience", label: "Audience", options: ["public", "students", "trainers", "staff"].map((c) => ({ value: c, label: c })) },
      { name: "priority", label: "Priority", options: ["normal", "important", "urgent"].map((c) => ({ value: c, label: c })) },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "message", label: "Message", type: "richtext", required: true },
      { name: "category", label: "Category", type: "select", width: "half", options: ["general", "admissions", "exams", "fees", "academic", "events", "holiday"].map((c) => ({ value: c, label: c })) },
      { name: "audience", label: "Audience", type: "select", width: "half", options: ["public", "students", "trainers", "staff"].map((c) => ({ value: c, label: c })) },
      { name: "priority", label: "Priority", type: "select", width: "half", options: ["normal", "important", "urgent"].map((c) => ({ value: c, label: c })) },
      { name: "starts_at", label: "Show from", type: "datetime", width: "half" },
      { name: "ends_at", label: "Show until", type: "datetime", width: "half", help: "Hidden automatically after this time" },
      { name: "course_id", label: "Related course", type: "relation", relation: { table: "courses", labelColumn: "name" }, width: "half" },
      { name: "department_id", label: "Related department", type: "relation", relation: { table: "departments", labelColumn: "name" }, width: "half" },
      { name: "image_url", label: "Image", type: "image", width: "half" },
      { name: "attachment_url", label: "Attachment (PDF)", type: "file", width: "half" },
      ...statusFields(),
    ],
    columns: [
      { name: "title", label: "Title" },
      { name: "audience", label: "Audience", type: "badge" },
      { name: "priority", label: "Priority", type: "badge" },
      { name: "status", label: "Status", type: "status" },
      { name: "ends_at", label: "Until", type: "date" },
    ],
  },
  albums: {
    key: "albums",
    table: "gallery_albums",
    label: "Gallery albums",
    singular: "Album",
    description: "Group photos into albums such as Graduation 2026 or Cosmetology practicals.",
    permission: "content",
    statusable: true,
    featurable: true,
    sortable: true,
    searchColumns: ["title", "description", "category"],
    orderBy: { column: "sort_order", ascending: true },
    defaults: { status: "published" },
    previewUrl: (r) => `/gallery/${r["slug"]}`,
    fields: [
      { name: "title", label: "Album title", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "slug", slugFrom: "title", required: true, width: "half" },
      { name: "category", label: "Category", type: "select", width: "half", options: ["Campus Life", "Graduation", "Practicals", "Events", "Community Outreach", "Digital Skills", "Sports", "Staff"].map((c) => ({ value: c, label: c })) },
      { name: "description", label: "Description", type: "textarea" },
      { name: "cover_url", label: "Cover image", type: "image", width: "half" },
      { name: "event_date", label: "Event date", type: "date", width: "half" },
      { name: "location", label: "Location", type: "text", width: "half" },
      { name: "sort_order", label: "Display order", type: "number", width: "half" },
      { name: "featured", label: "Feature on homepage", type: "switch", width: "half" },
      ...statusFields(),
    ],
    columns: [
      { name: "cover_url", label: "", type: "image" },
      { name: "title", label: "Album" },
      { name: "category", label: "Category", type: "badge" },
      { name: "status", label: "Status", type: "status" },
      { name: "featured", label: "Featured", type: "boolean" },
      { name: "sort_order", label: "Order", type: "number" },
    ],
  },
  courses: {
    key: "courses",
    table: "courses",
    label: "Courses",
    singular: "Course",
    description: "Technical, vocational, short and digital-skills programmes.",
    permission: "academics",
    statusable: true,
    featurable: true,
    sortable: true,
    searchColumns: ["name", "course_code", "category", "description"],
    orderBy: { column: "sort_order", ascending: true },
    defaults: { status: "published", category: "Technical", units: [], accepting_applications: true },
    previewUrl: (r) => (r["category"] === "Digital Skills" ? `/digital-skills/${r["slug"]}` : `/courses/${r["slug"]}`),
    filters: [
      { name: "category", label: "Category", options: ["Technical", "Vocational", "Computing", "Short Course", "Digital Skills"].map((c) => ({ value: c, label: c })) },
    ],
    fields: [
      { name: "name", label: "Course name", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "slug", slugFrom: "name", required: true, width: "half" },
      { name: "course_code", label: "Course code", type: "text", width: "half" },
      { name: "category", label: "Category", type: "select", width: "half", required: true, options: ["Technical", "Vocational", "Computing", "Short Course", "Digital Skills"].map((c) => ({ value: c, label: c })) },
      { name: "department_id", label: "Department", type: "relation", relation: { table: "departments", labelColumn: "name" }, width: "half" },
      { name: "description", label: "Description", type: "richtext" },
      { name: "level", label: "Level", type: "text", width: "half", placeholder: "Certificate / Diploma / Artisan" },
      { name: "duration", label: "Duration", type: "text", width: "half", placeholder: "2 years" },
      { name: "entry_requirement", label: "Entry requirements", type: "textarea" },
      { name: "minimum_grade", label: "Minimum grade", type: "text", width: "half" },
      { name: "exam_body", label: "Examining body", type: "text", width: "half", placeholder: "KNEC / NITA / CDACC" },
      { name: "fee", label: "Fee (KES)", type: "number", width: "half" },
      { name: "mode_of_study", label: "Mode of study", type: "text", width: "half" },
      { name: "intake", label: "Intake", type: "text", width: "half", placeholder: "January, May, September" },
      { name: "instructor", label: "Instructor", type: "text", width: "half" },
      { name: "units", label: "Units / modules", type: "units" },
      { name: "image_url", label: "Course image", type: "image", width: "half" },
      { name: "sort_order", label: "Display order", type: "number", width: "half" },
      { name: "featured", label: "Featured course", type: "switch", width: "half" },
      { name: "accepting_applications", label: "Accepting applications", type: "switch", width: "half" },
      ...statusFields(),
      ...seoFields(),
    ],
    columns: [
      { name: "image_url", label: "", type: "image" },
      { name: "name", label: "Course" },
      { name: "category", label: "Category", type: "badge" },
      { name: "duration", label: "Duration" },
      { name: "status", label: "Status", type: "status" },
      { name: "featured", label: "Featured", type: "boolean" },
    ],
  },
  departments: {
    key: "departments",
    table: "departments",
    label: "Departments",
    singular: "Department",
    description: "Academic departments and their heads.",
    permission: "academics",
    statusable: true,
    sortable: true,
    searchColumns: ["name", "description", "head_name"],
    orderBy: { column: "sort_order", ascending: true },
    defaults: { status: "published" },
    previewUrl: (r) => `/departments/${r["slug"]}`,
    fields: [
      { name: "name", label: "Department name", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "slug", slugFrom: "name", required: true, width: "half" },
      { name: "head_name", label: "Head of department", type: "text", width: "half" },
      { name: "description", label: "Description", type: "richtext" },
      { name: "image_url", label: "Image", type: "image", width: "half" },
      { name: "sort_order", label: "Display order", type: "number", width: "half" },
      ...statusFields(),
      ...seoFields(),
    ],
    columns: [
      { name: "image_url", label: "", type: "image" },
      { name: "name", label: "Department" },
      { name: "head_name", label: "Head" },
      { name: "status", label: "Status", type: "status" },
      { name: "sort_order", label: "Order", type: "number" },
    ],
  },
  staff: {
    key: "staff",
    table: "staff_profiles",
    label: "Staff directory",
    singular: "Staff member",
    description: "Public staff profiles shown on the Staff page.",
    permission: "content",
    statusable: true,
    sortable: true,
    searchColumns: ["full_name", "position", "specialization"],
    orderBy: { column: "sort_order", ascending: true },
    defaults: { status: "draft" },
    fields: [
      { name: "full_name", label: "Full name", type: "text", required: true },
      { name: "position", label: "Position / title", type: "text", width: "half" },
      { name: "staff_number", label: "Staff number", type: "text", width: "half" },
      { name: "department_id", label: "Department", type: "relation", relation: { table: "departments", labelColumn: "name" }, width: "half" },
      { name: "specialization", label: "Specialization", type: "text", width: "half" },
      { name: "bio", label: "Short bio", type: "textarea" },
      { name: "photo_url", label: "Photo", type: "image", width: "half" },
      { name: "email", label: "Email (public)", type: "text", width: "half" },
      { name: "phone", label: "Phone (public)", type: "text", width: "half" },
      { name: "sort_order", label: "Display order", type: "number", width: "half" },
      ...statusFields(),
    ],
    columns: [
      { name: "photo_url", label: "", type: "image" },
      { name: "full_name", label: "Name" },
      { name: "position", label: "Position" },
      { name: "status", label: "Status", type: "status" },
      { name: "sort_order", label: "Order", type: "number" },
    ],
  },
  documents: {
    key: "documents",
    table: "documents",
    label: "Documents & downloads",
    singular: "Document",
    description: "Fee structures, brochures, forms, timetables and policies.",
    permission: "content",
    statusable: true,
    sortable: true,
    searchColumns: ["title", "description", "category"],
    orderBy: { column: "sort_order", ascending: true },
    defaults: { status: "published", visibility: "public", is_public: true },
    filters: [{ name: "visibility", label: "Visibility", options: ["public", "students", "staff", "admin"].map((c) => ({ value: c, label: c })) }],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "file_url", label: "File", type: "file", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "category", label: "Category", type: "select", width: "half", options: ["Fee Structure", "Brochure", "Application Form", "Timetable", "Policy", "Newsletter", "Other"].map((c) => ({ value: c, label: c })) },
      { name: "visibility", label: "Who can download", type: "select", width: "half", options: [{ value: "public", label: "Everyone (public)" }, { value: "students", label: "Students only" }, { value: "staff", label: "Staff only" }, { value: "admin", label: "Admins only" }] },
      { name: "sort_order", label: "Display order", type: "number", width: "half" },
      ...statusFields(),
    ],
    columns: [
      { name: "title", label: "Title" },
      { name: "category", label: "Category", type: "badge" },
      { name: "visibility", label: "Visibility", type: "badge" },
      { name: "status", label: "Status", type: "status" },
    ],
  },
  faqs: {
    key: "faqs",
    table: "faqs",
    label: "FAQs",
    singular: "Question",
    description: "Frequently asked questions shown on the FAQ page.",
    permission: "content",
    statusable: true,
    sortable: true,
    searchColumns: ["question", "answer", "category"],
    orderBy: { column: "sort_order", ascending: true },
    defaults: { status: "published" },
    fields: [
      { name: "question", label: "Question", type: "text", required: true },
      { name: "answer", label: "Answer", type: "richtext", required: true },
      { name: "category", label: "Category", type: "select", width: "half", options: ["Admissions", "Fees", "Courses", "Accommodation", "Certificates", "General"].map((c) => ({ value: c, label: c })) },
      { name: "sort_order", label: "Display order", type: "number", width: "half" },
      ...statusFields(),
    ],
    columns: [
      { name: "question", label: "Question" },
      { name: "category", label: "Category", type: "badge" },
      { name: "status", label: "Status", type: "status" },
      { name: "sort_order", label: "Order", type: "number" },
    ],
  },
  testimonials: {
    key: "testimonials",
    table: "testimonials",
    label: "Testimonials",
    singular: "Testimonial",
    description: "Short quotes from students, graduates, parents and employers.",
    permission: "content",
    statusable: true,
    featurable: true,
    sortable: true,
    searchColumns: ["name", "testimonial", "course_name"],
    orderBy: { column: "sort_order", ascending: true },
    defaults: { status: "draft" },
    fields: [
      { name: "name", label: "Name", type: "text", required: true, width: "half" },
      { name: "role", label: "Role", type: "text", width: "half", placeholder: "Graduate, Parent, Employer…" },
      { name: "testimonial", label: "Testimonial", type: "textarea", required: true },
      { name: "course_name", label: "Course", type: "text", width: "half" },
      { name: "year", label: "Year", type: "text", width: "half" },
      { name: "photo_url", label: "Photo", type: "image", width: "half" },
      { name: "sort_order", label: "Display order", type: "number", width: "half" },
      { name: "featured", label: "Show on homepage", type: "switch", width: "half" },
      ...statusFields(),
    ],
    columns: [
      { name: "photo_url", label: "", type: "image" },
      { name: "name", label: "Name" },
      { name: "course_name", label: "Course" },
      { name: "status", label: "Status", type: "status" },
      { name: "featured", label: "Featured", type: "boolean" },
    ],
  },
  stories: {
    key: "stories",
    table: "success_stories",
    label: "Success stories",
    singular: "Story",
    description: "Longer graduate stories. Stories only go live once consent is recorded.",
    permission: "content",
    statusable: true,
    featurable: true,
    sortable: true,
    searchColumns: ["student_name", "story", "course_name", "achievement"],
    orderBy: { column: "sort_order", ascending: true },
    defaults: { status: "draft", consent_obtained: false },
    fields: [
      { name: "student_name", label: "Graduate name", type: "text", required: true, width: "half" },
      { name: "course_name", label: "Course", type: "text", width: "half" },
      { name: "graduation_year", label: "Graduation year", type: "text", width: "half" },
      { name: "achievement", label: "Achievement", type: "text", width: "half", placeholder: "Now runs a salon in Kimana" },
      { name: "quote", label: "Short quote", type: "textarea" },
      { name: "story", label: "Full story", type: "richtext", required: true },
      { name: "photo_url", label: "Photo", type: "image", width: "half" },
      { name: "sort_order", label: "Display order", type: "number", width: "half" },
      { name: "consent_obtained", label: "Consent obtained from graduate", type: "switch", width: "half", help: "Required before the story appears publicly" },
      { name: "featured", label: "Show on homepage", type: "switch", width: "half" },
      ...statusFields(),
    ],
    columns: [
      { name: "photo_url", label: "", type: "image" },
      { name: "student_name", label: "Graduate" },
      { name: "course_name", label: "Course" },
      { name: "consent_obtained", label: "Consent", type: "boolean" },
      { name: "status", label: "Status", type: "status" },
    ],
  },
};

export const ADMIN_ROLES = [
  { value: "super_admin", label: "Super Admin", help: "Full control including roles and settings" },
  { value: "admin", label: "Admin", help: "Manage everything except Super Admins" },
  { value: "staff", label: "Staff", help: "Content and admissions" },
  { value: "content_manager", label: "Content Manager", help: "Website content only" },
  { value: "admissions_officer", label: "Admissions Officer", help: "Applications and enquiries" },
  { value: "academic_officer", label: "Academic Officer", help: "Courses and departments" },
  { value: "finance_officer", label: "Finance Officer", help: "Finance (coming soon)" },
  { value: "trainer", label: "Trainer", help: "Staff portal access" },
  { value: "student", label: "Student", help: "Student portal" },
  { value: "applicant", label: "Applicant", help: "Applicant account" },
] as const;

export type Permissions = {
  roles: string[];
  isAdmin: boolean;
  isSuperAdmin: boolean;
  content: boolean;
  admissions: boolean;
  academics: boolean;
  finance: boolean;
  portalStaff: boolean;
};

export function derivePermissions(roles: string[]): Permissions {
  const has = (...r: string[]) => r.some((x) => roles.includes(x));
  const isSuperAdmin = has("super_admin");
  const isAdmin = has("admin", "super_admin");
  return {
    roles,
    isAdmin,
    isSuperAdmin,
    content: isAdmin || has("staff", "content_manager"),
    admissions: isAdmin || has("staff", "admissions_officer"),
    academics: isAdmin || has("staff", "content_manager", "academic_officer"),
    finance: isAdmin || has("finance_officer"),
    portalStaff: isAdmin || has("staff", "content_manager", "admissions_officer", "academic_officer", "finance_officer", "trainer"),
  };
}

export function can(p: Permissions, perm: Permission) {
  switch (perm) {
    case "admin":
      return p.isAdmin;
    case "content":
      return p.content;
    case "admissions":
      return p.admissions;
    case "academics":
      return p.academics;
    case "finance":
      return p.finance;
    default:
      return p.portalStaff;
  }
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
