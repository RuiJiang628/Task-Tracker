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
}

export interface Errors {
  userNameError: string;
  emailError: string;
  birthDateError: string;
}

// data.ts
import { io } from 'socket.io-client';

const socket = io();

// 函数用于向后端发送任务添加请求
export function addTask(task: Task, callbacks: {
  onSuccess: (task: any) => void,
  onError: (errorMessage: string) => void
}): void {
  socket.emit('addTask', task);

  // 监听任务添加成功的事件
  socket.on('taskAdded', (data: any) => {
    callbacks.onSuccess(data.task);
  });

  // 监听添加任务时发生错误的事件
  socket.on('taskError', (data: any) => {
    callbacks.onError(data.message);
  });
}