import request from 'supertest'
import { faker } from '@faker-js/faker'

import app from '../app'
import { AccountType, IAccount } from '../models/Account'

describe('Account Controller', () => {
  let globalUser: {
    idUser?: string
    username: string
    email: string
    password: string
    name: string
    lastname: string
  }
  let authToken: string

  beforeAll(async () => {
    globalUser = {
      username: faker.internet.displayName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      name: faker.person.firstName(),
      lastname: faker.person.lastName(),
    }

    const response = await request(app)
      .post('/api/auth/register')
      .send(globalUser)
    const { user, token } = response.body
    globalUser.idUser = user.idUser
    authToken = token
  })

  describe('GetAccounts', () => {
    it('Should return a list of accounts of the authenticated user', async () => {
      const response = await request(app)
        .get(`/api/accounts`)
        .set('auth-token', authToken)
      const { accounts } = response.body

      expect(accounts).toBeDefined()
      expect(accounts.length).toBeGreaterThanOrEqual(0)
      expect(response.status).toBe(200)
    })
  })

  describe('CreateAccount', () => {
    it('should create an account belonging to the authenticated user', async () => {
      const accountData = {
        accountType: AccountType.saving,
        currentBalance: Number(faker.number.bigInt({ max: 1000 })),
      }

      const response = await request(app)
        .post(`/api/accounts`)
        .send(accountData)
        .set('auth-token', authToken)
      const { account } = response.body

      expect(account).toBeDefined()
      expect(account).toHaveProperty('idAccount')
      expect(account).toHaveProperty('owner')
      expect(account).toHaveProperty('accountNumber')
      expect(account).toHaveProperty('accountType')
      expect(account).toHaveProperty('currentBalance')
      expect(account).toHaveProperty('active')
      expect(account.accountType).toBe(accountData.accountType)
      expect(account.currentBalance).toBe(accountData.currentBalance.toString())
      expect(response.status).toBe(201)
    })

    it('should throw 400 - BadRequestException when an invalid accountType value is sent', async () => {
      const accountData = {
        accountType: 'moneyMarket',
        currentBalance: Number(faker.number.int({ max: 1000 })),
      }

      const response = await request(app)
        .post(`/api/accounts`)
        .send(accountData)
        .set('auth-token', authToken)
      const { msg } = response.body

      expect(msg).toBe('Account type is not valid')
      expect(response.status).toBe(400)
    })

    it('should throw 400 - BadRequestException when an invalid accountType value is sent', async () => {
      const accountData = {
        accountType: AccountType.saving,
        currentBalance: faker.number.int({ max: 1000 }) * -1,
      }

      const response = await request(app)
        .post(`/api/accounts`)
        .send(accountData)
        .set('auth-token', authToken)
      const { msg } = response.body

      expect(msg).toBe('Negative numbers are not allowed')
      expect(response.status).toBe(400)
    })
  })

  describe('CreateTransaction', () => {
    let localTransmitter: IAccount
    let localReceiver: IAccount

    const loadAccountsData = async () => {
      const transmitterData = {
        accountType: AccountType.saving,
        currentBalance: Number(faker.number.bigInt({ min: 800, max: 1000 })),
      }

      const receiverData = {
        accountType: AccountType.saving,
        currentBalance: Number(faker.number.bigInt({ max: 1000 })),
      }

      const responseTransmitter = await request(app)
        .post(`/api/accounts`)
        .send(transmitterData)
        .set('auth-token', authToken)

      const responseReceiver = await request(app)
        .post(`/api/accounts`)
        .send(receiverData)
        .set('auth-token', authToken)

      const { account: transmitter } = responseTransmitter.body
      const { account: receiver } = responseReceiver.body

      localTransmitter = transmitter
      localReceiver = receiver
    }

    beforeAll(async () => {
      await loadAccountsData()
    })

    it('should create a transaction from the idAccount provided', async () => {
      const transactionData = {
        transmitter: localTransmitter.accountNumber,
        receiver: localReceiver.accountNumber,
        amount: Number(faker.number.int({ max: 500 })),
      }

      const response = await request(app)
        .post(`/api/accounts/transactions`)
        .send(transactionData)
        .set('auth-token', authToken)
      const { transaction } = response.body

      expect(transaction).toBeDefined()
      expect(transaction).toHaveProperty('idTransaction')
      expect(transaction).toHaveProperty('transmitter')
      expect(transaction).toHaveProperty('receiver')
      expect(transaction).toHaveProperty('amount')
      expect(transaction.transmitter).toBe(localTransmitter.accountNumber)
      expect(transaction.receiver).toBe(localReceiver.accountNumber)
      expect(response.status).toBe(201)
    })

    it('should throw 400 - BadRequestException when the transmitter is invalid', async () => {
      const transactionData = {
        transmitter: faker.string.uuid(),
        receiver: localReceiver.accountNumber,
        amount: Number(faker.number.int({ max: 500 })),
      }

      const response = await request(app)
        .post(`/api/accounts/transactions`)
        .send(transactionData)
        .set('auth-token', authToken)
      const { msg } = response.body

      expect(msg).toBe('Invalid account')
      expect(response.status).toBe(400)
    })

    it('should throw 400 - BadRequestException when the transmitter and receiver account numbers are the same', async () => {
      const transactionData = {
        transmitter: localTransmitter.accountNumber,
        receiver: localTransmitter.accountNumber,
        amount: Number(faker.number.int({ max: 500 })),
      }

      const response = await request(app)
        .post(`/api/accounts/transactions`)
        .send(transactionData)
        .set('auth-token', authToken)
      const { msg } = response.body

      expect(msg).toBe(
        'Transmitter and Receiver cannot have the same account number'
      )
      expect(response.status).toBe(400)
    })

    it("should throw 400 - BadRequestException when the account types doesn't match", async () => {
      const checkingReceiver = {
        accountType: AccountType.checking,
        currentBalance: Number(faker.number.bigInt({ max: 1000 })),
      }
      const responseCheckingReceiver = await request(app)
        .post(`/api/accounts`)
        .send(checkingReceiver)
        .set('auth-token', authToken)
      const { account } = responseCheckingReceiver.body

      const transactionData = {
        transmitter: localTransmitter.accountNumber,
        receiver: account.accountNumber,
        amount: Number(faker.number.int({ max: 500 })),
      }

      const response = await request(app)
        .post(`/api/accounts/transactions`)
        .send(transactionData)
        .set('auth-token', authToken)
      const { msg } = response.body

      expect(msg).toBe('Account types do not match')
      expect(response.status).toBe(400)
    })

    it("should throw 400 - BadRequestException when the transmitter doesn't have enough funds", async () => {
      const transactionData = {
        transmitter: localTransmitter.accountNumber,
        receiver: localReceiver.accountNumber,
        amount: Number(faker.number.int({ min: 1001, max: 2000 })),
      }

      const response = await request(app)
        .post(`/api/accounts/transactions`)
        .send(transactionData)
        .set('auth-token', authToken)
      const { msg } = response.body

      expect(msg).toBe('Insufficient funds')
      expect(response.status).toBe(400)
    })
  })

  describe('GetTransactionsByIdAccount', () => {
    it('should return a list of transactions from the idAccount provided', async () => {
      const accountData = {
        accountType: AccountType.saving,
        currentBalance: Number(faker.number.bigInt({ max: 1000 })),
      }
      const responseAccount = await request(app)
        .post(`/api/accounts`)
        .send(accountData)
        .set('auth-token', authToken)
      const { account } = responseAccount.body

      const response = await request(app)
        .get(`/api/accounts/${account.idAccount}/transactions`)
        .set('auth-token', authToken)
      const { transactions } = response.body

      expect(transactions).toBeDefined()
      expect(transactions.length).toBeGreaterThanOrEqual(0)
      expect(response.status).toBe(200)
    })

    it('should return a 404 - NotFoundException when the idAccount provided is invalid', async () => {
      const response = await request(app)
        .get(`/api/accounts/${faker.string.uuid()}/transactions`)
        .set('auth-token', authToken)
      const { msg } = response.body

      expect(msg).toBe('Account not found')
      expect(response.status).toBe(404)
    })
  })
})
