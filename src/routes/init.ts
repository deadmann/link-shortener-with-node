import express from 'express'
import { PrismaClient, Role, Mode } from '@prisma/client'
import { hashPassword } from '../utils/hash';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', async (req, res) => {
    const userCount = await prisma.user.count()
    const settingCount = await prisma.setting.count()

    if (userCount > 0 && settingCount > 0) {
        return res.redirect('/')
    }

    res.sendFile('init.html', {root: 'public'})
})

router.post('/', async (req, res) => {
    try {
        const { email, password, confirmPassword, mode } = req.body

        if (!email || !password || password !== confirmPassword) {
            return res.status(400).json({ error: 'Invalid input or passwords do not match' });
        }

        const userCount = await prisma.user.count()
        const settingCount = await prisma.setting.count()

        if (userCount > 0 || settingCount > 0) {
            return res.status(400).json({error: 'Initialization already done'});
        }

        const hashedPassword = await hashPassword(password);

        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: Role.admin
            }
        })

        await prisma.setting.create({
            data: {
                mode: mode === 'private' ? Mode.private : Mode.public
            }
        })

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Init Error:', err);
        return res.status(500).json({ error: 'Initialization failed' });
    }
})

export default router