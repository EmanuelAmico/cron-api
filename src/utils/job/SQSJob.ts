import { JobData, StrictUnion } from "../../types";
import { Job } from ".";
import { filterSimilar, pick } from "../helpers";
import { SQS } from "aws-sdk";
import { config } from "../../api/config";

const { SQS_ACCESS_KEY, SQS_SECRET_KEY } = config;

class SQSJob extends Job {
  #queueUrl: URL;
  #queueType: "fifo" | "standard";
  #body: unknown;
  #messageGroupId?: string;
  #messageDeduplicationId?: string;
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
  static #sqs = new SQS({
    region: "sa-east-1",
    credentials: {
      accessKeyId: SQS_ACCESS_KEY,
      secretAccessKey: SQS_SECRET_KEY,
    },
  });
  static #runningJobs: SQSJob[] = [];
  protected static get runningJobs() {
    return this.#runningJobs;
  }
  private static set runningJobs(jobs: SQSJob[]) {
    this.#runningJobs = jobs;
  }
  private static get sqs() {
    return this.#sqs;
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
    onStart: handleStart,
    onStop: handleStop,
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
    if (SQSJob.runningJobs.find((job) => job.name === name))
      throw new Error("A job with that name already exists.");

    const callback = async () =>
      await new Promise<SQS.SendMessageResult>((resolve, reject) => {
        SQSJob.sqs.sendMessage(
          {
            MessageBody: JSON.stringify(this.body),
            QueueUrl: this.queueUrl.href,
            MessageGroupId: this.messageGroupId,
            MessageDeduplicationId: this.messageDeduplicationId,
          },
          (error, data) => {
            if (error) reject(error);
            else resolve(data);
          }
        );
      });

    const onStart = () => {
      SQSJob.runningJobs.push(this);
      if (handleStart) handleStart();
    };

    const onStop = () => {
      SQSJob.runningJobs = SQSJob.runningJobs.filter((job) => job !== this);
      if (handleStop) handleStop();
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
      throw new Error(
        "You must provide a valid AWS SQS FIFO queue URL when creating a SQS FIFO job."
      );

    this.#queueUrl = new URL(queueUrl);
    this.#queueType = queueType;
    this.#body = body;
    if (messageGroupId) this.messageGroupId = messageGroupId;
    if (messageDeduplicationId)
      this.messageDeduplicationId = messageDeduplicationId;
  }

  public static listRunningJobs() {
    return super.listRunningJobs() as unknown as SQSJob[];
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
    queueUrl?: string;
    queueType?: "fifo" | "standard";
    messageGroupId?: string;
    messageDeduplicationId?: string;
  }) {
    const similarJobs: SQSJob[] = [];

    if (name || description || cron || repetitions || nextRunDate) {
      similarJobs.push(
        ...(super.findSimilarJobs({
          name,
          description,
          cron,
          repetitions,
          nextRunDate,
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

    // Remove duplicates
    return similarJobs.filter(
      (job, index, jobs) => jobs.findIndex((j) => j.name === job.name) === index
    );
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
  }: StrictUnion<
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
  > &
    Pick<JobData, "name"> &
    Partial<Omit<JobData, "name" | "callback">>) {
    if (cron) {
      super.edit({ name, description, cron, repetitions });
    }

    if (timer) {
      super.edit({ name, description, timer });
    }

    if (queueUrl && !queueType)
      throw new Error(
        "You must provide a queueType when changing a job's queueUrl"
      );

    if (queueType === "fifo" && (!messageGroupId || !messageDeduplicationId))
      throw new Error(
        "You must provide a messageGroupId and a messageDeduplicationId when changing a job to fifo queue type"
      );

    if (queueType === "fifo" && !queueUrl.includes(".fifo"))
      throw new Error(
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
    if (this.constructor === SQSJob)
      SQSJob.runningJobs = SQSJob.runningJobs.filter(
        (job) => job.name !== this.name
      );
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
