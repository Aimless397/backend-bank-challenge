import { Router, Request, Response } from 'express'
import { signup } from '../controllers/auth.controller'
import {
  deleteUser,
  getUserById,
  getUsers,
} from '../controllers/user.controller'
import { tokenValidation } from '../middlewares/verifyToken'

const router: Router = Router()

// /api/users
router.get('/', getUsers)
router.get('/:idUser', tokenValidation, getUserById)
router.delete('/:idUser', tokenValidation, deleteUser)

export default router
