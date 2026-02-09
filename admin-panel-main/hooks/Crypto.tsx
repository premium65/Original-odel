import CryptoJS from 'crypto-js';

// Utility function to replace special characters for encryption/decryption
const replaceSpecialCharacter = (value: string, type: string): string => {
  try {
    let textValue = value;

    if (textValue && typeof textValue === 'string') {
      if (type === 'encrypt') {
        // Replace special characters during encryption
        textValue = textValue
          .replace(/\+/g, 'xMl3Jk')
          .replace(/\//g, 'Por21Ld')
          .replace(/=/g, 'Ml32');
      } else if (type === 'decrypt') {
        // Replace special characters back to original during decryption
        textValue = textValue
          .replace(/xMl3Jk/g, '+')
          .replace(/Por21Ld/g, '/')
          .replace(/Ml32/g, '=');
      }
    }

    return textValue;
  } catch (error) {
    console.error('Error in replaceSpecialCharacter:', error);
    return value;
  }
};

// Encryption function
export const encryptData = (data: string, secretKey: string): string | null => {
  try {
    const ciphertext = CryptoJS.AES.encrypt(data, secretKey).toString();
    // Replace special characters for URL-safe encryption
    return replaceSpecialCharacter(ciphertext, 'encrypt');
  } catch (error) {
    console.error('Error encrypting data:', error);
    return null;
  }
};

// Decryption function
export const decryptData = (ciphertext: string, secretKey: string): string | null => {
  try {
    // Replace special characters back to original before decryption
    const originalCiphertext = replaceSpecialCharacter(ciphertext, 'decrypt');
    const bytes = CryptoJS.AES.decrypt(originalCiphertext, secretKey);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    
    return decryptedData;
  } catch (error) {
    console.error('Error decrypting data:', error);
    return null;
  }
};
