export const omit = <
  ObjectType extends object,
  KeysToExclude extends keyof ObjectType
>(
  object: ObjectType,
  keys: KeysToExclude[]
) => {
  const clone = { ...object };

  for (const key of keys) {
    delete clone[key];
  }

  return clone as Omit<ObjectType, KeysToExclude>;
};

export const pick = <
  ObjectType extends object,
  KeysToInclude extends keyof ObjectType
>(
  object: ObjectType,
  keys: KeysToInclude[]
) => {
  const clone = {} as Pick<ObjectType, KeysToInclude>;

  for (const key of keys) {
    clone[key] = object[key];
  }

  return clone;
};

export const levenshteinDistance = (a: string, b: string) => {
  const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
};

export const findMostSimilar = (input: string, candidates: string[]) => {
  let mostSimilar = candidates[0];
  let minDistance = levenshteinDistance(input, mostSimilar);

  for (const candidate of candidates.slice(1)) {
    const distance = levenshteinDistance(input, candidate);
    if (distance < minDistance) {
      minDistance = distance;
      mostSimilar = candidate;
    }
  }

  return mostSimilar;
};

export const filterSimilar = (
  target: string,
  arr: string[],
  similarityThreshold = 6
): string[] => {
  return arr.filter(
    (item) => levenshteinDistance(target, item) <= similarityThreshold
  );
};
