from fastapi import FastAPI
from routes.TodoRoute import router as TodoRouter

app = FastAPI(title="CRUD APP")

app.include_router(TodoRouter)

@app.get("/", tags=["Main"])
def indexView():
    return {
        "message": "Server is Running"
    }