export function findValuesByNumber(parsedCertificate, number, resultArray = []) {
  for (const key in parsedCertificate) {
      if (parsedCertificate.hasOwnProperty(key)) {
          const value = parsedCertificate[key];
          if (typeof value === 'object' && value !== null) {
              findValuesByNumber(value, number, resultArray);
          } else if (key === '0' && value.trim().startsWith(number)) {
              if ('1' in parsedCertificate) {
                  resultArray.push(parsedCertificate['1']);
              }
          }
      }
  }
  return resultArray;
}