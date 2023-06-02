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
  const now = new Date();
  return formattedDate(now);
};

export const timeRemaining = (date: Date | string) => {
  const now = new Date();
  const dateToCompare = new Date(date);
  const diff = dateToCompare.getTime() - now.getTime();
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

export const parseFormattedDate = (dateString: string) => {
  const [datePart, timePart] = dateString.split(", ");
  const [day, month, year] = datePart.split("/");
  const [hour, minute] = timePart.split(":");

  // Adjust for the Argentina time zone UTC-3
  const date = new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour) + 3,
      Number(minute)
    )
  );

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${dateString}`);
  }

  return date;
};

export const timeDifferenceInMs = (date: Date | string) => {
  const now = new Date();
  const dateToCompare = new Date(date);
  const diff = dateToCompare.getTime() - now.getTime();
  if (diff < 0) throw new Error("Invalid date, must be in the future.");
  return diff;
};
