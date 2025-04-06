const padInteger = (n: number): string => ("0" + n).slice(-2);
export const durationToString = (seconds: number | undefined, long = false): string => {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const min = (seconds - h * 3600) / 60;
  if (long) return h + " h " + (min ? min.toFixed(0) + " min" : "");
  return `${padInteger(h)}:${padInteger(min)}`;
};
