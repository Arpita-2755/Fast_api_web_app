from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from routes.TodoRoute import router as TodoRouter

app = FastAPI(title="CRUD APP")

# mount static directory for CSS/JS
app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

app.include_router(TodoRouter)

@app.get("/", tags=["Main"])
def indexView(request: Request):
    """Render the main UI page."""
    return templates.TemplateResponse("index.html", {"request": request})