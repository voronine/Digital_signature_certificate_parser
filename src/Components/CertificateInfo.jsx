import { getCertificateInfo } from './Utils/parserFunctional';
import styles from './style.module.scss';

export const CertificateInfo = (selectedCertificate) => {
const certificateInfo = getCertificateInfo(selectedCertificate);

  return (
  <div className={styles.informationWindow}>
    <div className={styles.selectedCertificate}>
      <p><b>Common Name:</b> {certificateInfo?.commonName}</p>
      <p><b>Issuer CN:</b> {certificateInfo?.issuerName}</p>
      <p><b>Valid From:</b> {certificateInfo?.validityStartDate}</p>
      <p><b>Valid To:</b> {certificateInfo?.validityEndDate}</p>
    </div>
    </div>
  )
}