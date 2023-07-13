export {}

declare global {
  namespace Express {
    export interface Request {
      idUser?: string
      email?: string
      username?: string
    }
  }
}
