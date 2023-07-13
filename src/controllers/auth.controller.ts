import { Request, Response } from 'express'
import User, { encryptPassword, validatePassword } from '../models/User'
import jwt from 'jsonwebtoken'
import { Op } from 'sequelize'

/**
 * Creates a new user based on the provided body and generates a token
 */
export const signup = async (req: Request, res: Response) => {
  try {
    const { username: usernameBody, email, password, name, lastname } = req.body

    const username: string = usernameBody.toLowerCase()
    const userFound = await User.findAll({
      where: { active: true, [Op.or]: [{ email }, { username }] },
    })

    if (userFound.length)
      return res
        .status(400)
        .json({ msg: `User with provided username or email already exists` })

    const newUser = User.build()
    newUser.username = username
    newUser.email = email
    newUser.password = await encryptPassword(password)
    newUser.name = name
    newUser.lastname = lastname

    const savedUser = await newUser.save()
    const token: string = jwt.sign(
      {
        id: savedUser.idUser,
        email: savedUser.email,
        username: savedUser.username,
      },
      process.env.TOKEN_SECRET!,
      {
        expiresIn: '1h',
      }
    )

    return res.status(201).json({ user: savedUser, token })
  } catch (error) {
    res.status(500).json({ msg: 'Register failed - Error 500', error })
  }
}

/**
 * Validates if user exists in the database and generates a token
 */
export const signin = async (req: Request, res: Response) => {
  try {
    const { email: userEmail, password } = req.body

    const userFound = await User.findOne({
      where: { email: userEmail, active: true },
    })

    if (!userFound)
      return res.status(400).json({ msg: 'Invalid email or password' })
    const { idUser, email, username } = userFound

    const validPassword = await validatePassword(password, userFound.password)
    if (!validPassword)
      return res.status(400).json({ msg: 'Invalid email or password' })

    const token: string = jwt.sign(
      { id: idUser, email, username },
      process.env.TOKEN_SECRET!,
      {
        expiresIn: '1h',
      }
    )

    return res.status(200).json({ user: userFound, token })
  } catch (error) {
    res.status(500).json({ msg: 'Login failed - Error 500', error })
  }
}
