export const getStorage = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
export const setStorage = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

export interface Course { name: string; id: string; }
export interface Faculty { name: string; assignedCourses: string[]; descriptor: number[]; }
export interface Batch { name: string; courseName: string; facultyName: string; }
export interface Student { name: string; courseName: string; batchName: string; descriptor: number[]; }