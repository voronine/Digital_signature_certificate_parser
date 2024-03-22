import { parseCertificate } from './parserFunctional';

export const handleFile = (file, certificates, setCertificates) => {
  const reader = new FileReader();

  reader.onload = (e) => {
    const certificateData = e.target.result;

    try {
      const parsedCertificate = parseCertificate(certificateData);
      const isDuplicate = certificates.find((cert) => {
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
