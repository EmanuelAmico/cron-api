import { ICommission } from "@types";

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

export enum CohortStatus {
  STARTED = "started",
  ENDED = "ended",
}
