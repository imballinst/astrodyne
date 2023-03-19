/**
 * $title: Array helpers
 * $description: This file contains the array helpers.
 *
 * Hello world, this is the package description
 *
 * @packageDocumentation
 */

/**
 * Converts a string into an array of each characters.
 */
export function splitCharacters(str: string): { array: string[] } {
  const array = str.split('');
  return { array };
}
