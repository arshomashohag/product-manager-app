# Product Manager Desktop App

A cross-platform desktop application built with Electron, React, and Flask for managing products. The app uses a Flask backend with SQLite database for data storage and a React frontend for the user interface.

## Quick Start

1. Install dependencies:
   ```bash
   npm run install-deps
   ```

2. Start the app:
   ```bash
   npm start
   ```

3. Build installable app:
   ```bash
   npm run build
   ```
   Find the installer in the `dist` folder.

## Tech Stack

- **Frontend**: React.js
- **Backend**: Flask (Python)
- **Desktop Framework**: Electron
- **Database**: SQLite

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- Python (v3.9 or higher)
- npm (usually comes with Node.js)
- pip (Python package manager)

## Project Structure

```
product-manager-app/
├── backend/             # Flask backend
│   ├── app.py          # Main Flask application
│   └── requirements.txt # Python dependencies
├── frontend/           # React frontend
│   ├── public/
│   ├── src/
│   └── package.json
├── main.js            # Electron main process
└── package.json       # Main package.json
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd product-manager-app
   ```

```bash
mkdir product-manager-app
cd product-manager-app

# Create directories
mkdir frontend backend
```

2. **Install all dependencies**
   ```bash
   # Install everything with one command
   npm run install-deps

   # Or install separately:
   npm install                    # Main app dependencies
   cd frontend && npm install     # Frontend dependencies
   cd backend && pip install -r requirements.txt  # Backend dependencies
   ```

## Development

### Running the App in Development Mode

1. **Start the entire application**
   ```bash
   npm start
   ```
   This will start both the Flask backend and the Electron app with the React frontend.

### Running Components Separately

1. **Run React Frontend Separately**
   ```bash
   cd frontend
   npm start
   ```
   The React development server will start at `http://localhost:3000`

2. **Run Flask Backend Separately**
   ```bash
   cd backend
   python app.py
   ```
   The Flask server will start at `http://localhost:5001`

## Building for Production

1. **Build the Application**
   ```bash
   npm run build
   ```
   This will:
   - Build the React frontend
   - Package the entire application with Electron Builder
   - Create installers in the `dist` folder

2. **Find the Installers**
   After building, you can find the installers in the `dist` folder:
   - macOS: `dist/Product Manager-1.0.0-arm64.dmg` (Apple Silicon)
   - Windows: `dist/Product Manager Setup.exe`
   - Linux: `dist/product-manager-1.0.0.AppImage`

## Installing the Production App

### macOS
1. Double-click the DMG file in the `dist` folder
2. Drag the Product Manager app to your Applications folder
3. First time running:
   - Right-click the app
   - Select "Open" from the context menu
   - Click "Open" in the security dialog

## Features

- Add, edit, and delete products
- View all products in a clean interface
- Data persistence using SQLite database
- Cross-platform desktop application
- Responsive design

## API Endpoints

- `GET /api/products` - Get all products
- `POST /api/products` - Add new product
- `PUT /api/products/<id>` - Update a product
- `DELETE /api/products/<id>` - Delete a product

## Troubleshooting

1. **"Failed to fetch" Error**
   - Ensure the Flask backend is running
   - Check if port 5001 is available
   - Verify your firewall settings

2. **Python Import Errors**
   - Ensure all dependencies are installed: `pip install -r requirements.txt`
   - Check if you're using the correct Python version

3. **Database Issues**
   - Check if the SQLite database file exists
   - Ensure proper write permissions in the backend directory