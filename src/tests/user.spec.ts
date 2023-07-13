import request from 'supertest'
import { faker } from '@faker-js/faker'

import app from '../app'

describe('User Controller', () => {
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

  describe('GetUserById', () => {
    it('should return the user when a valid idUser is provided', async () => {
      const response = await request(app)
        .get(`/api/users/${globalUser.idUser}`)
        .set('auth-token', authToken)
      const { user } = response.body

      expect(user.idUser).toBe(globalUser.idUser)
      expect(user.email).toBe(globalUser.email)
      expect(user.password).toBeDefined()
      expect(user.name).toBe(globalUser.name)
      expect(user.lastname).toBe(globalUser.lastname)
      expect(response.status).toBe(200)
    })

    it('should throw 404 - NotFoundException when an invalid idUser is provided', async () => {
      const fakeIdUser = faker.string.uuid()

      const response = await request(app)
        .get(`/api/users/${fakeIdUser}`)
        .set('auth-token', authToken)
      const { msg } = response.body

      expect(msg).toBe("User doesn't exist")
      expect(response.status).toBe(404)
    })
  })
})
