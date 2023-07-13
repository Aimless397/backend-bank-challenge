import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

interface IPayload {
  id: string
  email: string
  username: string
  iat: number
  exp: number
}

export const tokenValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('auth-token')
    if (!token) return res.status(401).json({ msg: 'Token required' })

    const payload = jwt.verify(
      token,
      process.env.TOKEN_SECRET || 'test-token'
    ) as IPayload

    req.idUser = payload.id
    req.email = payload.email
    req.username = payload.username

    next()
  } catch (error) {
    return res.status(401).json({ msg: 'Token expired' })
  }
}
