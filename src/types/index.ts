import { Types } from "mongoose";

// Base User Interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin" | "instructor";
  isActive: boolean;
}

// User Document type for Mongoose (omits id, includes hashed password)
export type UserDoc = Omit<User, "id"> & {
  password: string;
};

// Base Submission Interface (Custom Domain Resource)
export interface Submission {
  id: string;
  studentId: string;
  courseCode: string;
  repoUrl: string;
  submittedAt: Date;
  score?: number;
  status: "pending" | "submitted" | "graded" | "late";
}

// Submission Document type for Mongoose (replaces studentId with Types.ObjectId)
export type SubmissionDoc = Omit<Submission, "id" | "studentId"> & {
  studentId: Types.ObjectId;
};

// User Creation and Login Payloads
export type CreateUser = Pick<User, "name" | "email"> & {
  password: string;
  role?: User["role"];
};

export type LoginUser = Pick<User, "email"> & {
  password: string;
};

// Submission Creation and Update Payloads
export type CreateSubmission = Pick<Submission, "courseCode" | "repoUrl"> &
  Partial<Pick<Submission, "score" | "status">>;

export type UpdateSubmission = Partial<
  Pick<Submission, "courseCode" | "repoUrl" | "score" | "status">
>;

// ============================================
// COURSE TYPES (GT4 PART 2)
// ============================================

// Course Interface (public shape)
export interface Course {
  code: string;
  title: string;
  units: number;
  semester: string;
}

// Course Document type for Mongoose (derived from Course via Pick)
export type CourseDoc = Pick<Course, "code" | "title" | "units" | "semester"> & {
  _id: Types.ObjectId;
};

