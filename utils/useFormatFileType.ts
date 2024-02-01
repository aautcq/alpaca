export function useFormatFileType(type: string) {
  switch (type) {
    case 'text/plain':
      return 'txt'
    case 'application/pdf':
      return 'pdf'
    default:
      return 'unknown'
  }
}
