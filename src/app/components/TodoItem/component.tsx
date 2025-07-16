import React, { useState, useEffect } from 'react';
import { Todo, TodoStatus } from '../../types/TodoTypes';
import './style.css';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TodoStatus) => void;
  onStartTracking: (id: string) => void;
  onPauseTracking: (id: string) => void;
  onUpdateTime: (id: string, newTimeInMs: number) => void;
  onUpdateText: (id: string, newText: string) => void;
  onUpdateDueDate: (id: string, dueDate?: Date) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onDelete,
  onStatusChange,
  onStartTracking,
  onPauseTracking,
  onUpdateTime,
  onUpdateText,
  onUpdateDueDate
}) => {
  const [displayTime, setDisplayTime] = useState(todo.totalTimeSpent);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isEditingText, setIsEditingText] = useState(false);
  const [editedText, setEditedText] = useState(todo.text);
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [editedDueDate, setEditedDueDate] = useState(
    todo.dueDate ? todo.dueDate.toISOString().split('T')[0] : ''
  );

  const startTimeEdit = () => {
    if (todo.isTracking) return;
    const totalSeconds = Math.floor(displayTime / 1000);
    setHours(Math.floor(totalSeconds / 3600));
    setMinutes(Math.floor((totalSeconds % 3600) / 60));
    setSeconds(totalSeconds % 60);
    setIsEditingTime(true);
  };

  const saveTimeEdit = () => {
    const newTimeInMs = ((hours * 3600) + (minutes * 60) + seconds) * 1000;
    onUpdateTime(todo.id, newTimeInMs);
    setIsEditingTime(false);
  };

  const cancelTimeEdit = () => {
    setIsEditingTime(false);
  };

  const startTextEdit = () => {
    setEditedText(todo.text);
    setIsEditingText(true);
  };

  const saveTextEdit = () => {
    if (editedText.trim()) {
      onUpdateText(todo.id, editedText.trim());
    }
    setIsEditingText(false);
  };

  const cancelTextEdit = () => {
    setEditedText(todo.text);
    setIsEditingText(false);
  };

  const handleTextKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveTextEdit();
    } else if (e.key === 'Escape') {
      cancelTextEdit();
    }
  };

  const startDueDateEdit = () => {
    setEditedDueDate(todo.dueDate ? todo.dueDate.toISOString().split('T')[0] : '');
    setIsEditingDueDate(true);
  };

  const saveDueDateEdit = () => {
    const newDueDate = editedDueDate ? new Date(editedDueDate) : undefined;
    onUpdateDueDate(todo.id, newDueDate);
    setIsEditingDueDate(false);
  };

  const cancelDueDateEdit = () => {
    setEditedDueDate(todo.dueDate ? todo.dueDate.toISOString().split('T')[0] : '');
    setIsEditingDueDate(false);
  };

  const handleDueDateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveDueDateEdit();
    } else if (e.key === 'Escape') {
      cancelDueDateEdit();
    }
  };

  useEffect(() => {
    if (!todo.isTracking) {
      setDisplayTime(todo.totalTimeSpent);
      return;
    }
    const activeTimeLog = todo.timeLogs.find(log => log.endTime === null);
    if (!activeTimeLog) return;
    const startTime = activeTimeLog.startTime;
    const intervalId = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      setDisplayTime(todo.totalTimeSpent + elapsed);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [todo.isTracking, todo.totalTimeSpent, todo.timeLogs]);

  const getStatusColor = () => {
    switch (todo.status) {
      case 'Open': return 'status-open';
      case 'In Progress': return 'status-in-progress';
      case 'Done': return 'status-done';
      default: return '';
    }
  };

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDueDate = (date: Date): string => {
    return date.toLocaleDateString();
  };

  const isDueDateOverdue = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  return (
    <div className={`todo-item ${getStatusColor()} ${todo.status === 'Done' ? 'completed' : ''}`}>
      <div className='todo-header'>
        <div className='todo-status'>
          <select 
            value={todo.status} 
            onChange={(e) => onStatusChange(todo.id, e.target.value as TodoStatus)}
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
        <div className="time-tracking">
          {todo.status === 'In Progress' && !isEditingTime && !isEditingText && !isEditingDueDate && (
            <>
              {!todo.isTracking ? (
                <button 
                  className="start-button"
                  onClick={() => onStartTracking(todo.id)}
                >
                  Start timer
                </button>
              ) : (
                <button 
                  className="pause-button"
                  onClick={() => onPauseTracking(todo.id)}
                >
                  Pause timer
                </button>
              )}
            </>
          )}
          {isEditingTime ? (
            <div className="time-edit">
              <input 
                type="number" 
                min="0"
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value) || 0)}
                className="time-input hours"
              />
              :
              <input 
                type="number" 
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                className="time-input minutes"
              />
              :
              <input 
                type="number" 
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(parseInt(e.target.value) || 0)}
                className="time-input seconds"
              />
              <button onClick={saveTimeEdit} className="time-save-btn">✓</button>
              <button onClick={cancelTimeEdit} className="time-cancel-btn">✗</button>
            </div>
          ) : (
            <span 
              className={`time-spent ${todo.isTracking ? 'counting' : ''} ${!todo.isTracking ? 'editable' : ''}`}
              onDoubleClick={() => !todo.isTracking && startTimeEdit()}
              title={!todo.isTracking ? "Double-click to edit time" : ""}
            >
              {formatTime(displayTime)}
            </span>
          )}
        </div>
        {todo.status === 'Done' && !isEditingText && !isEditingTime && !isEditingDueDate && (
          <button 
            className="delete-button" 
            onClick={() => onDelete(todo.id)}
          >
            Delete
          </button>
        )}
      </div>
      <div className='todo-content'>
        <div className="todo-number">
            T{todo.number.toString().padStart(5, '0')}:
          </div>
        {isEditingText ? (
          <div className="todo-text-edit">
            <input
              type="text"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              onKeyDown={handleTextKeyDown}
              className="text-input"
              autoFocus
            />
            <button onClick={saveTextEdit} className="text-save-btn">✓</button>
            <button onClick={cancelTextEdit} className="text-cancel-btn">✗</button>
          </div>
        ) : (
          <span 
            className="todo-text editable"
            onDoubleClick={startTextEdit}
            title="Double-click to edit"
          >
            {todo.text}
          </span>
        )}
        <div className="todo-due-date">
          {isEditingDueDate ? (
            <div className="due-date-edit">
              <input
                type="date"
                value={editedDueDate}
                onChange={(e) => setEditedDueDate(e.target.value)}
                onKeyDown={handleDueDateKeyDown}
                className="due-date-input"
                autoFocus
              />
              <button onClick={saveDueDateEdit} className="due-date-save-btn">✓</button>
              <button onClick={cancelDueDateEdit} className="due-date-cancel-btn">✗</button>
            </div>
          ) : (
            <>
              {todo.dueDate ? (
                <span 
                  className={`due-date ${isDueDateOverdue(todo.dueDate) ? 'overdue' : ''} editable`}
                  onDoubleClick={startDueDateEdit}
                  title="Double-click to edit due date"
                >
                  Due: {formatDueDate(todo.dueDate)}
                </span>
              ) : (
                <button 
                  className="add-due-date-btn"
                  onClick={startDueDateEdit}
                  title="Add due date"
                >
                  + Add Due Date
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoItem;