import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function isInitialized() {
    const userCount = await prisma.user.count();
    const settingCount = await prisma.setting.count();
    return userCount > 0 && settingCount > 0;
}