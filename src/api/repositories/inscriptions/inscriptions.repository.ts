import ExternalError from "../../helpers/errorHandlers/External/externalErrors";
import inscriptionsAPI from "./inscriptions.instance";
import { queryUrlGen } from "../../helpers";
import {
  ICourseQuery,
  ICoursesQueryResponse,
  ICourseCreateData,
  ICourse,
  CourseType,
  Query,
  INSCRIPTION_RESPONSE,
  InfoRolPayload,
  ICohort,
  ICohortQueryResponse,
  ICommission,
  ICommissionCreateData,
  ICommissionUpdateUserResponse,
  IInscriptionsRole,
  IUserInscriptionRol,
  IUpdatedUserInscriptionRoles,
} from "../../../types";

class InscriptionsRepository {
  static async getCourses(query?: ICourseQuery) {
    try {
      const response = await inscriptionsAPI<
        INSCRIPTION_RESPONSE<ICoursesQueryResponse>
      >({
        method: "GET",
        url: queryUrlGen(query as Query, "/data/courses"),
      });
      return response.content;
    } catch (error) {
      throw new ExternalError("inscriptions_api_error", error as Error);
    }
  }

  static async getCourseByCohortLabel(cohortLabel: string) {
    try {
      const response = await inscriptionsAPI<
        INSCRIPTION_RESPONSE<{ totalItems: number; courses: ICourse[] }>
      >({
        method: "GET",
        url: `/data/courses?cohortLabel=${cohortLabel}`,
      });
      return response.content.courses[0];
    } catch (error) {
      throw new ExternalError("inscriptions_api_error", error as Error);
    }
  }

  static async getUserRoles(token: string) {
    try {
      const response = await inscriptionsAPI<
        INSCRIPTION_RESPONSE<InfoRolPayload[]>
      >({
        method: "GET",
        url: "/roles/user",
        extraHeaders: { Authorization: `Bearer ${token}` },
      });
      return response.content;
    } catch (error) {
      throw new ExternalError("inscriptions_api_error", error as Error);
    }
  }

  static async getUserCommissions(userId: number) {
    try {
      const response = await inscriptionsAPI<
        INSCRIPTION_RESPONSE<ICommission[]>
      >({
        method: "GET",
        url: `/commissions/users/${userId}`,
      });
      return response.content;
    } catch (error) {
      throw new ExternalError("inscriptions_api_error", error as Error);
    }
  }

  static async createCourse(body: ICourseCreateData) {
    try {
      const response = await inscriptionsAPI<INSCRIPTION_RESPONSE<ICourse>>({
        method: "POST",
        url: "/data/courses",
        body,
      });
      return response.content;
    } catch (error) {
      throw new ExternalError("inscriptions_api_error", error as Error);
    }
  }

  static async createCohort(body: { label: string }) {
    try {
      const response = await inscriptionsAPI<INSCRIPTION_RESPONSE<ICohort>>({
        method: "POST",
        url: "/cohorts",
        body,
      });
      return response.content;
    } catch (error) {
      throw new ExternalError("inscriptions_api_error", error as Error);
    }
  }

  static async updateCourse(id: string, body: Partial<ICourse>) {
    try {
      const response = await inscriptionsAPI<INSCRIPTION_RESPONSE<ICourse>>({
        method: "PATCH",
        url: `/data/courses/${id}`,
        body,
      });
      return response.content;
    } catch (error) {
      throw new ExternalError("inscriptions_api_error", error as Error);
    }
  }

  static async deleteCourse(id: string) {
    try {
      const response = await inscriptionsAPI<
        INSCRIPTION_RESPONSE<{
          course: ICourse;
          roles: string[];
          channels: string[];
        }>
      >({
        method: "DELETE",
        url: `/data/courses/${id}`,
      });
      return response.content;
    } catch (error) {
      throw new ExternalError("inscriptions_api_error", error as Error);
    }
  }

  static async deleteCohort(cohortLabel: string) {
    try {
      const response = await inscriptionsAPI<INSCRIPTION_RESPONSE<ICohort>>({
        method: "DELETE",
        url: `/cohorts/${cohortLabel}`,
      });
      return response.content;
    } catch (error) {
      throw new ExternalError("inscriptions_api_error", error as Error);
    }
  }

  static async updateCohort(label: string, body: Partial<ICohort>) {
    try {
      const response = await inscriptionsAPI<INSCRIPTION_RESPONSE<ICohort>>({
        method: "PATCH",
        url: `/cohorts/${label}`,
        body,
      });
      return response.content;
    } catch (error) {
      throw new ExternalError("inscriptions_api_error", error as Error);
    }
  }

  static async getTypeOfCourses() {
    try {
      const response = await inscriptionsAPI<
        INSCRIPTION_RESPONSE<CourseType[]>
      >({
        method: "GET",
        url: `/data/typesofcourses`,
      });
      return response.content;
    } catch (error) {
      throw new ExternalError("inscriptions_api_error", error as Error);
    }
  }

  static async getCohorts(query?: Query) {
    try {
      const baseURL = "/cohorts";
      const response = await inscriptionsAPI<
        INSCRIPTION_RESPONSE<ICohortQueryResponse>
      >({
        method: "GET",
        url: query ? queryUrlGen(query as Query, baseURL) : baseURL,
      });
      return response.content;
    } catch (error) {
      throw new ExternalError("inscriptions_api_error", error as Error);
    }
  }

  static async getCohort(idCohort: string) {
    try {
      const response = await inscriptionsAPI<INSCRIPTION_RESPONSE<ICohort>>({
        method: "GET",
        url: `/cohorts/${idCohort}`,
      });
      return response.content;
    } catch (error) {
      throw new ExternalError("inscriptions_api_error", error as Error);
    }
  }

  static async getCommission(id: number) {
    try {
      const response = await inscriptionsAPI<INSCRIPTION_RESPONSE<ICommission>>(
        {
          method: "GET",
          url: `/commissions/${id}`,
        }
      );
      return response.content;
    } catch (error) {
      throw new ExternalError("inscriptions_api_error", error as Error);
    }
  }

  static async createCommission(
    body: Omit<ICommissionCreateData, "cohort" | "alliance" | "cohortLabel"> & {
      cohortId: number;
    }
  ) {
    try {
      const response = await inscriptionsAPI<
        INSCRIPTION_RESPONSE<{ cohort: ICohort; commission: ICommission }>
      >({
        method: "POST",
        url: `/commissions`,
        body,
      });
      return response.content;
    } catch (error) {
      throw new ExternalError("inscriptions_api_error", error as Error);
    }
  }

  static async deleteCommission(id: string) {
    try {
      const response = await inscriptionsAPI<
        INSCRIPTION_RESPONSE<{
          discordChannels: string[];
          discordRole: string;
        }>
      >({
        method: "DELETE",
        url: `/commissions/${id}`,
      });
      return response.content;
    } catch (error) {
      throw new ExternalError("inscriptions_api_error", error as Error);
    }
  }

  static async updateCommission(id: number, body: Partial<ICommission>) {
    try {
      const response = await inscriptionsAPI<{
        updatedCommission: ICommission;
      }>({
        method: "PATCH",
        url: `/commissions/${id}`,
        body,
      });
      return response;
    } catch (error) {
      throw new ExternalError("inscriptions_api_error", error as Error);
    }
  }

  static async addUsersToCommission(idCommission: number, users: number[]) {
    try {
      const response = await inscriptionsAPI<INSCRIPTION_RESPONSE<ICommission>>(
        {
          method: "POST",
          url: `/commissions/${idCommission}/users`,
          body: { users },
        }
      );
      return response.content;
    } catch (error) {
      throw new ExternalError("inscriptions_api_error", error as Error);
    }
  }

  static async removeUsersFromCommission(
    idCommission: number,
    users: number[]
  ) {
    try {
      const response = await inscriptionsAPI<INSCRIPTION_RESPONSE<ICommission>>(
        {
          method: "DELETE",
          url: `/commissions/${idCommission}/users`,
          body: { users },
        }
      );
      return response.content;
    } catch (error) {
      throw new ExternalError("inscriptions_api_error", error as Error);
    }
  }

  static async updateUsersCommission(
    idCommission: number,
    idNewCommission: number,
    users: number[]
  ) {
    try {
      const response = await inscriptionsAPI<
        INSCRIPTION_RESPONSE<ICommissionUpdateUserResponse>
      >({
        method: "PUT",
        url: `/commissions/${idCommission}/users`,
        body: { users, newCommission: idNewCommission },
      });
      return response.content;
    } catch (error) {
      throw new ExternalError("inscriptions_api_error", error as Error);
    }
  }

  static async getUsersRoles(usersId: { usersId: string }) {
    try {
      const response = await inscriptionsAPI<
        INSCRIPTION_RESPONSE<{ UserId: number; roles: IUserInscriptionRol[] }[]>
      >({
        method: "GET",
        url: queryUrlGen(usersId, "/users/roles"),
      });
      return response.content;
    } catch (error) {
      throw new ExternalError("inscriptions_api_error", error as Error);
    }
  }

  static async getRoles() {
    try {
      const response = await inscriptionsAPI<
        INSCRIPTION_RESPONSE<IInscriptionsRole[]>
      >({
        method: "GET",
        url: `/roles`,
      });
      return response.content;
    } catch (error) {
      throw new ExternalError("inscriptions_api_error", error as Error);
    }
  }

  static async getUsersIds(query: Query) {
    try {
      const response = await inscriptionsAPI<
        INSCRIPTION_RESPONSE<{ UserId: number; roles: IUserInscriptionRol[] }[]>
      >({
        method: "GET",
        url: queryUrlGen(query, "/cohorts/students"),
      });
      return response.content;
    } catch (error) {
      throw new ExternalError("inscriptions_api_error", error as Error);
    }
  }

  static async updateUserRoles({
    id,
    rolesIds,
  }: {
    id: number;
    rolesIds: number[];
  }) {
    try {
      const response = await inscriptionsAPI<
        INSCRIPTION_RESPONSE<IUpdatedUserInscriptionRoles[]>
      >({
        method: "PUT",
        url: `/users/${id}/roles`,
        body: { rolesIds },
      });
      return response.content;
    } catch (error) {
      throw new ExternalError("inscriptions_api_error", error as Error);
    }
  }
}

export default InscriptionsRepository;
