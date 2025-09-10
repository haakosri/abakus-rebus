import sqlite3
from datetime import datetime
from typing import List, Dict, Any, Optional


def init_db():
    """Initialize the database with required tables"""
    conn = sqlite3.connect("leaderboard.db")
    cursor = conn.cursor()

    # Create scores table with tries field
    cursor.execute(
        """
    CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        score INTEGER NOT NULL,
        finalScore INTEGER,
        solution TEXT,
        timestamp TEXT NOT NULL,
        tries INTEGER DEFAULT 10
    )
    """
    )

    # Check if tries column exists and add it if it doesn't
    cursor.execute("PRAGMA table_info(scores)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if "tries" not in columns:
        print("Migrating database: Adding 'tries' column to scores table")
        cursor.execute("ALTER TABLE scores ADD COLUMN tries INTEGER DEFAULT 0")

    conn.commit()
    conn.close()

    print("Database initialized successfully")


def save_submission(
    name: str,
    score: int,
    solution: Optional[str] = None,
) -> int:
    """
    Save a user submission to the database

    Args:
        name: User's name
        score: The score achieved (1-5)
        solution: The user's solution text

    Returns:
        The ID of the inserted record
    """
    conn = sqlite3.connect("leaderboard.db")
    cursor = conn.cursor()
    timestamp = datetime.now().isoformat()

    # Check the current number of tries
    cursor.execute(
        "SELECT tries FROM scores WHERE name = ? ORDER BY timestamp DESC LIMIT 1",
        (name,),
    )
    row = cursor.fetchone()
    tries = row[0] + 1 if row else 1

    cursor.execute(
        "INSERT INTO scores (name, score, finalScore, solution, timestamp, tries) VALUES (?, ?, ?, ?, ?, ?)",
        (name, score, 0, solution, timestamp, tries),
    )
    last_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return last_id


def update_submission(
    name: str,
    solution: str,
    new_final_score: int,
) -> bool:
    """
    Update the final score for a user's submission

    Args:
        name: User's name
        solution: The user's solution text
        new_final_score: The final score achieved (0-100)

    Returns:
        True if the update was successful, False otherwise
    """
    conn = sqlite3.connect("leaderboard.db")
    cursor = conn.cursor()
    timestamp = datetime.now().isoformat()

    cursor.execute(
        """
        UPDATE scores
        SET finalScore = ?,
            timestamp = ?
        WHERE name = ? AND solution = ?
        """,
        (new_final_score, timestamp, name, solution),
    )

    conn.commit()
    conn.close()

    return cursor.rowcount > 0


def get_leaderboard(limit: int = 10) -> List[Dict[str, Any]]:
    """
    Get the top scores from the leaderboard

    Args:
        limit: Maximum number of entries to return

    Returns:
        List of leaderboard entries
    """
    conn = sqlite3.connect("leaderboard.db")
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT name, MAX(score) AS max_score, MAX(timestamp) AS latest_timestamp
        FROM scores
        GROUP BY name
        ORDER BY max_score DESC
        LIMIT ?
        """,
        (limit,),
    )

    rows = cursor.fetchall()
    conn.close()

    return [{"name": row[0], "score": row[1], "timestamp": row[2]} for row in rows]


def get_top_three() -> List[Dict[str, Any]]:
    """
    Get the top three distinct users by score

    Returns:
        List of top three entries
    """
    conn = sqlite3.connect("leaderboard.db")
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT name, MAX(score) as max_score, timestamp
        FROM scores
        GROUP BY name
        ORDER BY max_score DESC
        LIMIT 3
    """
    )

    rows = cursor.fetchall()
    conn.close()

    return [{"name": row[0], "score": row[1], "timestamp": row[2]} for row in rows]


def get_latest_unscored_submissions() -> List[Dict[str, Any]]:
    """
    Return the latest submission per user that has not been assigned a finalScore yet (finalScore == 0).

    Returns:
        List of dicts with keys: name, solution, timestamp
    """
    conn = sqlite3.connect("leaderboard.db")
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT s.name, s.solution, s.timestamp
        FROM scores s
        INNER JOIN (
            SELECT name, MAX(timestamp) AS latest_ts
            FROM scores
            WHERE finalScore = 0
            GROUP BY name
        ) latest ON latest.name = s.name AND latest.latest_ts = s.timestamp
        WHERE s.finalScore = 0
        ORDER BY s.timestamp DESC
        """
    )

    rows = cursor.fetchall()
    conn.close()

    return [
        {"name": row[0], "solution": row[1], "timestamp": row[2]}
        for row in rows
    ]
