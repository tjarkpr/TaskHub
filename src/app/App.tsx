import React from 'react';
import TodoList from './components/TodoList/component';
import FileSelector from './components/FileSelector/component';
import ThemeToggle from './components/ThemeToggle/component';
import { TodoProvider } from './context/TodoContext';
import { ThemeProvider } from './context/ThemeContext';
import './styles/theme.css';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <TodoProvider>
        <div className="app-container">
          <header className="app-header">
            <FileSelector />
            <ThemeToggle />
          </header>
          <TodoList />
        </div>
      </TodoProvider>
    </ThemeProvider>
  );
};

export default App;