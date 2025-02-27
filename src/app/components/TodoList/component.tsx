import React from 'react';
import TodoItem from '../TodoItem/component';
import AddTodoForm from '../AddTodoForm/component';
import { useTodoContext } from '../../context/TodoContext';
import './style.css';

const TodoList: React.FC = () => {
  const { 
    todos, 
    toggleTodo, 
    removeTodo, 
    updateTodoStatus,
    startTimeTracking,
    pauseTimeTracking,
    updateTodoTime,
    updateTodoText
  } = useTodoContext();
  
  const activeTodos = todos.filter(todo => todo.status !== 'Done');
  const completedTodos = todos.filter(todo => todo.status === 'Done');

  return (
    <div className="todo-lists-container">
      <div className="active-todos">
        <h2>Active Tasks</h2>
        {activeTodos.length === 0 ? (
          <div></div>
        ) : (
          <div className="todo-list">
            {activeTodos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={removeTodo}
                onStatusChange={updateTodoStatus}
                onStartTracking={startTimeTracking}
                onPauseTracking={pauseTimeTracking}
                onUpdateTime={updateTodoTime}
                onUpdateText={updateTodoText}
              />
            ))}
          </div>
        )}
      <AddTodoForm />
      </div>
      <div className="completed-todos">
        <h2>Completed Tasks</h2>
        {completedTodos.length === 0 ? (
          <div></div>
        ) : (
          <div className="todo-list">
            {completedTodos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={removeTodo}
                onStatusChange={updateTodoStatus}
                onStartTracking={startTimeTracking}
                onPauseTracking={pauseTimeTracking}
                onUpdateTime={updateTodoTime}
                onUpdateText={updateTodoText}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoList;