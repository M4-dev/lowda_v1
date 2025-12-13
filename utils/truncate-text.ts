export const truncateText = (str: string, maxLength: number = 26) => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + "...";
};
