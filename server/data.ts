export interface Task {
  taskID: string
  title: string
  description: string
  checked: boolean
}

export interface User {
  _id: string
  userName: string
  email: string
  gender: 'male' | 'female' | 'other' | null
  birthDate: Date | null
  tasks: Task[]
}

export interface AdminUser extends User {
}