import bcrypt from 'bcryptjs'

export async function hashPassword(password: string) {
    return bcrypt.hash(password, 12);
}

export async function compareHash(password: string, hash: string) {
    return bcrypt.compare(password, hash);
}