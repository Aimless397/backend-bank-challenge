import { Model, DataTypes } from 'sequelize'
import { db } from '../database/database'
import User from './User'
import Transaction from './Transaction'

export enum AccountType {
  checking = 'checking',
  saving = 'saving',
}

export interface IAccount {
  idAccount: string
  owner: string
  accountNumber: string
  accountType: AccountType
  currentBalance: number
  active: boolean
  createdAt: Date
  updatedAt: Date | null
}

interface AccountInstance extends Model<IAccount, any>, IAccount {}

const Account = db.define<AccountInstance>(
  'account',
  {
    idAccount: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    owner: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: 'idUser',
      },
    },
    accountNumber: {
      type: DataTypes.STRING,
      unique: true,
    },
    accountType: {
      type: DataTypes.STRING,
    },
    currentBalance: {
      type: DataTypes.DECIMAL,
      defaultValue: 0,
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
      beforeCreate: (account) => {
        account.updatedAt = null
      },
    },
  }
)

Account.hasMany(Transaction, {
  foreignKey: 'transmitter',
  sourceKey: 'accountNumber',
})
Account.hasMany(Transaction, {
  foreignKey: 'receiver',
  sourceKey: 'accountNumber',
})
Transaction.belongsTo(Account, {
  foreignKey: 'transmitter',
  targetKey: 'accountNumber',
})
Transaction.belongsTo(Account, {
  foreignKey: 'receiver',
  targetKey: 'accountNumber',
})

export default Account
