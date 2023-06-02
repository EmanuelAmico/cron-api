export const formatDate = (date: Date) => {
  const standardizedDate = date;
  return `${
    standardizedDate.getUTCDate() < 10
      ? `0${standardizedDate.getUTCDate()}`
      : standardizedDate.getUTCDate()
  }/${
    standardizedDate.getUTCMonth() + 1 < 10
      ? `0${standardizedDate.getUTCMonth() + 1}`
      : standardizedDate.getUTCMonth() + 1
  }`;
};

export const formatTime = (time: string) => {
  const standardizedTime = time;
  return standardizedTime.substring(0, time.length - 3);
};
