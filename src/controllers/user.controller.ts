import { Request, Response } from 'express'
import User from '../models/User'
import Account from '../models/Account'

/**
 * Returns a list of the active users from the database
 * @important This route does not belong to the exported routes of the API
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      where: { active: true },
      include: [
        {
          model: Account,
          attributes: [
            'idAccount',
            'owner',
            'accountNumber',
            'currentBalance',
            'active',
          ],
          where: {
            active: true,
          },
          required: false,
        },
      ],
    })

    return res.status(200).json({ users })
  } catch (error) {
    res.status(500).json({ msg: 'Get Users failed - Error 500', error })
  }
}

/**
 * Returns a user filtered by idUser
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    // TODO: Validate if the req.user is valid and belongs to the same user from req.params.idUser
    const user = await User.findByPk(req.params.idUser)
    if (!user || !user.active)
      return res.status(404).json({ msg: "User doesn't exist" })

    return res.status(200).json({ user })
  } catch (error) {
    res.status(500).json({ msg: 'Get User by id failed - Error 500', error })
  }
}

/**
 * Deletes a user filtered by idUser
 * @important This route does not belong to the exported routes of the API
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const idUser = req.params.idUser
    const user = await User.findByPk(idUser)
    if (!user || !user.active)
      return res.status(404).json({ msg: "User doesn't exist" })

    user.active = false
    await user.save()

    return res.status(200).json({ user })
  } catch (error) {
    res.status(500).json({ msg: 'Delete User failed - Error 500', error })
  }
}
