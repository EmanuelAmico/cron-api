import { SQS, AWSError } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { sqs } from "..";
import { config } from "../../../config/env";
import {
  CoursesNames,
  IBCForm,
  IDeal,
  IPerson,
  Stage,
  StrictUnion,
} from "../../../../types";
import ExternalError from "../../../helpers/errorHandlers/External/externalErrors";

const { PIPEDRIVE_QUEUE_URL, PIPEDRIVE_QUEUE_UNIQUE_MESSAGE_GROUP_ID } = config;

class PipedriveRepository {
  public static enqueue = new PipedriveRepository();

  public static async listQueues() {
    try {
      return await new Promise<SQS.ListQueuesResult>((resolve, reject) => {
        sqs.listQueues((error, data) => {
          if (error) reject(error);
          else resolve(data);
        });
      });
    } catch (err) {
      const error = err as AWSError;
      throw new ExternalError("sqs_error", error);
    }
  }

  public async createDeal(
    deal: Required<
      Pick<
        IDeal,
        | "stageName"
        | "person_id"
        | "currency"
        | "title"
        | "courseName"
        | "shift"
        | "cohortLabel"
        | "commission"
        | "courseEdition"
      >
    > &
      Partial<
        Pick<
          IDeal,
          | "value"
          | "alliance"
          | "paymentId"
          | "paymentMethod"
          | "paymentDate"
          | "status"
        >
      >
  ) {
    try {
      return await new Promise<SQS.SendMessageResult>((resolve, reject) => {
        sqs.sendMessage(
          {
            MessageBody: JSON.stringify({ type: "CREATE_DEAL", payload: deal }),
            QueueUrl: PIPEDRIVE_QUEUE_URL,
            MessageGroupId: PIPEDRIVE_QUEUE_UNIQUE_MESSAGE_GROUP_ID,
            MessageDeduplicationId: uuidv4(),
          },
          (error, data) => {
            if (error) reject(error);
            else resolve(data);
          }
        );
      });
    } catch (err) {
      const error = err as AWSError;
      throw new ExternalError("sqs_error", error);
    }
  }

  public async updateDeal({
    deal_id,
    fields,
  }: {
    deal_id: number;
    fields: Partial<IDeal>;
  }) {
    try {
      return await new Promise<SQS.SendMessageResult>((resolve, reject) => {
        sqs.sendMessage(
          {
            MessageBody: JSON.stringify({
              type: "UPDATE_DEAL",
              payload: { deal_id, fields },
            }),
            QueueUrl: PIPEDRIVE_QUEUE_URL,
            MessageGroupId: PIPEDRIVE_QUEUE_UNIQUE_MESSAGE_GROUP_ID,
            MessageDeduplicationId: uuidv4(),
          },
          (error, data) => {
            if (error) reject(error);
            else resolve(data);
          }
        );
      });
    } catch (err) {
      const error = err as AWSError;
      throw new ExternalError("sqs_error", error);
    }
  }

  public async updateWonDealByEmailAndCohortLabel({
    email,
    cohortLabel,
    fields,
  }: {
    email: string;
    cohortLabel: string;
    fields: StrictUnion<
      | (Pick<IDeal, "stageName" | "courseName"> &
          Partial<Omit<IDeal, "stageName" | "courseName">>)
      | Omit<Partial<IDeal>, "stageName">
    >;
  }) {
    try {
      return await new Promise<SQS.SendMessageResult>((resolve, reject) => {
        sqs.sendMessage(
          {
            MessageBody: JSON.stringify({
              type: "UPDATE_WON_DEAL_BY_EMAIL_AND_COHORT_LABEL",
              payload: { email, cohortLabel, fields },
            }),
            QueueUrl: PIPEDRIVE_QUEUE_URL,
            MessageGroupId: PIPEDRIVE_QUEUE_UNIQUE_MESSAGE_GROUP_ID,
            MessageDeduplicationId: uuidv4(),
          },
          (error, data) => {
            if (error) reject(error);
            else resolve(data);
          }
        );
      });
    } catch (err) {
      const error = err as AWSError;
      throw new ExternalError("sqs_error", error);
    }
  }

  public async updateOpenOrLostDealByEmailAndCourseName({
    email,
    courseName,
    fields,
  }: {
    email: string;
    courseName: string;
    fields: Partial<IDeal>;
  }) {
    try {
      return await new Promise<SQS.SendMessageResult>((resolve, reject) => {
        sqs.sendMessage(
          {
            MessageBody: JSON.stringify({
              type: "UPDATE_OPEN_OR_LOST_DEAL_BY_EMAIL_AND_COURSE_NAME",
              payload: { email, courseName, fields },
            }),
            QueueUrl: PIPEDRIVE_QUEUE_URL,
            MessageGroupId: PIPEDRIVE_QUEUE_UNIQUE_MESSAGE_GROUP_ID,
            MessageDeduplicationId: uuidv4(),
          },
          (error, data) => {
            if (error) reject(error);
            else resolve(data);
          }
        );
      });
    } catch (err) {
      const error = err as AWSError;
      throw new ExternalError("sqs_error", error);
    }
  }

  public async changeOrDeleteCommissionFromDeal({
    operation,
    email,
    cohortLabel,
    dealTitle,
    newCommissionName,
    newCohortLabel,
  }: {
    operation: "DELETE" | "CHANGE";
    email: string;
    cohortLabel?: string;
    dealTitle?: string;
    newCommissionName?: string;
    newCohortLabel?: string;
  }) {
    try {
      return await new Promise<SQS.SendMessageResult>((resolve, reject) => {
        sqs.sendMessage(
          {
            MessageBody: JSON.stringify({
              type: "CHANGE_OR_DELETE_COMMISSION_FROM_DEAL",
              payload: {
                operation,
                email,
                cohortLabel,
                dealTitle,
                newCommissionName,
                newCohortLabel,
              },
            }),
            QueueUrl: PIPEDRIVE_QUEUE_URL,
            MessageGroupId: PIPEDRIVE_QUEUE_UNIQUE_MESSAGE_GROUP_ID,
            MessageDeduplicationId: uuidv4(),
          },
          (error, data) => {
            if (error) reject(error);
            else resolve(data);
          }
        );
      });
    } catch (err) {
      const error = err as AWSError;
      throw new ExternalError("sqs_error", error);
    }
  }

  public async createPerson(
    person: Required<Pick<IPerson, "name" | "email" | "source">> &
      Partial<
        Pick<IPerson, "phone" | "country" | "sex" | "birthdate" | "discordTag">
      >
  ) {
    try {
      return await new Promise<SQS.SendMessageResult>((resolve, reject) => {
        sqs.sendMessage(
          {
            MessageBody: JSON.stringify({
              type: "CREATE_PERSON",
              payload: person,
            }),
            QueueUrl: PIPEDRIVE_QUEUE_URL,
            MessageGroupId: PIPEDRIVE_QUEUE_UNIQUE_MESSAGE_GROUP_ID,
            MessageDeduplicationId: uuidv4(),
          },
          (error, data) => {
            if (error) reject(error);
            else resolve(data);
          }
        );
      });
    } catch (err) {
      const error = err as AWSError;
      throw new ExternalError("sqs_error", error);
    }
  }

  public async createOrUpdatePerson(
    person: Required<Pick<IPerson, "name" | "email" | "source">> &
      Partial<
        Pick<IPerson, "phone" | "country" | "sex" | "birthdate" | "discordTag">
      >
  ) {
    try {
      return await new Promise<SQS.SendMessageResult>((resolve, reject) => {
        sqs.sendMessage(
          {
            MessageBody: JSON.stringify({
              type: "CREATE_OR_UPDATE_PERSON",
              payload: person,
            }),
            QueueUrl: PIPEDRIVE_QUEUE_URL,
            MessageGroupId: PIPEDRIVE_QUEUE_UNIQUE_MESSAGE_GROUP_ID,
            MessageDeduplicationId: uuidv4(),
          },
          (error, data) => {
            if (error) reject(error);
            else resolve(data);
          }
        );
      });
    } catch (err) {
      const error = err as AWSError;
      throw new ExternalError("sqs_error", error);
    }
  }

  public async createOrUpdatePersonAndOpenOrLostDeal(
    person: Required<Pick<IPerson, "name" | "email" | "source">> &
      Partial<
        Pick<IPerson, "phone" | "country" | "sex" | "birthdate" | "discordTag">
      >,
    deal: Required<
      Pick<
        IDeal,
        | "stageName"
        | "currency"
        | "title"
        | "courseName"
        | "shift"
        | "cohortLabel"
        | "commission"
        | "courseEdition"
      >
    > &
      Partial<
        Pick<
          IDeal,
          | "value"
          | "alliance"
          | "paymentId"
          | "paymentMethod"
          | "paymentDate"
          | "person_id"
        >
      >
  ) {
    try {
      return await new Promise<SQS.SendMessageResult>((resolve, reject) => {
        sqs.sendMessage(
          {
            MessageBody: JSON.stringify({
              type: "CREATE_OR_UPDATE_PERSON_AND_OPEN_OR_LOST_DEAL",
              payload: { deal, person },
            }),
            QueueUrl: PIPEDRIVE_QUEUE_URL,
            MessageGroupId: PIPEDRIVE_QUEUE_UNIQUE_MESSAGE_GROUP_ID,
            MessageDeduplicationId: uuidv4(),
          },
          (error, data) => {
            if (error) reject(error);
            else resolve(data);
          }
        );
      });
    } catch (err) {
      const error = err as AWSError;
      throw new ExternalError("sqs_error", error);
    }
  }

  public async getPerson(person_id: number) {
    try {
      return await new Promise<SQS.SendMessageResult>((resolve, reject) => {
        sqs.sendMessage(
          {
            MessageBody: JSON.stringify({
              type: "GET_PERSON",
              payload: { person_id },
            }),
            QueueUrl: PIPEDRIVE_QUEUE_URL,
            MessageGroupId: PIPEDRIVE_QUEUE_UNIQUE_MESSAGE_GROUP_ID,
            MessageDeduplicationId: uuidv4(),
          },
          (error, data) => {
            if (error) reject(error);
            else resolve(data);
          }
        );
      });
    } catch (err) {
      const error = err as AWSError;
      throw new ExternalError("sqs_error", error);
    }
  }

  public async getPersonByEmail(email: string) {
    try {
      return await new Promise<SQS.SendMessageResult>((resolve, reject) => {
        sqs.sendMessage(
          {
            MessageBody: JSON.stringify({
              type: "GET_PERSON_BY_EMAIL",
              payload: { email },
            }),
            QueueUrl: PIPEDRIVE_QUEUE_URL,
            MessageGroupId: PIPEDRIVE_QUEUE_UNIQUE_MESSAGE_GROUP_ID,
            MessageDeduplicationId: uuidv4(),
          },
          (error, data) => {
            if (error) reject(error);
            else resolve(data);
          }
        );
      });
    } catch (err) {
      const error = err as AWSError;
      throw new ExternalError("sqs_error", error);
    }
  }

  public async updatePerson({
    person_id,
    fields,
  }: {
    person_id: number;
    fields: Partial<IPerson>;
  }) {
    try {
      return await new Promise<SQS.SendMessageResult>((resolve, reject) => {
        sqs.sendMessage(
          {
            MessageBody: JSON.stringify({
              type: "UPDATE_PERSON",
              payload: { person_id, fields },
            }),
            QueueUrl: PIPEDRIVE_QUEUE_URL,
            MessageGroupId: PIPEDRIVE_QUEUE_UNIQUE_MESSAGE_GROUP_ID,
            MessageDeduplicationId: uuidv4(),
          },
          (error, data) => {
            if (error) reject(error);
            else resolve(data);
          }
        );
      });
    } catch (err) {
      const error = err as AWSError;
      throw new ExternalError("sqs_error", error);
    }
  }

  public async addNoteToDeal({
    deal_id,
    content,
  }: {
    deal_id: number;
    content: string;
  }) {
    try {
      return await new Promise<SQS.SendMessageResult>((resolve, reject) => {
        sqs.sendMessage(
          {
            MessageBody: JSON.stringify({
              type: "ADD_NOTE_TO_DEAL",
              payload: { deal_id, content },
            }),
            QueueUrl: PIPEDRIVE_QUEUE_URL,
            MessageGroupId: PIPEDRIVE_QUEUE_UNIQUE_MESSAGE_GROUP_ID,
            MessageDeduplicationId: uuidv4(),
          },
          (error, data) => {
            if (error) reject(error);
            else resolve(data);
          }
        );
      });
    } catch (err) {
      const error = err as AWSError;
      throw new ExternalError("sqs_error", error);
    }
  }

  public async addNoteToOpenDealByEmailAndCourseName({
    email,
    courseName,
    content,
  }: {
    email: string;
    courseName: string;
    content: string;
  }) {
    try {
      return await new Promise<SQS.SendMessageResult>((resolve, reject) => {
        sqs.sendMessage(
          {
            MessageBody: JSON.stringify({
              type: "ADD_NOTE_TO_OPEN_DEAL_BY_EMAIL_AND_COURSE_NAME",
              payload: { email, courseName, content },
            }),
            QueueUrl: PIPEDRIVE_QUEUE_URL,
            MessageGroupId: PIPEDRIVE_QUEUE_UNIQUE_MESSAGE_GROUP_ID,
            MessageDeduplicationId: uuidv4(),
          },
          (error, data) => {
            if (error) reject(error);
            else resolve(data);
          }
        );
      });
    } catch (err) {
      const error = err as AWSError;
      throw new ExternalError("sqs_error", error);
    }
  }

  public async addBcFormToNote({
    deal_id,
    userForm,
  }: {
    deal_id: number;
    userForm: IBCForm;
  }) {
    try {
      return await new Promise<SQS.SendMessageResult>((resolve, reject) => {
        sqs.sendMessage(
          {
            MessageBody: JSON.stringify({
              type: "ADD_BC_FORM_TO_NOTE",
              payload: { deal_id, userForm },
            }),
            QueueUrl: PIPEDRIVE_QUEUE_URL,
            MessageGroupId: PIPEDRIVE_QUEUE_UNIQUE_MESSAGE_GROUP_ID,
            MessageDeduplicationId: uuidv4(),
          },
          (error, data) => {
            if (error) reject(error);
            else resolve(data);
          }
        );
      });
    } catch (err) {
      const error = err as AWSError;
      throw new ExternalError("sqs_error", error);
    }
  }

  public async updateDealStage({
    deal_id,
    courseName,
    stageName,
  }: {
    deal_id: number;
    courseName: CoursesNames;
    stageName: Stage;
  }) {
    try {
      return await new Promise<SQS.SendMessageResult>((resolve, reject) => {
        sqs.sendMessage(
          {
            MessageBody: JSON.stringify({
              type: "UPDATE_DEAL_STAGE",
              payload: { deal_id, courseName, stageName },
            }),
            QueueUrl: PIPEDRIVE_QUEUE_URL,
            MessageGroupId: PIPEDRIVE_QUEUE_UNIQUE_MESSAGE_GROUP_ID,
            MessageDeduplicationId: uuidv4(),
          },
          (error, data) => {
            if (error) reject(error);
            else resolve(data);
          }
        );
      });
    } catch (err) {
      const error = err as AWSError;
      throw new ExternalError("sqs_error", error);
    }
  }
}

export default PipedriveRepository;
