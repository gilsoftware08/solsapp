export const getStorage = (key: string): any => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
export const setStorage = (key: string, data: any): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
};

export interface Course { name: string; id: string; active?: boolean; }
export interface Faculty {
  name: string;
  assignedCourses: string[];
  descriptor: number[];
  preview?: string;
}
export interface Batch { name: string; courseName: string; facultyName: string; }
export interface Student {
  name: string;
  courseName: string;
  batchName: string;
  descriptor: number[];
  preview?: string;
}