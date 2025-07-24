import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'
const COOKIE_NAME = 'token'

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