import { Request, Response } from 'express'
import User from '../models/User'
import Account, { AccountType, IAccount } from '../models/Account'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../database/database'
import Transaction, { ITransaction } from '../models/Transaction'
import Sequelize from 'sequelize'

/**
 * Returns the active accounts from the current logged user
 */
export const getAccounts = async (req: Request, res: Response) => {
  try {
    const accounts: IAccount[] = await Account.findAll({
      where: { active: true, owner: req.idUser },
      include: [
        {
          model: User,
          where: { active: true },
          attributes: [],
        },
      ],
    })

    res.status(200).json({ accounts })
  } catch (error) {
    res.status(500).json({ msg: 'Get accounts failed - Error 500', error })
  }
}

/**
 * Creates a new account for the authenticated user with its corresponding account number
 */
export const createAccount = async (req: Request, res: Response) => {
  try {
    const { accountType, currentBalance } = req.body
    const newAccount = Account.build()

    if (
      accountType !== AccountType.saving &&
      accountType !== AccountType.checking
    )
      return res.status(400).json({ msg: 'Account type is not valid' })

    if (currentBalance < 0)
      return res.status(400).json({ msg: 'Negative numbers are not allowed' })

    if (currentBalance) newAccount.currentBalance = currentBalance
    newAccount.accountNumber = uuidv4().split('-').slice(0, -2).join('-')

    if (req.idUser) newAccount.owner = req.idUser
    newAccount.accountType = accountType as AccountType

    const savedAccount = await newAccount.save()

    res.status(201).json({ account: savedAccount })
  } catch (error) {
    res.status(500).json({ msg: 'Create Account failed - Error 500', error })
  }
}

/**
 * Deletes the user authenticated account by setting active = false
 * @important This route does not belong to the exported routes of the API
 */
export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const { idAccount } = req.params

    const filter = { where: { active: true, idAccount, owner: req.idUser } }
    const accountFound = await Account.findOne(filter)
    if (!accountFound) return res.status(404).json({ msg: 'Account not found' })

    accountFound.active = false
    const deletedAccount = await accountFound.save()

    return res.status(200).json({ account: deletedAccount })
  } catch (error) {
    res.status(500).json({ msg: 'Delete Account failed - Error 500', error })
  }
}

/**
 * Creates a new transaction between two accounts
 */
export const createTransaction = async (req: Request, res: Response) => {
  let transaction: Sequelize.Transaction | null = null

  try {
    const { transmitter, receiver, amount }: ITransaction = req.body

    const transmitterAccount = await Account.findOne({
      where: { accountNumber: transmitter, active: true },
    })

    const receiverAccount = await Account.findOne({
      where: { accountNumber: receiver, active: true },
    })

    if (
      !req.idUser ||
      !transmitterAccount ||
      !receiverAccount ||
      transmitterAccount.owner !== req.idUser
    ) {
      return res.status(400).json({ msg: 'Invalid account' })
    }

    if (transmitterAccount.accountNumber === receiverAccount.accountNumber) {
      return res.status(400).json({
        msg: 'Transmitter and Receiver cannot have the same account number',
      })
    }

    if (transmitterAccount.accountType !== receiverAccount.accountType) {
      return res.status(400).json({ msg: 'Account types do not match' })
    }

    if (transmitterAccount.currentBalance < amount) {
      return res.status(400).json({ msg: 'Insufficient funds' })
    }

    // initializing transaction
    transaction = await db.transaction()

    const parsedAmount = parseFloat(amount.toString())

    transmitterAccount.currentBalance -= parsedAmount
    receiverAccount.currentBalance =
      parseFloat(receiverAccount.currentBalance.toString()) + parsedAmount

    await transmitterAccount.save({ transaction })
    await receiverAccount.save({ transaction })

    const newTransaction = Transaction.build()

    newTransaction.transmitter = transmitterAccount.accountNumber
    newTransaction.receiver = receiverAccount.accountNumber
    newTransaction.amount = amount

    const savedTransaction = await newTransaction.save({ transaction })

    await transaction.commit()
    return res.status(201).json({ transaction: savedTransaction })
  } catch (error) {
    if (transaction) {
      await transaction.rollback()
    }

    res
      .status(500)
      .json({ msg: 'Create Transaction failed - Error 500', error })
  }
}

/**
 * Returns a list of transactions where the idAccount is transmitter or receiver
 */
export const getTransactionsByIdAccount = async (
  req: Request,
  res: Response
) => {
  try {
    const { idAccount } = req.params

    const account = await Account.findOne({
      where: { idAccount, owner: req.idUser, active: true },
    })
    if (!account) return res.status(404).json({ msg: 'Account not found' })

    const transactions = await Transaction.findAll({
      where: {
        transmitter: account.accountNumber,
      },
      include: [
        {
          model: Account,
          attributes: [
            'owner',
            'accountNumber',
            'accountType',
            'currentBalance',
          ],
        },
      ],
    })

    res.status(200).json({ transactions })
  } catch (error) {
    res
      .status(500)
      .json({ msg: 'Get Transactions by idAccount failed - Error 500', error })
  }
}
