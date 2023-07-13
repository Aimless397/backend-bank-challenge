import { DataTypes, Model } from 'sequelize'
import { db } from '../database/database'
import bcrypt from 'bcryptjs'
import Account from './Account'

export interface IUser {
  idUser: string
  username: string
  email: string
  password: string
  name: string
  lastname: string
  active: boolean
  createdAt: Date
  updatedAt: Date | null
}

interface UserInstance extends Model<IUser, any>, IUser {}

const User = db.define<UserInstance>(
  'user',
  {
    idUser: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
    },
    lastname: {
      type: DataTypes.STRING,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    hooks: {
      beforeCreate: (user) => {
        user.updatedAt = null
      },
    },
  }
)

export const encryptPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export const validatePassword = async (
  passwordBody: string,
  passwordUser: string
): Promise<boolean> => {
  return await bcrypt.compare(passwordBody, passwordUser)
}

User.hasMany(Account, {
  foreignKey: 'owner',
  sourceKey: 'idUser',
})
Account.belongsTo(User, { foreignKey: 'owner', targetKey: 'idUser' })

export default User
