import {
  ICourse,
  IUserInscriptionRol,
  IRole,
  SourceOptions,
  IPaginationResponse,
  IPaginationRequest,
  IInscriptionsRole,
} from "@types";

export interface IUser {
  readonly id: number;
  firstName?: string;
  lastName?: string;
  email: string;
  sex?: string;
  phone?: string;
  active?: boolean;
  birthdate?: Date;
  country?: string;
  discordId?: string | null;
  discordTag?: string;
  knowledge?: string | null;
  city?: string | null;
  activeToken?: string;
  resetToken?: string;
  paidCourses: ICourse[];
  roles?: IRole[];
  password?: string;
  salt?: string;
  pipedriveId?: number;
  source?: SourceOptions;
  pleduRoles?: IRole[];
  inscriptionRoles?: IUserInscriptionRol[];
}

export interface IUserResponse {
  userId: number;
  message: string;
}

interface IGetUsers {
  search: string;
  course: string;
  alliance: string;
  year: string;
  rolId: string;
  month: string;
  discordId: string;
  active: string;
  inscRole: string;
}

export type IGetUsersRequest = Partial<
  IGetUsers & IPaginationRequest & { state: string }
>;

export type IGetUsersResponse = IPaginationResponse & { users: IUser[] };

export interface IUpdatedUserInscriptionRoles {
  idUser: number;
  roles: IInscriptionsRole[];
}
