import request from 'supertest'
import { faker } from '@faker-js/faker'

import app from '../app'

describe('Auth Controller', () => {
  let globalUser: {
    username: string
    email: string
    password: string
    name: string
    lastname: string
  }

  beforeAll(async () => {
    globalUser = {
      username: faker.internet.displayName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      name: faker.person.firstName(),
      lastname: faker.person.lastName(),
    }

    await request(app).post('/api/auth/register').send(globalUser)
  })

  describe('Register', () => {
    let randomUser = {
      username: '',
      email: '',
      password: '',
      name: '',
      lastname: '',
    }

    beforeEach(() => {
      randomUser.username = faker.internet.displayName()
      randomUser.email = faker.internet.email()
      randomUser.password = faker.internet.password()
      randomUser.name = faker.person.firstName()
      randomUser.lastname = faker.person.lastName()
    })

    it('shoud create and return a user with its token', async () => {
      const newUser = {
        username: randomUser.username,
        email: randomUser.email,
        password: randomUser.password,
        name: randomUser.name,
        lastname: randomUser.lastname,
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
      const { user, token } = response.body

      expect(user.username).toBe(newUser.username.toLowerCase())
      expect(user.email).toBe(newUser.email)
      expect(user.name).toBe(newUser.name)
      expect(user.lastname).toBe(newUser.lastname)
      expect(user.password).toBeDefined()
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(response.status).toBe(201)
    })

    it('should throw 400 - BadRequestException when duplicated username or email are provided', async () => {
      const newUser = {
        username: randomUser.username,
        email: randomUser.email,
        password: randomUser.password,
        name: randomUser.name,
        lastname: randomUser.lastname,
      }

      await request(app).post('/api/auth/register').send(newUser)

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
      const { msg } = response.body

      expect(msg).toBe('User with provided username or email already exists')
      expect(response.status).toBe(400)
    })
  })

  describe('Login', () => {
    it('should login a user and return the user and token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: globalUser.email, password: globalUser.password })
      const { user, token } = response.body

      expect(user.email).toBe(globalUser.email)
      expect(user.password).toBeDefined()
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(response.status).toBe(200)
    })

    it('should throw 400 - BadRequestException when the email is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: faker.internet.email(), password: globalUser.password })
      const { msg } = response.body

      expect(msg).toBe('Invalid email or password')
      expect(response.status).toBe(400)
    })

    it('should throw 400 - BadRequestException when the password is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: globalUser.email, password: faker.internet.password() })
      const { msg } = response.body

      expect(msg).toBe('Invalid email or password')
      expect(response.status).toBe(400)
    })
  })
})
