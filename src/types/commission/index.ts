import { ICohort, IUser } from "../";

export interface ICommission {
  readonly id: number;
  name: string;
  cohortId: string;
  discordRoleId?: string;
  discordChannelsIds?: string[];
  cohort?: ICohort;
  users?: number[];
}

export type ICommissionWithUsers = Omit<ICommission, "users"> & {
  users: IUser[];
};

export type ICommissionCreateData = Pick<ICommission, "name"> & {
  cohortId: number;
  cohortLabel: string;
  alliance: string;
};

export type ICommissionABUserData = { users: (string | number)[] };

export type ICommissionUpdateUserData = {
  users: (number | string)[];
  commissionId: number;
};

export interface ICommissionUpdateUserResponse {
  oldCommission: ICommission;
  newCommission: ICommission;
}
