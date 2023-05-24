import { Api400Error } from "../errorHandlers/HTTP/httpErrors";
import { IParameter } from "../../../types";

const checkRequiredParameters = (
  object: {
    [key: string]:
      | object
      | string
      | number
      | boolean
      | null
      | undefined
      | unknown;
  },
  representativeName: "req.query" | "req.body" | "req.params" | string,
  requiredParameters: string[]
) => {
  for (const parameter of requiredParameters) {
    if (object[parameter] === undefined) {
      throw new Api400Error(
        `Missing required parameter in ${representativeName}: ${parameter}`
      );
    }
  }
};

const checkAtLeastOneParameter = (
  object: {
    [key: string]:
      | object
      | string
      | number
      | boolean
      | null
      | undefined
      | unknown;
  },
  representativeName: "req.query" | "req.body" | "req.params" | string,
  parameters: string[]
) => {
  if (!parameters.length) return;
  if (parameters.every((parameter) => object[parameter] === undefined))
    throw new Api400Error(
      `At least one of the following parameters must be provided in ${representativeName}: ${parameters.join(
        ", "
      )}.`
    );
};

const checkNotAllowedParameters = (
  object: {
    [key: string]:
      | object
      | string
      | number
      | boolean
      | null
      | undefined
      | unknown;
  },
  representativeName: "req.query" | "req.body" | "req.params" | string,
  allowedParameters: string[]
) => {
  const notAllowedParameters = [];

  for (const prop in object)
    if (!allowedParameters.includes(prop)) notAllowedParameters.push(prop);

  if (notAllowedParameters.length)
    throw new Api400Error(
      `Unexpected parameters in ${representativeName}. Not allowed: ${notAllowedParameters.join(
        ", "
      )}.`
    );
};

const checkTypeOf = (
  object: {
    [key: string]:
      | object
      | string
      | number
      | boolean
      | null
      | undefined
      | unknown;
  },
  representativeName: "req.query" | "req.body" | "req.params" | string,
  fieldName: string,
  type: "number" | "string" | "boolean" | "array" | "object"
) => {
  const field = object[fieldName];

  switch (type) {
    case "array":
      if (!Array.isArray(field))
        throw new Api400Error(
          `The "${fieldName}" field in ${representativeName} must be an array.`
        );
      break;
    case "object":
      if (!(field instanceof Object))
        throw new Api400Error(
          `The "${fieldName}" field in ${representativeName} must be an object.`
        );
      break;
    default:
      if (typeof field !== type)
        throw new Api400Error(
          `The "${fieldName}" field in ${representativeName} must be of type ${type}.`
        );
  }
};

const checkProperties = (
  object: {
    [key: string]:
      | object
      | string
      | number
      | boolean
      | null
      | undefined
      | unknown;
  },
  representativeName: "req.query" | "req.body" | "req.params" | string,
  params: IParameter[]
) => {
  const allowedParameters = params.map(({ field }) => field);
  checkNotAllowedParameters(object, representativeName, allowedParameters);

  const requiredParameters = params
    .filter(({ optional }) => !optional)
    .filter(({ atLeastOne }) => !atLeastOne)
    .map(({ field }) => field);
  checkRequiredParameters(object, representativeName, requiredParameters);

  const atLeastOneParameters = params
    .filter(({ atLeastOne }) => atLeastOne)
    .map(({ field }) => field);
  checkAtLeastOneParameter(object, representativeName, atLeastOneParameters);

  params.forEach(({ field, type }) => {
    if (object[field] !== undefined) {
      checkTypeOf(object, representativeName, field, type);
    }
  });
};

export { checkProperties };
