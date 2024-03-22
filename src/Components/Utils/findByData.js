export function findAndPrintDateTime(obj) {
  let dates = [];
  for (let key in obj) {
      if (typeof obj[key] === 'object') {
          dates = dates.concat(findAndPrintDateTime(obj[key]));
      } else if (typeof obj[key] === 'string' && isDateTimeString(obj[key])) {
          dates.push(obj[key].substring(0, 10));
      }
  }
  return dates;
}

function isDateTimeString(str) {
  const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} UTC$/;
  return dateTimeRegex.test(str.trim());
}
