import { ICommission } from "../";

export interface ICohort {
  readonly id: number;
  label: string;
  roleId: string;
  discordId: string;
  discordRoleId: string;
  discordChannelsIds: string[];
  commissions: ICommission[];
}

export type ICohortQueryResponse = (ICohort & {
  commissions: (ICommission & Required<Pick<ICommission, "users">>)[];
})[];
