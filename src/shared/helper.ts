import * as bcrypt from 'bcryptjs';
export async function hash(input): Promise<string> {
  return bcrypt.hash(input, 10);
}

export async function comparePassword(
  rawPassword: string,
  hashPassword: string,
): Promise<boolean> {
  return bcrypt.compare(rawPassword, hashPassword);
}
