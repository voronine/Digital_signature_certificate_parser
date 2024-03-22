import { decode } from '@lapo/asn1js';
import { findValuesByNumber } from './findByValues';
import { findAndPrintDateTime } from './findByData';

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
