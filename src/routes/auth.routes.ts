import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import {PrismaClient, Mode, Role} from '@prisma/client'
import {hashPassword} from "../utils/hash";

const prisma = new PrismaClient()
const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'
const COOKIE_NAME = 'token'

// Helper to check if public registration is enabled
async function isPublicMode() {
    const setting = await prisma.setting.findFirst();
    return setting?.mode === Mode.public;
}

// Registration routes: use separate registration template
router.get('/register', async (req, res) => {
    if (!(await isPublicMode())) return res.status(404).send('Not Found');
    res.locals.title = 'Register';
    return res.render('registration-form', { error: null, email: '' });
})

router.post('/register', async (req, res) => {
    if (!(await isPublicMode())) return res.status(404).send('Not Found');
    const { email, password, confirmPassword } = req.body;
    try {
        if (!email || !password || password !== confirmPassword) throw new Error('Invalid input or passwords do not match');
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) throw new Error('Email already exists');
        const hashed = await hashPassword(password);
        await prisma.user.create({ data: { email, password: hashed, role: Role.user } });
        return res.redirect('/auth/login');
    } catch (err: any) {
        return res.render('registration-form', { error: err.message, email: req.body.email || '' });;
    }
});

// Login
router.get('/login', async (req, res) => {
    res.locals.title = 'Login';
    res.render('login', { error: null})
})

router.post('/login', async (req, res) => {
    const {email, password} = req.body
    const user = await prisma.user.findUnique({where: {email}})

    if (!user || !(await bcrypt.compare(password, user.password))){
        return res.status(401).render('login', {error: 'Invalid Credentials'})
    }

    const token = jwt.sign({id: user.id, role: user.role}, JWT_SECRET, {expiresIn: '7d'})
    res
        .cookie(COOKIE_NAME, token, {httpOnly: true, sameSite: 'lax', secure: false})
        .redirect('/')
})

// Logout
router.post('/logout', async (req, res) => {
    res.clearCookie(COOKIE_NAME).json({message: 'Logged out'})
})

export default router;