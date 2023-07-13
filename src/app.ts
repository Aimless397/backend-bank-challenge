import express, { Application, Request, Response } from 'express'
import { db } from './database/database'
import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'
import accountRoutes from './routes/account.routes'
import morgan from 'morgan'
import { Sequelize } from 'sequelize'
import { exec } from 'child_process'
import cors from 'cors'
import csrf from 'csurf'

const app: Application = express()

app.use(morgan('dev'))
app.use(express.json())

/* CSRF CONFIGURATION (TODO: USE cookie-session INSTEAD) */
/* const csrfProtection = csrf({ cookie: true })
app.use(csrfProtection)
app.use((req, res, next) => {
  res.cookie('XSRF-TOKEN', req.csrfToken()) // Agrega el token CSRF a las cookies de respuesta
  next()
}) */

/* CORS CONFIGURATION */
app.use(cors())
/* app.use(
  cors({
    origin: ['http://localhost:5000', 'http://127.0.0.1:5000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
) */

/* app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With')
  next()
}) */

const dbFunctions = async () => {
  try {
    await db.sync()
    console.log('Database sync successfully')
    await db.authenticate()
    console.log('Database connected')
  } catch (error) {
    console.log(error)
  }
}

dbFunctions()

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/accounts', accountRoutes)

app.get('/clear-database', async (req: Request, res: Response) => {
  try {
    await db.query('DROP SCHEMA public CASCADE')
    await db.query('CREATE SCHEMA public')

    db.sync()
      .then(() => {
        console.log('Database sync successfully')
      })
      .catch((error) => {
        console.error('Error synchronizing:', error)
      })

    return res.status(200).json('Database cleared successfully')
  } catch (error) {
    console.error('Error resetting database:', error)
    throw error
  }
})

export default app
