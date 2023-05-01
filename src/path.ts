export function dirname (path: string) {
  if (path.length === 0) { return '' }

  let lastSlashIndex = -1;

  for (let i = path.length - 1; i >= 1; --i) {
    if (path[i] === '/') {
      lastSlashIndex = i
      break
    }
  }

  if (lastSlashIndex > 0) {
    return path.substring(0, lastSlashIndex)
  } else {
    return ''
  }
}
