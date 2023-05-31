export interface IExternalErrors {
  [key: string]: string;
}

export const externalErrors: IExternalErrors = {
  payments_api_error: "Payments API Error",
  pledu_api_error: "Pledu API Error",
  backoffice_api_error: "Backoffice API Error",
  sqs_error: "SQS Error",
  discord_error: "Discord Error",
};
