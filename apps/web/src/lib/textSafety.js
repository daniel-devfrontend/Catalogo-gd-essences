export const preserveExactText = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  const asString = typeof value === 'string' ? value : String(value);

  return asString
    .replace(/\u0000/g, '')
    .replace(/[\u0001-\u001F\u007F]/g, '');
};

export const preserveExactName = (value) => preserveExactText(value);
export const preserveExactTitle = (value) => preserveExactText(value);