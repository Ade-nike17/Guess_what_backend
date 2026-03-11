# Guess_what_backend

A backend REST API built with **Node.js** and **Express.js** to support the *Guess What* application.

## 🚀 Project Overview

This repository contains the backend server for the *Guess What* app. It provides API endpoints for game logic, user interaction, or backend features used by the frontend (not included).  
Describe what your backend does here — e.g., user authentication, game state tracking, score keeping, etc.

---

## 🧠 Features

- Built with Node.js and Express
- JSON API for frontend consumption
- Structured folder layout
- Includes tests using Jest
- Uses modular models/controllers (in `models/`)

---

## 📂 Project Structure
```
├── models/ # Data models
├── tests/ # Test files with Jest
├── server.js # App entry point
├── package.json # Dependencies and scripts
├── jest.config.js # Jest setup
├── node_modules/ # Installed packages
└── .gitignore
```


---

## 🛠️ Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14+)
- npm (comes with Node.js)

---

### 🧾 Installation

1. **Clone the repo**

```bash
git clone https://github.com/Ade-nike17/Guess_what_backend.git
cd Guess_what_backend
```

2. **Install dependencies**
```
npm install
```

3. **Setup config (if any)**

Create any required environment variables or config files (like .env) here.

4. **Running the server**
```
npm start
```
or 
```
npm run dev
```
The API will run on http://localhost:PORT

## 📋 API Endpoints

| Method | Endpoint      | Description               |
| ------ | ------------- | ------------------------- |
| GET    | `/api/guess`  | Example route for guesses |
| POST   | `/api/users`  | Create a new user         |
| GET    | `/api/scores` | Get leaderboard or scores |

## 🧪 Testing
```
npm test
```

🙌 Contributing

If you’d like to help improve this project, follow these steps:

Fork the repository

Create a new branch (git checkout -b feature-name)

Make your changes

Commit (git commit -m "Add feature")

Push (git push origin feature-name)

Open a Pull Request
