import { useState } from 'react';
import { Todo, TodoStatus, TimeLog } from '../types/TodoTypes';
import { v4 as uuidv4 } from 'uuid';

export const useTodos = () => {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [nextNumber, setNextNumber] = useState<number>(1);
    const [availableNumbers, setAvailableNumbers] = useState<number[]>([]);
    const getNextTicketNumber = (): number => {
        if (availableNumbers.length > 0) {
            const number = availableNumbers[0];
            setAvailableNumbers(prev => prev.slice(1));
            return number;
        }
        const number = nextNumber;
        setNextNumber(prev => prev + 1);
        return number;
    };

    const addTodo = (text: string) => {
        setTodos(prevTodos => [
            ...prevTodos, 
            { 
                id: uuidv4(), 
                number: getNextTicketNumber(),
                text, 
                status: 'Open' as TodoStatus,
                timeLogs: [] as TimeLog[],
                isTracking: false,
                totalTimeSpent: 0
            }
        ]);
    };

    const removeTodo = (id: string) => {
        const todoToRemove = todos.find(todo => todo.id === id);
        if (todoToRemove) {
            setAvailableNumbers(prev => [...prev, todoToRemove.number]);
        }
        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    };

    const toggleTodo = (id: string) => {
        setTodos(prevTodos => 
            prevTodos.map(todo => 
                todo.id === id ? { 
                    ...todo, 
                    status: todo.status === 'Done' ? 'Open' : 'Done' 
                } : todo
            )
        );
    };

    const updateTodoStatus = (id: string, status: TodoStatus) => {
        setTodos(prevTodos =>
            prevTodos.map(todo =>
                todo.id === id ? { ...todo, status } : todo
            )
        );
    };

    const startTimeTracking = (id: string) => {
        setTodos(prevTodos => 
            prevTodos.map(todo => 
                todo.id === id 
                    ? { 
                        ...todo, 
                        isTracking: true,
                        timeLogs: [...todo.timeLogs, { startTime: Date.now(), endTime: null }]
                    } 
                    : todo
            )
        );
    };

    const pauseTimeTracking = (id: string) => {
        setTodos(prevTodos => 
            prevTodos.map(todo => {
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
            })
        );
    };

    const sortedTodos = [...todos].sort((a, b) => {
        const statusOrder = { 'Open': 0, 'In Progress': 1, 'Done': 2 };
        return statusOrder[a.status] - statusOrder[b.status];
    });

    return { 
        todos: sortedTodos, 
        addTodo, 
        removeTodo, 
        toggleTodo, 
        updateTodoStatus,
        startTimeTracking,
        pauseTimeTracking
    };
};