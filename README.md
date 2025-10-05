# Data Dashboard (Node.js + Express + Anthropic API)

A backend service built with **Node.js** and **Express** that analyzes CSV data by sending it to the **Anthropic API (Claude)**.  
The server accepts CSV content from the frontend, requests an AI-powered analysis, and returns structured JSON insights for use in dashboards or data apps.

---

## 🚀 Features
- Accepts CSV data via a POST request (`/api/analyze`)
- Sends data to Anthropic’s API (Claude) for analysis
- Returns a **clean JSON object** with:
  - Dataset overview (rows, columns, column names)
  - Column-level statistics (mean, median, std, top values, etc.)
  - Insights and correlations
  - Data prepared for charts/visualizations
- Handles large CSVs with a configurable request limit

---

## 📂 Project Structure
```
data-dashboard/
├── server.js # Express backend (CSV -> Anthropic API -> JSON insights)
├── package.json # Dependencies and scripts
└── .gitignore
```

---

## ⚙️ Installation

Clone the repository and install dependencies:

```
git clone https://github.com/YOUR-USERNAME/data-dashboard.git
cd data-dashboard
npm install
```
🔑 Environment Variables
Before running the server, set your Anthropic API key:


`export ANTHROPIC_API_KEY=your_api_key_here`   # Linux / macOS

`setx ANTHROPIC_API_KEY "your_api_key_here"`  # Windows (PowerShell)

▶️ Usage
Start the server:
``node server.js``

You should see:

``Proxy server running at http://localhost:3001``

📡 API Endpoint

POST /api/analyze

Request Body

```
{
  "csvContent": "col1,col2\n1,2\n3,4"
}
```
Response (example)

```
{
  "overview": {
    "rows": 2,
    "columns": 2,
    "columnNames": ["col1", "col2"]
  },
  "columns": [
    {
      "name": "col1",
      "type": "numeric",
      "missing": 0,
      "unique": 2,
      "stats": {
        "mean": 2,
        "median": 2,
        "std": 1,
        "min": 1,
        "max": 3
      }
    }
  ],
  "insights": ["col1 and col2 are perfectly correlated"],
  "correlations": [{"col1": "col1", "col2": "col2", "value": 1}]
}
```

🛠️ Tech Stack
Node.js – Backend runtime

Express – Web framework

CORS – Enable cross-origin requests

Anthropic API – AI analysis engine

