import React, { useState, useEffect } from 'react';
import { useTodoContext } from '../../context/TodoContext';
import fileService from '../../services/FileService';
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
  const isFileSystemAccessSupported = fileService.isUsingFileSystemAccess();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateNew = async () => {
    try {
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

  const handleDownloadFile = () => {
    try {
      fileService.downloadCurrentFile();
      setError(null);
    } catch (err) {
      setError('An error occurred while downloading the file');
      console.error(err);
    }
  };

  return (
    <div className="file-selector">
      {!isFileSystemAccessSupported && (
        <div className="browser-info">
          <p><strong>Compatibility Mode:</strong> Using traditional file operations for broader browser compatibility. Files will be downloaded to your default download folder.</p>
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
            >
              Create new file
            </button>
            <button 
              className="open-file-button"
              onClick={handleOpenExisting}
            >
              Open existing file
            </button>
          </div>
        </div>
      ) : (
        <div className="file-selected">
          <div className='file-info'>
            <span className="file-name">
              <span className="save-status">
                {isFileSystemAccessSupported ? '✓ Auto-saving enabled for ' : '📁 Working with '}
              </span>
              <strong>{currentFileName}</strong> 
            </span>
            <div className="file-buttons">
              <button 
                className="create-file-button"
                onClick={handleCreateNew}
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
              {!isFileSystemAccessSupported && (
                <button 
                  className="download-file-button"
                  onClick={handleDownloadFile}
                  title="Download current file"
                >
                  Download file
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileSelector;