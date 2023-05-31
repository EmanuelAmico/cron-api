import {
  SQSClient,
  SQSServiceException,
  SendMessageCommand,
} from "@aws-sdk/client-sqs";
import { filterSimilar, pick, JobError } from "@utils";
import { ISQSJob, StrictUnion } from "@types";
import { config } from "@config";
import { Job } from "../job";

const { SQS_ACCESS_KEY, SQS_SECRET_KEY } = config;

class SQSJob extends Job implements ISQSJob {
  #queueUrl: URL;
  #queueType: "fifo" | "standard";
  #body: unknown;
  #messageGroupId?: string;
  #messageDeduplicationId?: string;
  static #runningJobs: SQSJob[] = [];
  static #createdJobs: SQSJob[] = [];
  static #sqsClient = new SQSClient({
    region: "sa-east-1",
    credentials: {
      accessKeyId: SQS_ACCESS_KEY,
      secretAccessKey: SQS_SECRET_KEY,
    },
  });
  public get queueUrl() {
    return this.#queueUrl;
  }
  private set queueUrl(queueUrl: URL) {
    this.#queueUrl = queueUrl;
  }
  public get queueType() {
    return this.#queueType;
  }
  private set queueType(queueType: "fifo" | "standard") {
    this.#queueType = queueType;
  }
  public get body() {
    return this.#body;
  }
  private set body(body: unknown) {
    this.#body = body;
  }
  public get messageGroupId() {
    return this.#messageGroupId;
  }
  private set messageGroupId(messageGroupId: string | undefined) {
    this.#messageGroupId = messageGroupId;
  }
  public get messageDeduplicationId() {
    return this.#messageDeduplicationId;
  }
  private set messageDeduplicationId(
    messageDeduplicationId: string | undefined
  ) {
    this.#messageDeduplicationId = messageDeduplicationId;
  }
  protected static get runningJobs() {
    return this.#runningJobs;
  }
  private static set runningJobs(runningJobs: SQSJob[]) {
    this.#runningJobs = runningJobs;
  }
  protected static get createdJobs() {
    return this.#createdJobs;
  }
  private static set createdJobs(createdJobs: SQSJob[]) {
    this.#createdJobs = createdJobs;
  }
  private static get sqsClient() {
    return this.#sqsClient;
  }

  constructor({
    name,
    description,
    cron,
    repetitions,
    timer,
    queueUrl,
    queueType,
    body,
    messageGroupId,
    messageDeduplicationId,
    onStart,
    onStop,
  }: Omit<ConstructorParameters<typeof Job>[0], "callback"> &
    StrictUnion<
      { cron: string; repetitions?: number } | { timer: Date | string | number }
    > & {
      queueUrl: string;
      body: unknown;
    } & StrictUnion<
      | {
          queueType: "fifo";
          messageGroupId: string;
          messageDeduplicationId: string;
        }
      | { queueType: "standard" }
    >) {
    const callback = async () => {
      try {
        await SQSJob.sqsClient.send(
          new SendMessageCommand({
            MessageBody: JSON.stringify(this.body),
            QueueUrl: this.queueUrl.href,
            MessageGroupId: this.messageGroupId,
            MessageDeduplicationId: this.messageDeduplicationId,
          })
        );
      } catch (error) {
        throw new JobError(error as SQSServiceException);
      }
    };

    super(
      cron
        ? {
            name,
            description,
            cron,
            repetitions,
            callback,
            onStart,
            onStop,
          }
        : {
            name,
            description,
            timer: timer as Date | string | number,
            callback,
            onStart,
            onStop,
          }
    );

    if (queueType === "fifo" && !queueUrl.includes(".fifo"))
      throw new JobError(
        "You must provide a valid AWS SQS FIFO queue URL when creating a SQS FIFO job."
      );

    this.#queueUrl = new URL(queueUrl);
    this.#queueType = queueType;
    this.#body = body;
    if (messageGroupId) this.messageGroupId = messageGroupId;
    if (messageDeduplicationId)
      this.messageDeduplicationId = messageDeduplicationId;
  }

  public static listCreatedJobs() {
    return super.listCreatedJobs() as SQSJob[];
  }

  public static listRunningJobs() {
    return super.listRunningJobs() as SQSJob[];
  }

  public static stopJobs() {
    super.stopJobs();
  }

  public static getJobByName(name: string) {
    return super.getJobByName(name) as SQSJob | undefined;
  }

  public static findSimilarJob(name: string) {
    return super.findSimilarJob(name) as SQSJob | undefined;
  }

  public static findSimilarJobs({
    name,
    description,
    cron,
    repetitions,
    nextRunDate,
    createdAt,
    updatedAt,
    queueUrl,
    queueType,
    messageGroupId,
    messageDeduplicationId,
  }: {
    name?: string;
    description?: string;
    cron?: string;
    repetitions?: number;
    nextRunDate?: string;
    createdAt?: string;
    updatedAt?: string;
    queueUrl?: string;
    queueType?: "fifo" | "standard";
    messageGroupId?: string;
    messageDeduplicationId?: string;
  }) {
    const similarJobs: SQSJob[] = [];

    if (
      name ||
      description ||
      cron ||
      repetitions ||
      nextRunDate ||
      createdAt ||
      updatedAt
    ) {
      similarJobs.push(
        ...(super.findSimilarJobs({
          name,
          description,
          cron,
          repetitions,
          nextRunDate,
          createdAt,
          updatedAt,
        }) as SQSJob[])
      );
    }

    if (queueUrl) {
      const similarJobNames = filterSimilar(
        queueUrl,
        this.runningJobs.map((job) => job.queueUrl.href)
      );

      similarJobs.push(
        ...this.runningJobs.filter((job) =>
          similarJobNames.includes(job.queueUrl.href)
        )
      );
    }

    if (queueType) {
      similarJobs.push(
        ...similarJobs.filter((job) => job.queueType === queueType)
      );
    }

    if (messageGroupId) {
      const similarJobNames = filterSimilar(
        messageGroupId,
        this.runningJobs.map((job) => job.messageGroupId)
      );

      similarJobs.push(
        ...this.runningJobs.filter((job) =>
          similarJobNames.includes(job.messageGroupId || "")
        )
      );
    }

    if (messageDeduplicationId) {
      const similarJobNames = filterSimilar(
        messageDeduplicationId,
        this.runningJobs.map((job) => job.messageDeduplicationId)
      );

      similarJobs.push(
        ...this.runningJobs.filter((job) =>
          similarJobNames.includes(job.messageDeduplicationId || "")
        )
      );
    }

    const hasDuplicates = similarJobs.some(
      (job, index, self) => self.findIndex((j) => j.name === job.name) !== index
    );

    if (hasDuplicates)
      return similarJobs
        .filter(
          (job, _, self) => self.filter((j) => j.name === job.name).length > 1
        )
        .filter(
          (job, index, self) =>
            self.findIndex((j) => job && j && j.name === job.name) === index
        );

    return [
      name,
      description,
      cron,
      repetitions,
      nextRunDate,
      queueUrl,
      queueType,
      messageGroupId,
      messageDeduplicationId,
    ].filter((value) => value).length > 1
      ? []
      : similarJobs;
  }

  public edit({
    name,
    description,
    cron,
    repetitions,
    timer,
    queueUrl,
    queueType,
    messageGroupId,
    messageDeduplicationId,
    body,
  }: Parameters<(typeof Job)["prototype"]["edit"]>[0] &
    StrictUnion<
      | {
          body?: unknown;
          messageGroupId?: string;
          messageDeduplicationId?: string;
        }
      | {
          body?: unknown;
          queueType: "fifo";
          queueUrl: string;
          messageGroupId: string;
          messageDeduplicationId: string;
        }
      | { body?: unknown; queueType: "standard"; queueUrl: string }
    >) {
    if (cron) {
      super.edit({ name, description, cron, repetitions });
    }

    if (timer) {
      super.edit({ name, description, timer });
    }

    if (queueUrl && !queueType)
      throw new JobError(
        "You must provide a queueType when changing a job's queueUrl"
      );

    if (queueType === "fifo" && (!messageGroupId || !messageDeduplicationId))
      throw new JobError(
        "You must provide a messageGroupId and a messageDeduplicationId when changing a job to fifo queue type"
      );

    if (queueType === "fifo" && !queueUrl.includes(".fifo"))
      throw new JobError(
        "You must provide a valid AWS SQS FIFO queue url when changing a job to fifo queue type"
      );

    if (queueUrl) this.queueUrl = new URL(queueUrl);
    if (queueType) this.queueType = queueType;
    if (messageGroupId) this.messageGroupId = messageGroupId;
    if (messageDeduplicationId)
      this.messageDeduplicationId = messageDeduplicationId;
    if (body) this.body = body;

    return this;
  }

  public stop() {
    super.stop();
  }

  public toJSON() {
    return {
      ...super.toJSON(),
      ...pick(this, [
        "queueUrl",
        "queueType",
        "body",
        "messageGroupId",
        "messageDeduplicationId",
      ]),
    };
  }
}

export { SQSJob };
