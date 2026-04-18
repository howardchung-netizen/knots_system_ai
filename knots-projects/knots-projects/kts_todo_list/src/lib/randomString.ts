import crypto from 'crypto';

export function randomString(options: { length: number, type?: string, characters?: string }) {
  let { length, type, characters } = options;
  if (!characters) {
    switch (type) {
      case 'number':
        characters = '0123456789';
        break;
      case 'hex':
        return crypto.randomBytes(Math.ceil(length * 0.5)).toString('hex').slice(0, length);
      case 'base64':
        return crypto.randomBytes(Math.ceil(length * 0.75)).toString('base64').slice(0, length);
      case 'url-safe':
        characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~';
        break;
      case 'distinguishable':
        characters = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
        break;
      default:
        characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    }
  }
  const characterArray = characters.split('');

  // Generating entropy is faster than complex math operations, so we use the simplest way
  const characterCount = characterArray.length;
  const maxValidSelector = (Math.floor(0x10000 / characterCount) * characterCount) - 1; // Using values above this will ruin distribution when using modular division
  const entropyLength = 2 * Math.ceil(1.1 * length); // Generating a bit more than required so chances we need more than one pass will be really low
  let string = '';
  let stringLength = 0;

  while (stringLength < length) { // In case we had many bad values, which may happen for character sets of size above 0x8000 but close to it
    const entropy = crypto.randomBytes(entropyLength);
    let entropyPosition = 0;

    while (entropyPosition < entropyLength && stringLength < length) {
      const entropyValue = entropy.readUInt16LE(entropyPosition);
      entropyPosition += 2;
      if (entropyValue > maxValidSelector) { // Skip values which will ruin distribution when using modular division
        continue;
      }

      string += characterArray[entropyValue % characterCount];
      stringLength++;
    }
  }

  return string;
};
