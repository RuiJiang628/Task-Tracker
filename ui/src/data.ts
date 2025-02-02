export interface Task {
  taskID?: string;
  title: string;
  description: string;
  checked: boolean;
  version: number;
}

export interface User {
  _id: string;
  netID: string;
  userName: string;
  email: string;
  gender:
    | "male"
    | "female"
    | "other"
    | "non-binary"
    | "prefer-not-to-say"
    | null;
  birthDate: Date | null;
  tasks: Task[];
  role: "user" | "admin";
  version: number;
}

export interface Errors {
  userNameError: string;
  emailError: string;
  birthDateError: string;
}

// data.ts
import { io } from "socket.io-client";

const socket = io();

export function addTask(
  task: Task,
  callbacks: {
    onSuccess: (task: any) => void;
    onError: (errorMessage: string) => void;
  }
): void {
  socket.emit("addTask", task);

  socket.on("taskAdded", (data: any) => {
    callbacks.onSuccess(data.task);
  });

  socket.on("taskError", (data: any) => {
    callbacks.onError(data.message);
  });
}