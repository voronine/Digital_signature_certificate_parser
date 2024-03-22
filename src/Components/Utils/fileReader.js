import { parseCertificate } from './parserFunctional';

export const handleFile = async (file, certificates, setCertificates) => {
  try {
    const certificateData = await readFileAsync(file);
    const parsedCertificate = parseCertificate(certificateData);

    const isDuplicate = certificates.some((cert) =>
      isEqual(parsedCertificate, cert)
    );

    if (!isDuplicate) {
      const updatedCertificates = [...certificates, parsedCertificate];
      setCertificates(updatedCertificates);
      localStorage.setItem('certificates', JSON.stringify(updatedCertificates));
    } else {
      alert('Такой сертифікат вже існує у списку');
    }
  } catch (error) {
    console.error('Не вдалося распарсити сертифікат', error);
  }
};

const readFileAsync = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

const isEqual = (obj1, obj2) => JSON.stringify(obj1) === JSON.stringify(obj2);