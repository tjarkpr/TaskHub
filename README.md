# TaskHub

TaskHub is a modern task management application built with React and TypeScript that helps you organize, track, and manage your tasks effectively. It features a clean interface with time tracking capabilities and persistent storage.

## Features

- **Task Management**: Create, edit, and delete tasks with customizable statuses (Open, In Progress, Done)
- **Time Tracking**: Track the time spent on each task with start/pause functionality
- **Manual Time Editing**: Manually adjust recorded time for tasks
- **Persistent Storage**: Save your tasks directly to your file system
- **Auto-saving**: Changes are automatically saved to your selected file
- **Dark/Light Mode**: Toggle between themes for comfortable viewing in any environment
- **File System Integration**: Create new task files or open existing ones

## Setup & Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. To create a production build:
   ```
   npm run build
   ```

## Browser Compatibility

TaskHub uses the File System Access API, which is currently supported in:
- Google Chrome (version 86+)
- Microsoft Edge (version 86+)
- Opera (version 72+)

Other browsers such as Firefox and Safari do not currently support this API, so the file system functionality will not work in those browsers.

## How to Use

1. **First Launch**: Create a new file or open an existing one (.actionhub format)
2. **Adding Tasks**: Use the form at the bottom to add new tasks
3. **Changing Status**: Use the dropdown on each task to change its status
4. **Time Tracking**: 
   - Click "Start timer" to begin tracking time on a task
   - Click "Pause timer" to stop tracking
   - Double-click on the time display to manually edit time
5. **Editing Tasks**: Double-click on a task description to edit it
6. **Switching Files**: Use the "Change current file" button to work with a different task file
7. **Theme Toggle**: Click the sun/moon icon in the header to switch between light and dark mode

## Project Structure

- components: UI components
- context: React context for themes and todos
- services: Services for file handling
- types: TypeScript type definitions
- hooks: Custom React hooks

## Technical Details

TaskHub uses React's context API for state management and the File System Access API for file operations. Data is stored in JSON format with a custom `.actionhub` file extension.

---

Created with ❤️ using React and TypeScript