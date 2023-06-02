import { Api400Error } from "@helpers";
import { IParameter } from "@types";

const checkRequiredParameters = (
  object: Record<
    string,
    object | string | number | boolean | null | undefined | unknown
  >,
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
  object: Record<
    string,
    object | string | number | boolean | null | undefined | unknown
  >,
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
  object: Record<
    string,
    object | string | number | boolean | null | undefined | unknown
  >,
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
  object: Record<
    string,
    object | string | number | boolean | null | undefined | unknown
  >,
  representativeName: "req.query" | "req.body" | "req.params" | string,
  fieldName: string,
  type: IParameter["type"]
) => {
  const field = object[fieldName];

  switch (true) {
    case type === "array":
      if (!Array.isArray(field))
        throw new Api400Error(
          `The "${fieldName}" field in ${representativeName} must be an array.`
        );
      break;
    case type === "object":
      if (!(field instanceof Object))
        throw new Api400Error(
          `The "${fieldName}" field in ${representativeName} must be an object.`
        );
      break;
    case Array.isArray(type):
      if (!type.includes(typeof field))
        throw new Api400Error(
          `The "${fieldName}" field in ${representativeName} must be one of the following types: ${type
            .toString()
            .replaceAll(",", " ")}.`
        );
      break;
    default:
      if (typeof field !== type)
        throw new Api400Error(
          `The "${fieldName}" field in ${representativeName} must be of type ${type}.`
        );
  }
};

export const checkProperties = (
  object: Record<
    string,
    object | string | number | boolean | null | undefined | unknown
  >,
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
