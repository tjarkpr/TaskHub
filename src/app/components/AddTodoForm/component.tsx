import React, { useState } from 'react';
import { useTodoContext } from '../../context/TodoContext';
import './style.css';

const AddTodoForm: React.FC = () => {
    const [todoText, setTodoText] = useState('');
    const { addTodo } = useTodoContext();
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (todoText.trim()) {
            addTodo(todoText);
            setTodoText('');
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
            <button type="submit">Add</button>
        </form>
    );
};

export default AddTodoForm;