// Mock data for development

export interface Teacher {
  name: string;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
}

export const teachers: Teacher[] = [
  { name: "Alice Johnson" },
  { name: "Bob Smith" },
  { name: "Carol Lee" },
];

export const subjects: Subject[] = [
  { id: 1, name: "Mathematics", code: "MAT" },
  { id: 2, name: "Physics", code: "PHY" },
  { id: 3, name: "Chemistry", code: "CHE" },
  { id: 4, name: "Biology", code: "BIO" },
];