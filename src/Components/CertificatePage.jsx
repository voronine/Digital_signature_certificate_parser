import React, { useEffect, useRef, useState } from 'react';
import styles from './style.module.scss';
import { getCertificateInfo } from './Utils/parserFunctional';
import { handleFile } from './Utils/fileReader';

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
    handleFile(file, certificates, setCertificates);
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFile(file,certificates, setCertificates);
  };

  useEffect(() => {
    setIsPress(false);
    setStartLoad(true);
    const storedCertificates = localStorage.getItem('certificates');
    if (storedCertificates) {
      setCertificates(JSON.parse(storedCertificates));
    }
  }, []);

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