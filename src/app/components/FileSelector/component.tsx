import React, { useState, useEffect } from 'react';
import { useTodoContext } from '../../context/TodoContext';
import './style.css';

const FileSelector: React.FC = () => {
  const { 
    createNewFile, 
    openExistingFile, 
    changeFile,
    isFileSelected, 
    currentFileName 
  } = useTodoContext();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isFileSystemAccessSupported = 'showOpenFilePicker' in window && 'showSaveFilePicker' in window;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateNew = async () => {
    try {
      if (!isFileSystemAccessSupported) {
        setError('Your browser does not support the required File System Access API. Please use Chrome, Edge or another compatible browser.');
        return;
      }
      const success = await createNewFile();
      if (!success) {
        setError('Failed to create new file or user cancelled');
      } else {
        setError(null);
      }
    } catch (err) {
      setError('An error occurred while creating the file');
      console.error(err);
    }
  };

  const handleOpenExisting = async () => {
    try {
      if (!isFileSystemAccessSupported) {
        setError('Your browser does not support the required File System Access API. Please use Chrome, Edge or another compatible browser.');
        return;
      }
      const success = await openExistingFile();
      if (!success) {
        setError('Failed to open file or user cancelled');
      } else {
        setError(null);
      }
    } catch (err) {
      setError('An error occurred while opening the file');
      console.error(err);
    }
  };

  const handleChangeFile = async () => {
    try {
      const success = await changeFile();
      if (!success) {
        setError('Failed to change file or user cancelled');
      } else {
        setError(null);
      }
    } catch (err) {
      setError('An error occurred while changing the file');
      console.error(err);
    }
  };

  return (
    <div className="file-selector">
      {!isFileSystemAccessSupported && (
        <div className="browser-warning">
          <p><b>Warning:</b> This app requires the File System Access API which is not supported in your browser. Please use Chrome, Edge, or another compatible browser.</p>
        </div>
      )}
      {error && <div className="error-message">{error}</div>}
      
      {isLoading && !isFileSelected ? (
        <div className="loading-message">
          <p>Checking for previously opened file...</p>
        </div>
      ) : !isFileSelected ? (
        <div className="no-file-message">
          <p>Please create a new todo list or open an existing one:</p>
          <div className="file-buttons">
            <button 
              className="create-file-button"
              onClick={handleCreateNew}
              disabled={!isFileSystemAccessSupported}
            >
              Create new file
            </button>
            <button 
              className="open-file-button"
              onClick={handleOpenExisting}
              disabled={!isFileSystemAccessSupported}
            >
              Open existing file
            </button>
          </div>
        </div>
      ) : (
        <div className="file-selected">
          <div className='file-info'>
            <span className="file-name">
              <span className="save-status">✓ Auto-saving enabled for </span>
              <strong>{currentFileName}</strong> 
            </span>
            <div className="file-buttons">
              <button 
                className="create-file-button"
                onClick={handleCreateNew}
                disabled={!isFileSystemAccessSupported}
              >
                Create new file
              </button>
              <button 
                className="change-file-button"
                onClick={handleChangeFile}
                title="Change to a different file"
              >
                Change current file
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileSelector;