export function useFormatDate(date: Date, options: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
}) {
  return new Intl.DateTimeFormat('en', options).format(date)
}
