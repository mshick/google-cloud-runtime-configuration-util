export function constantCase(input: string): string {
  return (
    input
      .trim()
      // Split camelCase
      .replace(/([a-z0-9])([A-Z])/g, '$1\0$2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1\0$2')
      // Normalize delimiters
      .replace(/[_-]/g, '\0')
      // Replace non-alphanumeric
      .replace(/[^A-Z0-9\0]+/gi, '')
      // Convert delimiters to _
      .replace(/\x00/g, '_')
      // Uppercase
      .toUpperCase()
  )
}

export function validateVariableName(name: string): void {
  if (name.length > 256) {
    throw new Error('Variable name is over 256 characters')
  }

  if (name.replace(/\//, '').length === 0) {
    throw new Error('Variable name is must contain at least one non-slash character')
  }

  const disallowedChars = name.replace(/[0-9A-Za-z/](?:[_.A-Za-z0-9-]{0,62}[_.A-Za-z0-9])?/g, '')

  if (disallowedChars.length > 0) {
    throw new Error(`Variable name contains disallowed charaters - ${disallowedChars}`)
  }
}
