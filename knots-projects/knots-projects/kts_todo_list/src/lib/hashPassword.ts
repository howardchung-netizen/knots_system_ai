import bcrypt from 'bcryptjs';

export function hashPassword(password: string, salt: string | number = 10): Promise<string> {
  return bcrypt.hash(password, salt);
}

export function hasScreenUnlockPin(pin: string): Promise<string> {
  return hashPassword(pin, 6);
}
