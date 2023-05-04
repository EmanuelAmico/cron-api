import { Request } from "express";
import { Api400Error } from "../errorHandlers/HTTP/httpErrors";
import { IParameter } from "../../../types";

const checkRequiredParameters = (
  body: Request["body"] | Request["query"],
  requiredParameters: string[]
) => {
  for (const parameter of requiredParameters) {
    if (body[parameter] === undefined) {
      throw new Api400Error(
        `Missing required parameter in body or query: ${parameter}`
      );
    }
  }
};

const checkAtLeastOneParameter = (
  body: Request["body"] | Request["query"],
  parameters: string[]
) => {
  console.log(parameters, body);
  if (parameters.every((parameter) => body[parameter] === undefined))
    throw new Api400Error(
      `At least one of the following parameters must be provided: ${parameters.join(
        ", "
      )}.`
    );
};

const checkNotAllowedParameters = (
  body: { [key: string]: any },
  allowedParameters: string[]
) => {
  const notAllowedParameters = [];

  for (const prop in body)
    if (!allowedParameters.includes(prop)) notAllowedParameters.push(prop);

  if (notAllowedParameters.length)
    throw new Api400Error(
      `Unexpected parameters. Not allowed: ${notAllowedParameters.join(", ")}.`
    );
};

const checkTypeOf = (
  body: { [key: string]: any },
  fieldName: string,
  type: "number" | "string" | "boolean" | "array" | "object"
) => {
  const field = body[fieldName];

  switch (type) {
    case "array":
      if (!Array.isArray(field))
        throw new Api400Error(
          `The "${fieldName}" field in the req.body must be an array.`
        );
      break;
    case "object":
      if (!(field instanceof Object))
        throw new Api400Error(
          `The "${fieldName}" field in the req.body must be an object.`
        );
      break;
    default:
      if (typeof field !== type)
        throw new Api400Error(
          `The "${fieldName}" field in the req.body must be of type ${type}.`
        );
  }
};

const validateParameters = (
  body: Request["body"] | Request["query"],
  params: IParameter[]
) => {
  const allowedParameters = params.map(({ field }) => field);
  checkNotAllowedParameters(body, allowedParameters);

  const requiredParameters = params
    .filter(({ optional }) => !optional)
    .filter(({ atLeastOne }) => !atLeastOne)
    .map(({ field }) => field);
  checkRequiredParameters(body, requiredParameters);

  const atLeastOneParameters = params
    .filter(({ atLeastOne }) => atLeastOne)
    .map(({ field }) => field);
  checkAtLeastOneParameter(body, atLeastOneParameters);

  params.forEach(({ field, type }) => {
    if (body[field] !== undefined) {
      checkTypeOf(body, field, type);
    }
  });
};

export { validateParameters };
