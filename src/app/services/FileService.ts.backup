export class FileService {
  private static instance: FileService;
  private static readonly STORAGE_KEY = 'actionhub-file-handle';
  private fileHandle: FileSystemFileHandle | null = null;
  private autoSaveEnabled = false;
  
  private constructor() {}

  public static getInstance(): FileService {
    if (!FileService.instance) {
      FileService.instance = new FileService();
    }
    return FileService.instance;
  }

  private async storeFileHandle(fileHandle: FileSystemFileHandle): Promise<void> {
    try {
      console.log("Attempting to store file handle for:", fileHandle.name);
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        try {
          const transaction = db.transaction(['fileHandles'], 'readwrite');
          const store = transaction.objectStore('fileHandles');
          const request = store.put(fileHandle, 'currentFile');
          request.onsuccess = () => {
            console.log("Successfully stored file handle in IndexedDB");
            this.requestPersistPermission();
            resolve();
          };
          
          request.onerror = () => {
            console.error("Failed to store file handle:", request.error);
            reject(request.error);
          };
        
          transaction.oncomplete = () => {
            console.log("File handle storage transaction completed");
          };
          
          transaction.onerror = () => {
            console.error("Transaction error while storing file handle:", transaction.error);
          };
        } catch (err) {
          console.error("Error in IndexedDB transaction:", err);
          reject(err);
        }
      });
    } catch (err) {
      console.error('Error storing file handle:', err);
    }
  }

  private async requestPersistPermission(): Promise<void> {
    try {
      if ((navigator as any).permissions) {
        const permission = await (navigator as any).permissions.query({
          name: 'persistent-storage'
        });
        if (permission.state !== 'granted') {
          console.log("Requesting persistent storage permission");
          if ((navigator as any).storage && (navigator as any).storage.persist) {
            const isPersisted = await (navigator as any).storage.persist();
            console.log("Persisted storage granted:", isPersisted);
          }
        } else {
          console.log("Persistent storage permission already granted");
        }
      }
    } catch (err) {
      console.error("Error requesting persistence:", err);
    }
  }

  private async openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ActionHubStorage', 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('fileHandles')) {
          db.createObjectStore('fileHandles');
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  public async tryLoadSavedFile(): Promise<boolean> {
    try {
      const db = await this.openDatabase();
      const transaction = db.transaction(['fileHandles'], 'readonly');
      const store = transaction.objectStore('fileHandles');
      const request = store.get('currentFile');
      return new Promise((resolve) => {
        request.onsuccess = async () => {
          const fileHandle = request.result as FileSystemFileHandle;
          if (!fileHandle) {
            resolve(false);
            return;
          }
          try {
            await (fileHandle as any).requestPermission({ mode: 'readwrite' });
            this.fileHandle = fileHandle;
            this.autoSaveEnabled = true;
            resolve(true);
          } catch (err) {
            console.error('Error accessing saved file:', err);
            resolve(false);
          }
        };
        request.onerror = () => {
          console.error('Error retrieving file handle:', request.error);
          resolve(false);
        };
      });
    } catch (err) {
      console.error('Error trying to load saved file:', err);
      return false;
    }
  }

  public async createNewFile(): Promise<boolean> {
    try {
      console.log("Creating new file...");
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: 'todolist.actionhub',
        types: [{
          description: 'ActionHub Todo List',
          accept: {
            'application/json': ['.actionhub']
          }
        }]
      });
      console.log("File handle created:", fileHandle.name);
      this.fileHandle = fileHandle;
      const initialData = {
        todos: [],
        nextNumber: 1,
        availableNumbers: []
      };
      const saveResult = await this.saveTaskData(initialData);
      if (!saveResult) {
        console.error("Failed to save initial data");
      }
      this.setAutoSave(true);
      try {
        await this.storeFileHandle(fileHandle);
        console.log("File handle stored successfully");
      } catch (storeErr) {
        console.error("Failed to store file handle:", storeErr);
      }
      
      return true;
    } catch (err) {
      console.error('User cancelled file creation or error occurred:', err);
      return false;
    }
  }

  public async openExistingFile(): Promise<boolean> {
    try {
      console.log("Opening existing file...");
      const [fileHandle] = await (window as any).showOpenFilePicker({
        types: [{
          description: 'ActionHub Todo List',
          accept: {
            'application/json': ['.actionhub']
          }
        }]
      });
      console.log("File handle obtained:", fileHandle.name);
      this.fileHandle = fileHandle;
      this.setAutoSave(true);
      try {
        await this.storeFileHandle(fileHandle);
        console.log("File handle stored successfully");
      } catch (storeErr) {
        console.error("Failed to store file handle:", storeErr);
      }
      return true;
    } catch (err) {
      console.error('User cancelled file selection or error occurred:', err);
      return false;
    }
  }

  public async changeFile(): Promise<boolean> {
    try {
      console.log("Changing file...");
      const [fileHandle] = await (window as any).showOpenFilePicker({
        types: [{
          description: 'ActionHub Todo List',
          accept: {
            'application/json': ['.actionhub']
          }
        }]
      });
      if (this.fileHandle && this.fileHandle.name === fileHandle.name) {
        console.log("Same file selected, no change needed");
        return true;
      }
      console.log("New file handle obtained:", fileHandle.name);
      this.fileHandle = fileHandle;
      this.setAutoSave(true);
      try {
        await this.storeFileHandle(fileHandle);
        console.log("New file handle stored successfully");
      } catch (storeErr) {
        console.error("Failed to store new file handle:", storeErr);
      }
      
      return true;
    } catch (err) {
      console.error('User cancelled file change or error occurred:', err);
      return false;
    }
  }

  public shouldAutoSave(): boolean {
    return this.autoSaveEnabled && this.fileHandle !== null;
  }
  
  public setAutoSave(enabled: boolean): void {
    this.autoSaveEnabled = enabled;
  }
  
  public async saveTaskData(data: any): Promise<boolean> {
    if (!this.fileHandle) {
      console.warn('No file handle available for saving');
      return false;
    }
    try {
      const writable = await (this.fileHandle as any).createWritable();
      const jsonData = JSON.stringify(data, null, 2);
      await writable.write(jsonData);
      await writable.close();
      return true;
    } catch (err) {
      console.error('Error saving data:', err);
      return false;
    }
  }
  
  public async loadTaskData(): Promise<any | null> {
    if (!this.fileHandle) {
      console.warn('No file handle available for loading');
      return null;
    }
    try {
      const file = await this.fileHandle.getFile();
      const contents = await file.text();
      if (!contents || contents.trim() === '') {
        return null;
      }
      return JSON.parse(contents);
    } catch (err) {
      console.warn('Error loading data:', err);
      return null;
    }
  }
  
  public isFileSelected(): boolean {
    return this.fileHandle !== null;
  }
  
  public getFileName(): string {
    return this.fileHandle ? this.fileHandle.name : '';
  }
}

const fileService = FileService.getInstance();
export default fileService;