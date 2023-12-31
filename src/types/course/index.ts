import { ICohort, StrictUnion } from "@types";

export interface CourseType {
  readonly id: number;
  name: string;
  tag: string;
}

export interface ICourse {
  readonly id: number;
  year: number;
  month: string;
  mode: string;
  startDate: Date;
  endDate: Date;
  startHour: string;
  endHour: string;
  shift: string;
  weekDays: string;
  cohortLabel: string;
  cohort?: ICohort;
  availability: boolean;
  limitToApply: Date;
  limitOfStudents: number;
  vacancyStatus: boolean;
  priceARS: string;
  priceUSD: string;
  status: string;
  visibility: boolean;
  bootcampPreparation: string;
  alliance: string;
  type: CourseType;
}

export type ICourseCreateData = Omit<ICourse, "cohortLabel" | "id">;

export type ICourseCreateResponse = Pick<ICourse, "alliance" | "cohortLabel">;

export interface CoursesQuery {
  page?: number;
  limit?: number;
  year?: number;
  status?: string;
  cohortLabel?: string;
}

export interface CourseQuery {
  cohortLabel: string;
}

export type ICourseQuery = Partial<StrictUnion<CoursesQuery | CourseQuery>>;

export interface ICoursesQueryResponse {
  totalItems: number;
  courses: ICourse[];
}

export enum CourseTags {
  BC_JAVASCRIPT = "PREP",
  BC_SALESFORCE = "SALESFORCE-PREP",
  INTRO_JAVASCRIPT = "INTRO_JAVASCRIPT",
  INTRO_JAVASCRIPT_ATR = "INTRO_JAVASCRIPT_ATR",
  INTRO_FRONTEND = "INTRO_FRONTEND",
  BOOTCAMP_JS_CONTENT = "BC_JAVASCRIPT",
  BOOTCAMP_SF_CONTENT = "BC_SALESFORCE",
  CODING_CHALLENGE = "CODING_CHALLENGE",
}
