import { ReactNode } from 'react';

type TodoStatus = 'Open' | 'In Progress' | 'Done';

interface TimeLog {
  startTime: number;
  endTime: number | null;
}

interface Todo {
  id: string;
  number: number;
  text: string;
  status: TodoStatus;
  timeLogs: TimeLog[];
  isTracking: boolean;
  totalTimeSpent: number;
}

interface TodoProviderProps {
  children: ReactNode;
}

interface SavedState {
  todos: Todo[];
  nextNumber: number;
  availableNumbers: number[];
}

interface TodoContextType {
  todos: Todo[];
  addTodo: (text: string) => void;
  removeTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  updateTodoStatus: (id: string, status: TodoStatus) => void;
  startTimeTracking: (id: string) => void;
  pauseTimeTracking: (id: string) => void;
  updateTodoTime: (id: string, newTimeInMs: number) => void;
  updateTodoText: (id: string, newText: string) => void;
  createNewFile: () => Promise<boolean>;
  openExistingFile: () => Promise<boolean>;
  changeFile: () => Promise<boolean>;
  isFileSelected: boolean;
  currentFileName: string;
}

export type { Todo, TodoProviderProps, SavedState, TodoStatus, TimeLog, TodoContextType };