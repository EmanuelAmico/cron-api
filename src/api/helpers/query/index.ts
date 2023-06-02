import { Query } from "@types";

export const queryUrlGen = (query: Query, baseURL: string): string => {
  if (!query) return baseURL;
  return Object.entries(query).reduce(
    (acc, [key, value], i) =>
      i === 0 ? `${acc}?${key}=${value}` : `${acc}&${key}=${value}`,
    baseURL
  );
};
