from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import os
import asyncio

# Import local modules
from models import User, SubmissionResponse, LeaderboardEntry
from auth import authenticate_user
from database import (
    init_db,
    save_submission,
    get_leaderboard,
    get_top_three,
    update_submission,
    get_latest_unscored_submissions,
)
from test_evaluate import test_evaluate
from utils import generate_test_questions, ensure_data_dir
from evaluate import load_questions
import sqlite3


# Initialize the FastAPI app
app = FastAPI(title="Leaderboard API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize everything needed on startup"""
    init_db()
    ensure_data_dir()
    if not os.path.exists("data/test_questions.csv"):
        generate_test_questions()


# API Routes
@app.post("/login")
async def login(user: User):
    """Login endpoint"""
    # Check authentication
    # name = authenticate_user(user.name, user.password)

    # If authentication fails, return 401
    """ if name is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
            headers={"WWW-Authenticate": "Bearer"},
        ) """

    return {"name": user.name}


@app.post("/submit", response_model=SubmissionResponse)
async def submit_response(user: User):
    """Submit a solution and get evaluation results"""
    # Authenticate the user
    # name = authenticate_user(user.name, user.password)
    name = user.name

    # If authentication fails, return 401
    if name is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check the current number of tries
    conn = sqlite3.connect("leaderboard.db")
    cursor = conn.cursor()
    cursor.execute(
        "SELECT tries FROM scores WHERE name = ? ORDER BY timestamp DESC LIMIT 1",
        (name,),
    )
    row = cursor.fetchone()
    tries = row[0] if row else 0
    print(f"Tries: {tries}")

    if tries >= 5:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Maximum number of tries exceeded",
        )
    # Load example questions and evaluate only a small, fast subset (20)
    check_questions = load_questions("data/check_questions.csv")
    quick_questions = (
        dict(list(check_questions.items())[:20]) if hasattr(check_questions, "items") else check_questions
    )

    # Evaluate the solution quickly (non-blocking size)
    evaluation = await test_evaluate(user.solution or "", quick_questions)

    # Save submission to database with initial score
    save_submission(
        name=name,
        score=evaluation["score"],
        solution=user.solution,
    )

    # Kick off background final evaluation of the full test set (non-blocking)
    async def _run_final_eval(name: str, solution: str):
        try:
            test_questions = load_questions("data/test_questions.csv")
            final_eval = await test_evaluate(solution or "", test_questions)
            update_submission(name, solution or "", final_eval["score"])
        except Exception as e:
            print(f"Background final evaluation error: {e}")

    asyncio.create_task(_run_final_eval(name, user.solution or ""))

    # Return the evaluation results
    response = SubmissionResponse(
        score=evaluation["score"], results=evaluation["results"], num_uses=tries + 1
    )
    return response


@app.post("/winner")
async def get_winner():
    """Evaluate only latest unscored submissions sequentially and return standings."""
    latest_entries = get_latest_unscored_submissions()

    questions = load_questions("data/test_questions.csv")
    print("Evaluating latest unscored entries (sequential)...")

    for entry in latest_entries:
        result = await test_evaluate(entry["solution"], questions)
        update_submission(entry["name"], entry["solution"], result["score"])

    # Return the best finalScore per user
    conn = sqlite3.connect("leaderboard.db")
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT name, MAX(finalScore) as max_score, MAX(timestamp) as latest_timestamp
        FROM scores
        GROUP BY name
        ORDER BY max_score DESC
        """
    )
    rows = cursor.fetchall()
    conn.close()
    return [{"name": row[0], "score": row[1], "timestamp": row[2]} for row in rows]


@app.get("/final", response_model=list[LeaderboardEntry])
async def get_final_leaderboard():
    """Return final standings by best finalScore per user."""
    conn = sqlite3.connect("leaderboard.db")
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT name, MAX(finalScore) as max_score, MAX(timestamp) as latest_timestamp
        FROM scores
        GROUP BY name
        ORDER BY max_score DESC
        """
    )
    rows = cursor.fetchall()
    conn.close()
    safe_rows = []
    for row in rows:
        name = str(row[0] or "")
        score = int(row[1] or 0)
        timestamp = str(row[2] or "")
        safe_rows.append(LeaderboardEntry(name=name, score=score, timestamp=timestamp))
    return safe_rows


@app.get("/leaderboard", response_model=list[LeaderboardEntry])
async def get_leaderboard_route():
    """Get the leaderboard data"""
    leaderboard_data = get_leaderboard()
    return [
        LeaderboardEntry(
            name=entry["name"], score=entry["score"], timestamp=entry["timestamp"]
        )
        for entry in leaderboard_data
    ]


@app.get("/top3", response_model=list[LeaderboardEntry])
async def get_top_three_route():
    """Get the top three users"""
    top_three_data = get_top_three()
    return [
        LeaderboardEntry(
            name=entry["name"], score=entry["score"], timestamp=entry["timestamp"]
        )
        for entry in top_three_data
    ]


# For running the app directly
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
