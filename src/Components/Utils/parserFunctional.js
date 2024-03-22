import { decode } from '@lapo/asn1js';

function parseASN1Object(asn1Object) {
  if (asn1Object.typeName() !== 'SEQUENCE' && !asn1Object.sub) {
      return asn1Object.content();
  }

  if (asn1Object.sub) {
      const parsedObject = {};
      for (let i = 0; i < asn1Object.sub.length; i++) {
          parsedObject[i] = parseASN1Object(asn1Object.sub[i]);
      }
      return parsedObject;
  }
}

export function parseCertificate(certificateData) {
  const certData = new Uint8Array(certificateData);
  const result = decode(certData);

  if (result.typeName() !== 'SEQUENCE') {
    throw 'Неправильна структура сертифіката (ожидается SEQUENCE)';
  }

  const tbsCertificate = result;

  const decodedData = decode(tbsCertificate.sub[0].stream.enc);
  const parsedCertificate = parseASN1Object(decodedData);

  return parsedCertificate;
}

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


function isDateTimeString(str) {
  const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} UTC$/;
  return dateTimeRegex.test(str.trim());
}

function findAndPrintDateTime(obj) {
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

export function getCertificateInfo(data) {
  const commonNameArr = findValuesByNumber(data, '2.5.4.3');
  const commonName = commonNameArr[1];
  const issuerName = commonNameArr[0];

  const dates = findAndPrintDateTime(data);
  const validityStartDate = dates[1];
  const validityEndDate = dates[0];

  const infoCert = {
    commonName,
     validityStartDate,
     validityEndDate,
     issuerName,
  };

  return infoCert;
}
