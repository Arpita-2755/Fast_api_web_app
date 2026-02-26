from fastapi import APIRouter, status, HTTPException
from models.Todo import Todo
import json

router = APIRouter(prefix="/api/v1", tags=["Todos"])

# ---------------- LOAD DATA ----------------
def load_file():
    try:
        with open("db.json", "r") as file:
            return json.load(file)
    except:
        return []

todos = load_file()

# ---------------- SAVE DATA ----------------
def save_file():
    with open("db.json", "w") as file:
        json.dump(todos, file, indent=4)

# ---------------- CREATE TODO ----------------
@router.post("/create", status_code=status.HTTP_201_CREATED)
def createView(data: Todo):

    new_data = data.dict()
    new_data["id"] = len(todos) + 1

    todos.append(new_data)
    save_file()

    return {
        "message": "Todo Created Successfully",
        "data": new_data
    }

# ---------------- GET ALL TODOS ----------------
@router.get("/", status_code=status.HTTP_200_OK)
def getAllTodos():
    return todos

# ---------------- GET TODO BY ID ----------------
@router.get("/{id}", status_code=status.HTTP_200_OK)
def getTodoById(id: int):

    for todo in todos:
        if todo["id"] == id:
            return todo

    raise HTTPException(status_code=404, detail="Todo Not Found")

# ---------------- UPDATE TODO ----------------
@router.put("/{id}", status_code=status.HTTP_200_OK)
def updateTodo(id: int, data: Todo):
    """Replace an existing todo with new values."""
    for index, todo in enumerate(todos):
        if todo["id"] == id:
            updated = data.dict()
            updated["id"] = id
            todos[index] = updated
            save_file()
            return {"message": "Todo Updated Successfully", "data": updated}

    raise HTTPException(status_code=404, detail="Todo Not Found")

# ---------------- DELETE TODO ----------------
@router.delete("/{id}", status_code=status.HTTP_200_OK)
def deleteTodo(id: int):
    """Remove a todo by id."""
    for index, todo in enumerate(todos):
        if todo["id"] == id:
            todos.pop(index)
            save_file()
            return {"message": "Todo Deleted Successfully"}

    raise HTTPException(status_code=404, detail="Todo Not Found")