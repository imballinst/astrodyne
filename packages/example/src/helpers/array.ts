/**
 * Converts a string into an array of each characters.
 */
export function splitCharacters(str: string): { array: string[] } {
  const array = str.split('');
  return { array };
}
