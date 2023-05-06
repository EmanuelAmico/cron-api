export const formattedDate = (date: Date) => {
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  });
};

export const formattedNowDate = () => {
  const today = new Date();
  return formattedDate(today);
};

export const timeRemaining = (date: Date | string) => {
  const today = new Date();
  const dateToCompare = new Date(date);
  const diff = dateToCompare.getTime() - today.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
  };
};

export const timeDifferenceInMs = (date: Date | string) => {
  const today = new Date();
  const dateToCompare = new Date(date);
  const diff = dateToCompare.getTime() - today.getTime();
  if (diff < 0) throw new Error("Invalid date, must be in the future.");
  return diff;
};
