export type PaymentMethod = "MercadoPago" | "PayPal";

export type CoursesNames =
  | "Clases Gratuitas"
  | "Intro con Profe"
  | "Intro ATR"
  | "Bootcamp JS"
  | "Bootcamp SF";

type CourseTags =
  | "INTRO_JAVASCRIPT"
  | "INTRO_JAVASCRIPT_ATR"
  | "BC_JAVASCRIPT"
  | "BC_SALESFORCE";

export type CoursesNamesByTag = {
  [key in CourseTags]: CoursesNames;
};

export type Stage =
  | "preLead"
  | "lead"
  | "sent"
  | "attended"
  | "paymentRejected"
  | "paymentPending"
  | "confirmed"
  | "preHot"
  | "hot"
  | "scheduledChallenge"
  | "scheduledInterview";

export type SourceOptions =
  | "Referido"
  | "Orgánico"
  | "Google"
  | "Instagram"
  | "Facebook"
  | "Twitter"
  | "Alianza"
  | "Evento"
  | "WhatsApp";

export type CountryOptions =
  | "arg"
  | "bol"
  | "bra"
  | "can"
  | "chi"
  | "col"
  | "cos"
  | "ec"
  | "es"
  | "usa"
  | "irl"
  | "isr"
  | "eng"
  | "mex"
  | "par"
  | "per"
  | "uru"
  | "ven"
  | "cu"
  | "sal"
  | "gua"
  | "hai"
  | "hon"
  | "jam"
  | "nic"
  | "pan"
  | "dom";

export type ShiftOptions = "mañana" | "tarde" | "full time";

export type CurrencyOptions = "ARS" | "USD";

export type Status = "open" | "won" | "lost" | "deleted";

export interface IPerson {
  name: string;
  email: string;
  phone: string;
  country: CountryOptions;
  source: SourceOptions;
  discordTag: string;
  birthdate: string;
  sex: string;
}

export interface IDeal {
  stageName: Stage;
  person_id: number;
  value: number;
  currency: CurrencyOptions;
  title: string;
  courseName: CoursesNames;
  paymentId: string;
  paymentMethod: PaymentMethod;
  shift: ShiftOptions;
  paymentDate: string;
  cohortLabel: string;
  commission: string;
  courseEdition: string;
  alliance: string;
  status: "open" | "won" | "lost" | "deleted";
}

export interface IPayment {
  id: string;
  date: string;
  method: PaymentMethod;
}

export type IStagesIds = {
  [key in Stage]?: number;
};

export type IStagesByCourse = {
  [key in CoursesNames]: IStagesIds;
};

export type IPersonKeys = keyof IPerson;

export interface IBCForm {
  [key: string]: string;
  bc_motivation: string;
  current_study: string;
  current_work: string;
  current_work_modality: string;
  current_work_role: string;
  group_working_situation: string;
  highest_study_level: string;
  is_studying: string;
  is_working: string;
  p5_previous_course: string;
  payment_plan: string;
  problem_solving_case: string;
  studies: string;
  which_bc_inscription: string;
}
