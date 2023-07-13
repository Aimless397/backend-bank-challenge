import dotenv from 'dotenv'
import app from './app'

dotenv.config()

const main = () => {
  const port = process.env.PORT
  app.listen(port)
  console.log(`Server running at ${port}`)
}

main()
