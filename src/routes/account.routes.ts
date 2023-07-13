import { Router } from 'express'
import {
  createAccount,
  createTransaction,
  deleteAccount,
  getAccounts,
  getTransactionsByIdAccount,
} from '../controllers/account.controller'
import { tokenValidation } from '../middlewares/verifyToken'

const router: Router = Router()

// /api/accounts
router.get('/', tokenValidation, getAccounts)
router.post('/', tokenValidation, createAccount)
router.delete('/:idAccount', tokenValidation, deleteAccount)

router.post('/transactions', tokenValidation, createTransaction)
router.get(
  '/:idAccount/transactions',
  tokenValidation,
  getTransactionsByIdAccount
)

export default router
