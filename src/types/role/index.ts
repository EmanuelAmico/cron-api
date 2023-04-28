export interface IRole {
  readonly id: number;
  name: string;
  color: string;
  accessLevel: number;
  user_roles: IUserRole;
}

export interface IUserRole {
  readonly id: number;
  UserId: number;
  RoleId: number;
  createdAt: Date;
  updatedAt: Date;
}

export type IUserInscriptionRol = {
  idUser: number;
  roles: IInscriptionsRole;
};

export type PleduRol = {
  name: string;
  module: string;
};

export interface IInscriptionsRole {
  readonly id?: number;
  name: string;
  module?: string;
}
