export interface Task {
  taskID: string;
  title: string;
  description: string;
  checked: boolean;
}

export interface User {
  netID: string;
  userName: string;
  email: string;
  gender: "male" | "female" | "other" | null;
  birthDate: Date | null;
  tasks: Task[];
  role: "user" | "admin";
}

export interface Errors {
  userNameError: string;
  emailError: string;
}
