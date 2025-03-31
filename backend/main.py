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
)
from test_evaluate import test_evaluate
from utils import generate_test_questions, ensure_data_dir
from evaluate import load_questions
import sqlite3
import tqdm
import concurrent.futures


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
    check_questions = load_questions("data/check_questions.csv")

    # Evaluate the solution
    evaluation = await test_evaluate(user.solution or "", check_questions)

    # Save submission to database with both scores
    save_submission(
        name=name,
        score=evaluation["score"],
        solution=user.solution,
    )

    # Return the evaluation results
    response = SubmissionResponse(
        score=evaluation["score"], results=evaluation["results"], num_uses=tries + 1
    )
    return response


@app.post("/winner")
async def get_winner():
    """Get the latest entry for each unique user"""
    # Connect to the database
    conn = sqlite3.connect("leaderboard.db")
    cursor = conn.cursor()

    # Get all unique users
    cursor.execute("SELECT DISTINCT name FROM scores")
    users = cursor.fetchall()

    # Get the most recent submission for each user
    latest_entries = []
    for user in users:
        cursor.execute(
            "SELECT * FROM scores WHERE name = ? ORDER BY timestamp DESC LIMIT 1",
            (user[0],),
        )
        latest_entry = cursor.fetchone()
        if latest_entry:
            latest_entries.append(
                {
                    "name": latest_entry[1],
                    "timestamp": latest_entry[5],
                    "solution": latest_entry[4],
                }
            )

    # Close the database connection
    conn.close()

    # with the latest enties, return the results for the 100 questions
    questions = load_questions("data/test_questions.csv")

    async def evaluate_entry(entry):
        """Evaluate a single entry asynchronously."""
        result = await test_evaluate(entry["solution"], questions)
        return {"name": entry["name"], "solution": entry["solution"], "score": result["score"]}

    # Create tasks for all entries and await them
    tasks = [evaluate_entry(entry) for entry in latest_entries]
    print("Evaluating latest entries...")
    results = await asyncio.gather(*tasks)

    # Sequentially update the database with the results
    for result in results:
        update_submission(result["name"], result["solution"], result["score"])

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
