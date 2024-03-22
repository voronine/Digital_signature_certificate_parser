import { getCertificateInfo } from "./Utils/parserFunctional";
import styles from './style.module.scss';

export const CertificatsTable = ({certificates, handleCertificateClick, selectedCertificateIndex}) => {
  return (
    certificates?.map((certificate, index) => {
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
      );
    })
  );
};