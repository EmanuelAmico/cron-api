import { Method } from "axios";

export interface IFetchAPI {
  url: string;
  method: Method;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: { [key: string]: any };
}

export type ChannelType =
  | "GUILD_TEXT"
  | "DM"
  | "GUILD_VOICE"
  | "GROUP_DM"
  | "GUILD_CATEGORY"
  | "GUILD_NEWS"
  | "GUILD_STORE"
  | "GUILD_NEWS_THREAD"
  | "GUILD_PUBLIC_THREAD"
  | "GUILD_PRIVATE_THREAD"
  | "GUILD_STAGE_VOICE";

interface IOverwrite {
  id: string;
  type: 0 | 1; // 0 for role or 1 for member
  allow?: string;
  deny?: string;
}
export interface IChannelData {
  name: string;
  parent_id?: string;
  permission_overwrites?: IOverwrite[];
}
export interface IChannel extends IChannelData {
  type: ChannelType;
}

export interface IRoleData {
  name: string;
  color: number;
  permissions?: string;
  mentionable?: boolean;
}

export interface IRole extends IRoleData {
  readonly id: string;
}

export interface IDiscordChannel {
  type: string;
  name: string;
  extraRolesIds: string[];
}

export interface ICreateCourseBlock {
  categoryName: string;
  roleName: string;
  channels: IDiscordChannel[];
}

export interface IDeleteCourseBlock {
  commissionRole: string;
  channels: string[];
  deleteCategory: boolean;
}

export interface ICreateCourseBlockResponse {
  role: string;
  channels: string[];
}

export interface IUpdateUserRole {
  discordId: string;
  roleId: string;
}
