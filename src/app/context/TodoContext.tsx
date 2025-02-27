import React, { 
  createContext, 
  useState, 
  useContext, 
  useEffect, 
  useCallback } from 'react';
import { 
  TodoContextType, 
  TodoProviderProps, 
  Todo, 
  TodoStatus, 
  SavedState } from '../types/TodoTypes';
import { v4 as uuidv4 } from 'uuid';
import fileService from '../services/FileService';

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const useTodoContext = () => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodoContext must be used within a TodoProvider');
  }
  return context;
};

export const TodoProvider: React.FC<TodoProviderProps> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [nextNumber, setNextNumber] = useState<number>(1);
  const [availableNumbers, setAvailableNumbers] = useState<number[]>([]);
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [currentFileName, setCurrentFileName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const updateTodos = useCallback((newTodos: Todo[]) => {
    setTodos(newTodos);
    setIsDirty(true);
  }, []);

  const getNextTicketNumber = () => {
    if (availableNumbers.length > 0) {
      const number = availableNumbers[0];
      setAvailableNumbers(prev => prev.slice(1));
      return number;
    }
    const number = nextNumber;
    setNextNumber(prev => prev + 1);
    return number;
  };

  const changeFile = async () => {
    const success = await fileService.changeFile();
    if (success) {
      await loadData();
      setCurrentFileName(fileService.getFileName());
    }
    return success;
  };

  const saveData = useCallback(async () => {
    if (!fileService.shouldAutoSave() || isSaving) return;
    setIsSaving(true);
    const state: SavedState = {
      todos,
      nextNumber,
      availableNumbers
    };
    await fileService.saveTaskData(state);
    setIsDirty(false);
    setIsSaving(false);
  }, [todos, nextNumber, availableNumbers, isSaving]);

  useEffect(() => {
    if (isDirty && fileService.shouldAutoSave() && !isSaving) {
      saveData();
    }
  }, [isDirty, saveData, isSaving]);

  useEffect(() => {
    const checkPreviousFile = async () => {
      const loadedFromSaved = await fileService.tryLoadSavedFile();
      
      if (loadedFromSaved) {
        setIsFileSelected(true);
        setCurrentFileName(fileService.getFileName());
        await loadData();
        return;
      }
      
      const isSelected = fileService.isFileSelected();
      setIsFileSelected(isSelected);
      
      if (isSelected) {
        setCurrentFileName(fileService.getFileName());
        await loadData();
      }
    };
    
    checkPreviousFile();
  }, []);

  const loadData = async () => {
    const data = await fileService.loadTaskData();
    if (data) {
      setTodos(data.todos || []);
      setNextNumber(data.nextNumber || 1);
      setAvailableNumbers(data.availableNumbers || []);
    }
  };

  const createNewFile = async () => {
    const success = await fileService.createNewFile();
    setIsFileSelected(success);
    if (success) {
      setTodos([]);
      setNextNumber(1);
      setAvailableNumbers([]);
      setCurrentFileName(fileService.getFileName());
    }
    return success;
  };

  const openExistingFile = async () => {
    const success = await fileService.openExistingFile();
    setIsFileSelected(success);
    if (success) {
      await loadData();
      setCurrentFileName(fileService.getFileName());
    }
    return success;
  };

  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: uuidv4(),
      number: getNextTicketNumber(),
      text,
      status: 'Open',
      timeLogs: [],
      isTracking: false,
      totalTimeSpent: 0
    };
    
    updateTodos([...todos, newTodo]);
  };

  const removeTodo = (id: string) => {
    const todoToRemove = todos.find(todo => todo.id === id);
    if (todoToRemove) {
      setAvailableNumbers(prev => [...prev, todoToRemove.number]);
    }
    updateTodos(todos.filter(todo => todo.id !== id));
  };

  const toggleTodo = (id: string) => {
    updateTodos(todos.map(todo => 
      todo.id === id ? { ...todo, status: todo.status === 'Done' ? 'Open' : 'Done' } : todo
    ));
  };

  const updateTodoStatus = (id: string, status: TodoStatus) => {
    updateTodos(todos.map(todo =>
      todo.id === id ? { ...todo, status } : todo
    ));
  };
  
  const updateTodoText = (id: string, newText: string) => {
    updateTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: newText } : todo
    ));
  };
  
  const updateTodoTime = (id: string, newTimeInMs: number) => {
    updateTodos(todos.map(todo =>
      todo.id === id ? { ...todo, totalTimeSpent: newTimeInMs } : todo
    ));
  };

  const startTimeTracking = (id: string) => {
    updateTodos(todos.map(todo => 
      todo.id === id 
        ? { 
            ...todo, 
            isTracking: true,
            timeLogs: [...todo.timeLogs, { startTime: Date.now(), endTime: null }]
          } 
        : todo
    ));
  };

  const pauseTimeTracking = (id: string) => {
    updateTodos(todos.map(todo => {
      if (todo.id !== id) return todo;
      const updatedTimeLogs = [...todo.timeLogs];
      const activeLogIndex = updatedTimeLogs.findIndex(log => log.endTime === null);
      if (activeLogIndex !== -1) {
        const now = Date.now();
        updatedTimeLogs[activeLogIndex] = {
          ...updatedTimeLogs[activeLogIndex],
          endTime: now
        };
        const timeSpentInSession = now - updatedTimeLogs[activeLogIndex].startTime;
        const updatedTotalTimeSpent = todo.totalTimeSpent + timeSpentInSession;
        return { 
          ...todo, 
          isTracking: false,
          timeLogs: updatedTimeLogs,
          totalTimeSpent: updatedTotalTimeSpent
        };
      }
      
      return todo;
    }));
  };

  const sortedTodos = [...todos].sort((a, b) => {
    const statusOrder = { 'Open': 0, 'In Progress': 1, 'Done': 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <TodoContext.Provider value={{ 
      todos: sortedTodos, 
      addTodo, 
      removeTodo, 
      toggleTodo,
      updateTodoStatus,
      startTimeTracking,
      pauseTimeTracking,
      updateTodoTime,
      updateTodoText,
      createNewFile,
      openExistingFile,
      changeFile,
      isFileSelected,
      currentFileName
    }}>
      {children}
    </TodoContext.Provider>
  );
};