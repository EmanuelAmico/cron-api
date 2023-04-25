interface IInternalErrors {
  [key: string]: {
    code: number;
    name: string;
  };
}

const internalErrors: IInternalErrors = {
  not_found: { code: 1, name: "Not Found" },
  invalid_credentials: { code: 2, name: "Invalid credentials" },
  invalid_token: { code: 3, name: "Invalid Token" },
  bad_input: { code: 4, name: "Bad input parameter" },
};

export default internalErrors;
