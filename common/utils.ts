// Remove all chars that are not letters, numbers, spaces, colon or dashes
export function cleanString(text: string) {
  return text.toString().replace(/[^\w\s-:]/gi, '');
}
