import asyncio
import logging
from typing import Any
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from pipeline import run_research_pipeline, run_research_pipeline_stream

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("research_api")

app = FastAPI(
    title="Multi-Agent Research System API",
    version="1.0.0"
)

# Enable CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def ensure_str(val: Any) -> str:
    """Defensively ensures any agent response value is a valid string for Pydantic."""
    if val is None:
        return ""
    if isinstance(val, str):
        return val
    if isinstance(val, list):
        parts = []
        for x in val:
            if isinstance(x, dict) and "text" in x and isinstance(x["text"], str):
                parts.append(x["text"])
            elif isinstance(x, dict) and "content" in x and isinstance(x["content"], str):
                parts.append(x["content"])
            else:
                parts.append(str(x))
        return "\n".join(parts)
    return str(val)

class ResearchRequest(BaseModel):
    topic: str = Field(..., min_length=2, max_length=500)

class ResearchResponse(BaseModel):
    topic: str
    search_results: str
    scraped_content: str
    report: str
    feedback: str
    status: str = "success"

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/")
def root_check():
    return {"message": "hello world"}

# 1. Standard POST Endpoint
@app.post("/api/research", response_model=ResearchResponse)
async def research_endpoint(payload: ResearchRequest):
    topic = payload.topic.strip()
    if not topic:
        raise HTTPException(status_code=400, detail="Topic cannot be empty.")

    try:
        # Offload blocking chain/agent execution to threadpool
        result = await asyncio.to_thread(run_research_pipeline, topic)
        return ResearchResponse(
            topic=topic,
            search_results=ensure_str(result.get("search_results", "")),
            scraped_content=ensure_str(result.get("scraped_content", "")),
            report=ensure_str(result.get("report", "")),
            feedback=ensure_str(result.get("feedback", "")),
            status="success"
        )
    except Exception as e:
        logger.error(f"Pipeline execution error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# 2. Real-time Streaming SSE Endpoint (Recommended for React)
@app.get("/api/research/stream")
async def research_stream_get(topic: str = Query(..., min_length=2)):
    return StreamingResponse(
        run_research_pipeline_stream(topic),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )
