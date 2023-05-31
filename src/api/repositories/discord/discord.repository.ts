import { ExternalError } from "@helpers";
import {
  ICreateCourseBlock,
  IDeleteCourseBlock,
  ICreateCourseBlockResponse,
  IUpdateUserRole,
} from "@types";
import { discordAPI } from "@repositories";

export class DiscordRepository {
  public static async createCourse(body: ICreateCourseBlock) {
    try {
      const response = await discordAPI<ICreateCourseBlockResponse>({
        method: "POST",
        url: "/block",
        body,
      });

      return response;
    } catch (error) {
      throw new ExternalError("discord_api_error", error as Error);
    }
  }

  public static async deleteCourse(body: IDeleteCourseBlock) {
    try {
      const response = await discordAPI<null>({
        method: "DELETE",
        url: "/block",
        body,
      });

      return response;
    } catch (error) {
      throw new ExternalError("discord_api_error", error as Error);
    }
  }

  public static async addRoleToUser({ discordId, roleId }: IUpdateUserRole) {
    try {
      const response = await discordAPI({
        method: "POST",
        url: "/user/roles",
        body: { userId: discordId, roleId },
      });

      return response;
    } catch (error) {
      throw new ExternalError("discord_api_error", error as Error);
    }
  }

  public static async removeRoleFromUser({
    discordId,
    roleId,
  }: IUpdateUserRole) {
    try {
      const response = await discordAPI({
        method: "PATCH",
        url: "/user/roles",
        body: { userId: discordId, roleId },
      });

      return response;
    } catch (error) {
      throw new ExternalError("discord_api_error", error as Error);
    }
  }
}
