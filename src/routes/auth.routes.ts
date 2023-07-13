import { Router, Request, Response } from 'express'
import { signin, signup } from '../controllers/auth.controller'

const router: Router = Router()

// /api/auth
router.post('/login', signin)
router.post('/register', signup)

export default router
