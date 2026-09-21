/**
 * Public sitelinks for the homepage, sitemap, and Google Ads assets.
 * Text ≤25 chars; each description line ≤35 chars. Unique URLs only.
 */
export type SiteLink = {
  text: string;
  path: string;
  description1: string;
  description2: string;
};

export const SITE_LINKS: SiteLink[] = [
  {
    text: "AI Math Tutor",
    path: "/practice",
    description1: "Practice on the board. No account.",
    description2: "Check work and get AI tips.",
  },
  {
    text: "Blank Practice",
    path: "/practice/blank",
    description1: "Start a blank math sheet.",
    description2: "Paste a problem or upload one.",
  },
  {
    text: "For Teachers",
    path: "/registerTeacher",
    description1: "Live lessons on one board.",
    description2: "Students join and work together.",
  },
  {
    text: "Student Signup",
    path: "/registerStudent",
    description1: "Join a class on the board.",
    description2: "Work live with your teacher.",
  },
  {
    text: "How It Works",
    path: "/",
    description1: "Live class and AI practice.",
    description2: "Same board, two ways to use it.",
  },
  {
    text: "Sign In",
    path: "/login",
    description1: "Open your MathBoard account.",
    description2: "Teachers and students sign in here.",
  },
];
