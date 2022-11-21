export default function sortBy (fields: string[]) {
  return (a: any, b: any): number => {
    for (const field of fields) {
      const aval = a[field], bval = b[field]
      if (typeof aval !== undefined) {
        if (typeof bval !== undefined) {
          if (aval < bval) { return -1 }
          else if (aval > bval) { return 1 }
        } else {
          return -1 // Defined before undefined
        }
      } else if (typeof bval !== undefined) {
        return 1 // Defined before undefined
      }
    }
    return 0
  }
}
