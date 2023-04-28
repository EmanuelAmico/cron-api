export interface ICourseInformation {
  hours: string;
  weekDays: string;
  startDate: string;
  endDate: string;
  link?: string;
  shift: string;
}

export interface IEmailParams {
  course: ICourseInformation;
  recipientEmail: string;
  modality: string;
  link: string;
  reason: string;
  template: string;
  price: number | string;
  token: string;
}

export type IEmailTemplates = "intro_live" | "intro_atr";
