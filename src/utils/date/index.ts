export const formattedNowDate = () => {
  const today = new Date();
  return today.toLocaleDateString("es-AR", {
    hour: "numeric",
    minute: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  });
};
