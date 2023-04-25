interface IExternalErrors {
  [key: string]: string;
}

const externalErrors: IExternalErrors = {
  payments_api_error: "Payments API Error",
};

export default externalErrors;
