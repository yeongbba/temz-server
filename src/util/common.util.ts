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

export function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}
