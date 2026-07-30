export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function stripPunctuation(value: string) {
  return value.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ');
}