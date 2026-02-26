# FastAPI Todo CRUD App

A simple CRUD (Create, Read, Update, Delete) application built with FastAPI. Data are stored in a local `db.json` file. This project is intended as a lightweight example and is ready to push to GitHub.

## Features

- Create a new todo item
- Retrieve all todos
- Retrieve a single todo by ID
- Update an existing todo
- Delete a todo
- Basic validation using Pydantic models

## Getting Started

### Prerequisites

- Python 3.10+ (or compatible)
- [pip](https://pip.pypa.io/) for installing packages

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd fast-api-todo
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   # Windows PowerShell
   & venv\Scripts\Activate.ps1
   # macOS / Linux
   # source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. (Optional) Install development dependencies such as `requests` if you plan to run the example client code or tests:
   ```bash
   pip install requests
   ```

### Running the App

Start the FastAPI server using Uvicorn:

```bash
uvicorn main:app --reload
```

By default the app will run at [http://127.0.0.1:8000](http://127.0.0.1:8000).

#### Web UI
A modern, responsive UI is served at the root path. Open your browser to:

```
http://127.0.0.1:8000/
```

This page uses Bootstrap and JavaScript to call the same API endpoints behind the scenes, so you can manage todos without external tools.

You can still explore the interactive API documentation at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) or the OpenAPI schema at [http://127.0.0.1:8000/openapi.json](http://127.0.0.1:8000/openapi.json).

### API Endpoints

| Method | Path            | Description                 |
|--------|-----------------|-----------------------------|
| POST   | `/api/v1/create`| Create a new todo           |
| GET    | `/api/v1/`      | Get all todos               |
| GET    | `/api/v1/{id}`  | Get todo by ID              |
| PUT    | `/api/v1/{id}`  | Update todo by ID           |
| DELETE | `/api/v1/{id}`  | Delete todo by ID           |

`Todo` model schema:
```json
{
  "title": "string",
  "desc": "string",
  "isComplete": false
}
```

### Notes

- The local `db.json` file will be created automatically when the first todo is added. It is ignored by default in `.gitignore` to avoid committing private or test data.
- This project is intentionally kept simple for learning and demonstration purposes. In a production application, you would likely use a real database and add authentication, error handling, etc.

## License

This project is released under the MIT License. Feel free to fork and modify as needed. 
