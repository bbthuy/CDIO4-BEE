import * as os from 'os';
// Add new utils functions to here.
export function isValidCurrencyCode(code: string): boolean {
  const regex = /^[A-Z]{3}$/;
  return regex.test(code);
}

export const matchLuhn = (cardNo): boolean => {
  try {
    const cardNoArr = Array.from(cardNo).map(Number);

    for (let i = cardNoArr.length - 2; i >= 0; i -= 2) {
      cardNoArr[i] *= 2;
      cardNoArr[i] = Math.floor(cardNoArr[i] / 10) + (cardNoArr[i] % 10);
    }

    const sum = cardNoArr.reduce((acc, digit) => acc + digit, 0);

    return sum % 10 === 0;
  } catch (e) {
    return false;
  }
};

export const getServerIp = (): string => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      // Skip over internal (i.e., 127.0.0.1) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1'; // Fallback if no external IPv4 address is found
};
