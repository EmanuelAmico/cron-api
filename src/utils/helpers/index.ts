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
