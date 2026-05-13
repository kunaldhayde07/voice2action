export const getQueryString = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.find((entry): entry is string => typeof entry === 'string');
  }
  return undefined;
};

export const getQueryNumber = (value: unknown): number | undefined => {
  const text = getQueryString(value);
  if (text === undefined || text.trim() === '') return undefined;

  const number = Number(text);
  return Number.isFinite(number) ? number : undefined;
};
