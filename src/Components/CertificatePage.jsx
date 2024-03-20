import React, { useEffect, useRef, useState } from 'react';
import styles from './style.module.scss';
import { decode } from '@lapo/asn1js';

const CertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [isPress, setIsPress] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [startLoad, setStartLoad] = useState(false);
  const [selectedCertificateIndex, setSelectedCertificateIndex] = useState(null);

  const fileInputRef = useRef(null);

  const handleAddButtonClick = () => {
    setIsPress(!isPress);
  };

  const handleCertificateClick = (certificate, index) => {
    setIsPress(false);
    setSelectedCertificate(certificate);
    setSelectedCertificateIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    const reader = new FileReader();
  
    reader.onload = (e) => {
      const certificateData = e.target.result;
  
      try {
        const parsedCertificate = parseCertificate(certificateData);
        const isDuplicate = certificates.find(cert => {
          return JSON.stringify(cert) === JSON.stringify(parsedCertificate);
        });
  
        if (!isDuplicate) {
          const updatedCertificates = [...certificates, parsedCertificate];
          setCertificates(updatedCertificates);
          localStorage.setItem('certificates', JSON.stringify(updatedCertificates));
        } else {
          alert('Такой сертификат уже существует в списке.');
        }
      } catch (error) {
        console.error('Не удалось распарсить сертификат:', error);
      }
    };
  
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const certificateData = e.target.result;
  
      try {
        const parsedCertificate = parseCertificate(certificateData);
        const isDuplicate = certificates.find(cert => {
          return JSON.stringify(cert) === JSON.stringify(parsedCertificate);
        });
  
        if (!isDuplicate) {
          const updatedCertificates = [...certificates, parsedCertificate];
          setCertificates(updatedCertificates);
          localStorage.setItem('certificates', JSON.stringify(updatedCertificates));
        } else {
          alert('Такой сертификат уже существует в списке.');
        }
      } catch (error) {
        console.error('Не удалось распарсить сертификат:', error);
      }
    };
  
    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    setIsPress(false);
    setStartLoad(true);
    const storedCertificates = localStorage.getItem('certificates');
    if (storedCertificates) {
      setCertificates(JSON.parse(storedCertificates));
    }
  }, []);

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

   function parseCertificate(certificateData) {
    const certData = new Uint8Array(certificateData);
    const result = decode(certData);

    if (result.typeName() !== 'SEQUENCE') {
      throw 'Неправильная структура сертификата (ожидается SEQUENCE)';
    }

    const tbsCertificate = result;

    const decodedData = decode(tbsCertificate.sub[0].stream.enc);
    const parsedCertificate = parseASN1Object(decodedData);
  
    return parsedCertificate;
  } 

  function findValuesByNumber(parsedCertificate, number, resultArray = []) {
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

  function getCertificateInfo(data) {
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

const certificateInfo = getCertificateInfo(selectedCertificate);
  

  return (
    <div className={styles.container}>
      <div className={styles.leftPart}>
        <button className={styles.addButton} onClick={handleAddButtonClick}>
          {isPress ? 'Назад' : 'Добавити'}
        </button>
         {certificates.length !== 0 ? (
          <table>
            <tbody>
              {certificates?.map((certificate, index) => {
                const certificateInfo = getCertificateInfo(certificate);
                const isSelected = index === selectedCertificateIndex;
                return (
                  <tr
                    key={index + 1}
                    onClick={() => handleCertificateClick(certificate, index)}
                    className={isSelected ? styles.selectedRow : null}
                  >
                    <td className={styles.certificatInfo}>
                    <span>{certificateInfo.commonName}</span>
                    <span>&gt;</span>
                    </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <p>Нема жодного сертифікату</p>
        )}
      </div>

      <div className={styles.rightPart}>
        {(!startLoad || isPress) ? (
          <div className={styles.drag_Drop}>
            <label
              htmlFor="file"
              ref={fileInputRef}
              onDrop={(e) => handleDrop(e)}
              onDragOver={handleDragOver}
              className={styles.labelDrop}

            >
              <input
                type="file"
                id="file"
                name="file"
                onChange={(e) => handleFileChange(e)}
                className={styles.labelDrog}
              />
              <div className={styles.textDrop}>
              <p>Перетягніть файл сертифікату сюди </p>
              <p>або</p>
             </div>
            </label>
            <label className={styles.label} htmlFor="file">
              <span>Виберіть через стандартний діалог</span>
            </label>
          </div>
        ) : (
            <div className={styles.informationWindow}>
              {selectedCertificate &&
                <div className={styles.selectedCertificate}>
                  <p><b>Common Name:</b> {certificateInfo?.commonName}</p>
                  <p><b>Issuer CN:</b> {certificateInfo?.issuerName}</p>
                  <p><b>Valid From:</b> {certificateInfo?.validityStartDate}</p>
                  <p><b>Valid To:</b> {certificateInfo?.validityEndDate}</p>
                </div>
              }
            </div>
          )}
      </div>
    </div>
  );
};

export default CertificatesPage;