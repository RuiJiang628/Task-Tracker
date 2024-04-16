export {}

declare global {
  namespace Express {
    interface User {
      netID: string
      userName: string
      email: string
      gender: 'male' | 'female' | 'other' | null
      birthDate: Date | null
    }
  }
}