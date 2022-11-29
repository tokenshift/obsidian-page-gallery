import { get } from 'object-path'

export default function sortBy (fields: string[]) {
  return (a: any, b: any): number => {
    for (let field of fields) {
      field = field.trim().toLowerCase()
      let reverse = 1

      if (field.startsWith('-')) {
        reverse = -1
        field = field.substring(1)
      }

      const aval = get(a, field), bval = get(b, field)
      if (typeof aval !== undefined) {
        if (typeof bval !== undefined) {
          if (aval < bval) { return -1 * reverse }
          else if (aval > bval) { return 1 * reverse }
        } else {
          return -1 * reverse // Defined before undefined
        }
      } else if (typeof bval !== undefined) {
        return 1 * reverse // Defined before undefined
      }
    }

    return 0
  }
}
