import express from 'express'
import {PrismaClient, Role} from '@prisma/client'
import {requireAuth, requireAdmin, requireOwner} from "../middleware/auth.middleware"
import { hashPassword } from "../utils/hash";

const prisma = new PrismaClient()
const router = express.Router()

/**
 * List users
 * Admin and Owner see all users; Owner distinguished.
 */
router.get('/', requireAuth, requireAdmin, async (req, res) => {
    const users = await prisma.user.findMany({
        select: { id: true, email: true, role: true, createdAt: true}
    })
    const currentUser = (req as any).user;
    res.render('users', { users, currentUser,  error: null })
})

/**
 * Show create form
 * Only Owner can create new Admin or User
 */
router.get('/create', requireAuth, requireOwner, (req, res) => {
    const currentUser = (req as any).user;
    res.render('user-form', { user: null, mode: 'create', currentUser, error: null });
});

/**
 * Create user
 */
router.post('/create', requireAuth, requireOwner, async (req, res) => {
    const {email, password, role} = req.body
    const currentUser = (req as any).user;
    try{
        if(!email || !password) throw new Error('Email and Password required')

        const hashedPassword = await hashPassword(password)

        await prisma.user.create({ data: { email, password: hashedPassword, role: role as Role}})

        res.redirect('/users')
    } catch (err: any) {
        res.render('user-form', { user: req.body, mode: 'create', currentUser, error: err.message })
    }
})

/**
 * Show edit form
 * Admin and Owner can edit users, but only Owner can change roles
 */
router.get('/:id/edit', requireAuth, requireAdmin, async (req, res) => {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } })
    if(!user) return res.redirect('/users')
    const currentUser = (req as any).user;
    res.render('user-form', { user, mode: 'edit', currentUser, error: null })
})

/**
 * Update user
 */
router.post('/:id/edit', requireAuth, requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { email, role } = req.body
    const currentUser = (req as any).user;
    try {
        if (!email) throw new Error('Email required');

        // Prevent demoting or changing owner by non-owner
        const existing = await prisma.user.findUnique({ where: { id } });
        if (existing?.role === Role.owner && currentUser.role !== Role.owner) {
            throw new Error('Cannot modify owner');
        }

        // Only owner can change role
        const data: any = { email };
        if ((req as any).user.role === Role.owner && role) data.role = role;
        await prisma.user.update({ where: { id }, data });
        return res.redirect('/users');
    } catch (err: any) {
        return res.render('user-form', { user: { id, email, role }, mode: 'edit', currentUser, error: err.message });
    }
})

/**
 * Delete user
 * Only Owner can delete admins/users, cannot delete self
 */
router.post('/:id/delete', requireAuth, requireAdmin, async (req, res) => {
    const { id } = req.params;
    const currentUser = (req as any).user;
    if (currentUser.id === id) {
        return res.redirect('/users'); // Prevent self-delete
    }
    await prisma.user.delete({ where: { id: req.params.id } })
    res.render('/users')
})

export default router