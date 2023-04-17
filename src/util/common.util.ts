export function createSortMap(sort: string) {
  const sorts = sort.split(',');
  const sortMap = {};

  for (const s of sorts) {
    if (s.startsWith('-')) {
      sortMap[s.slice(1)] = -1;
    } else {
      sortMap[s] = 1;
    }
  }

  return sortMap;
}
