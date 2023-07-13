import { db } from '../database/database'
import { Model, DataTypes } from 'sequelize'
import Account from './Account'

export interface ITransaction {
  idTransaction: string
  transmitter: string
  receiver: string
  amount: number
  createdAt: Date
  updatedAt: Date | null
}

interface TransactionInstance extends Model<ITransaction, any>, ITransaction {}

const Transaction = db.define<TransactionInstance>(
  'transaction',
  {
    idTransaction: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    transmitter: {
      type: DataTypes.STRING,
      references: {
        model: Account,
        key: 'accountNumber',
      },
    },
    receiver: {
      type: DataTypes.STRING,
      references: {
        model: Account,
        key: 'accountNumber',
      },
    },
    amount: {
      type: DataTypes.DECIMAL,
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
      beforeCreate: (transaction) => {
        transaction.updatedAt = null
      },
    },
  }
)

export default Transaction
