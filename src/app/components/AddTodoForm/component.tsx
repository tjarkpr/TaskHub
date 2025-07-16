import React, { useState } from 'react';
import { useTodoContext } from '../../context/TodoContext';
import './style.css';

const AddTodoForm: React.FC = () => {
    const [todoText, setTodoText] = useState('');
    const [dueDate, setDueDate] = useState('');
    const { addTodo } = useTodoContext();
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (todoText.trim()) {
            const dueDateObj = dueDate ? new Date(dueDate) : undefined;
            addTodo(todoText, dueDateObj);
            setTodoText('');
            setDueDate('');
        }
    };
    return (
        <form onSubmit={handleSubmit} className="add-todo-form">
            <input
                type="text"
                value={todoText}
                onChange={(e) => setTodoText(e.target.value)}
                placeholder="Add a new task..."
            />
            <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="Due date (optional)"
            />
            <button type="submit">Add</button>
        </form>
    );
};

export default AddTodoForm;