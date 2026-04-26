from fastapi import FastAPI

app = FastAPI(title="Stafin Homes API")


@app.get("/health")
def health_check():
    return {"status": "ok"}
