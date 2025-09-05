const { app, BrowserWindow, Menu, session, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let flaskProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Temporarily disable for development
      devTools: true
    },
    show: false // Don't show the window until it's ready
  });

  // Show window when it's ready to prevent white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Set security headers with more permissive CSP for development
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Access-Control-Allow-Origin': ['*'],
        'Content-Security-Policy': ["default-src 'self' http://127.0.0.1:5001 http://localhost:5001; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' http://127.0.0.1:5001 http://localhost:5001"]
      }
    });
  });

  // Set up CORS handling
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    callback({
      requestHeaders: { 
        ...details.requestHeaders,
        'Origin': 'http://localhost:5001',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  });

  // Enable logging
  mainWindow.webContents.on('console-message', (_, level, message) => {
    console.log('Renderer Process:', message);
  });

    // Load the React app
  const indexPath = path.join(__dirname, 'frontend', 'build', 'index.html');
  console.log('Loading React app from:', indexPath);
  console.log('Attempting to load React app from:', indexPath);
  
  try {
    if (fs.existsSync(indexPath)) {
      console.log('Index file exists, loading...');
      mainWindow.loadFile(indexPath).catch(err => {
        console.error('Failed to load React app:', err);
      });
    } else {
      console.error('Index file not found at:', indexPath);
      console.log('Current directory contents:', fs.readdirSync(__dirname));
      console.log('Frontend directory contents:', fs.readdirSync(path.join(__dirname, 'frontend')));
    }
  } catch (err) {
    console.error('Error checking for index file:', err);
  }

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function startFlask() {
  // Get the correct path for the packaged app
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  const isDev = process.env.NODE_ENV === 'development';
  const backendPath = path.join(__dirname, 'backend');
  
  console.log('Starting Flask from:', backendPath);
  
  try {
    console.log('Backend directory contents:', fs.readdirSync(backendPath));
  } catch (err) {
    console.error('Error reading backend directory:', err);
  }
  
  // Use pip3's Python
  const pythonCommand = '/Users/shohag/.pyenv/versions/3.12.9/bin/python3';
  
  // Function to check if port is available
  const isPortAvailable = (port) => {
    return new Promise((resolve) => {
      const net = require('net');
      const server = net.createServer();
      
      server.once('error', () => {
        resolve(false);
      });
      
      server.once('listening', () => {
        server.close();
        resolve(true);
      });
      
      server.listen(port);
    });
  };
  
  // Wait for port to be available
  const portAvailable = await isPortAvailable(5001);
  if (!portAvailable) {
    console.log('Port 5001 is in use, waiting for it to be available...');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Ensure app.py exists
  const appPath = path.join(backendPath, 'app.py');
  if (!fs.existsSync(appPath)) {
    console.error('Cannot find app.py at:', appPath);
    return;
  }
  
  // Check if Python is available
  try {
    const pythonVersionOutput = require('child_process').execSync(`${pythonCommand} --version`).toString();
    console.log('Python version:', pythonVersionOutput);
  } catch (err) {
    console.error('Python not found:', err);
    return;
  }
  
  return new Promise((resolve, reject) => {
    let started = false;
    
    flaskProcess = spawn(pythonCommand, ['app.py'], {
      cwd: backendPath,
      stdio: 'pipe',
      env: {
        ...process.env,
        PYTHONUNBUFFERED: '1',
        PYTHONPATH: backendPath,
        FLASK_ENV: isDev ? 'development' : 'production',
        FLASK_APP: 'app.py',
        PATH: process.env.PATH
      }
    });

    flaskProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('Flask stdout:', output);
      // Start serving when either running message appears or debugger is active
      if (!started && (output.includes('Running on') || output.includes('Debugger is active'))) {
        started = true;
        resolve();
      }
    });

    flaskProcess.stderr.on('data', (data) => {
      const error = data.toString();
      console.error('Flask stderr:', error);
      if (!started) {
        if (error.includes('Running on http://127.0.0.1:5001')) {
          started = true;
          resolve();
        } else if (error.includes('Error')) {
          reject(new Error(`Flask failed to start: ${error}`));
        }
      }
    });

    flaskProcess.on('error', (err) => {
      console.error('Failed to start Flask server:', err);
      reject(err);
    });

    flaskProcess.on('exit', (code, signal) => {
      console.log('Flask process exited with code:', code, 'signal:', signal);
      if (!started) {
        reject(new Error(`Flask process exited with code ${code} before starting`));
      }
    });


    
    // Timeout after 60 seconds
    setTimeout(() => {
      if (!started) {
        reject(new Error('Flask failed to start within 60 seconds'));
      }
    }, 60000);
  });
}

function stopFlask() {
  if (flaskProcess) {
    flaskProcess.kill();
  }
}

app.whenReady().then(async () => {
  // Remove menu bar (optional)
  Menu.setApplicationMenu(null);
  
  try {
    // Start Flask and wait for it to be ready
    await startFlask();
    console.log('Flask server started successfully');
    
    // Create the window after Flask is ready
    createWindow();
  } catch (error) {
    console.error('Failed to start Flask server:', error);
    dialog.showErrorBox(
      'Error Starting Application',
      'Failed to start the backend server. Please check the logs for more information.'
    );
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopFlask();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopFlask();
});