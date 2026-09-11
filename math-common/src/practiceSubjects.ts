export const PRACTICE_SUBJECTS = [
  "Algebra",
  "Geometry",
  "Trigonometry",
  "Calculus",
  "Statistics",
  "Vectors",
  "Complex",
  "General",
] as const;

export type PracticeSubject = (typeof PRACTICE_SUBJECTS)[number];

export function isPracticeSubject(value: string): value is PracticeSubject {
  return (PRACTICE_SUBJECTS as readonly string[]).includes(value);
}
