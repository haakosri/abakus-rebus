import csv
import os
import json
import asyncio
import logging
from typing import Dict, List, Tuple, Any, Optional
from models import OpenAIResponse
import os
from openai import OpenAI, AsyncOpenAI
import tqdm

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
async_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def normalize_label(label: str) -> str:
    """Normalize labels to canonical form for comparison."""
    if label is None:
        return ""
    l = label.strip().lower()
    if l in {"mcp agent", "innsiktsmodul", "innsikt"}:
        return "innsiktsmodulen"
    if l in {"support ai", "support-ai", "supportai"}:
        return "supportai"
    return l


def load_questions(filename: str) -> dict[str, str]:
    """Load questions and classifications from CSV file"""
    questions = {}

    if not os.path.exists(filename):
        return questions

    with open(filename, "r", encoding="utf-8") as f:
        reader = csv.reader(f, delimiter=";")
        next(reader)  # Skip header
        for row in reader:
            if len(row) >= 2:
                question_text = row[0].strip()
                expected_label = normalize_label(row[1])
                questions[question_text] = expected_label

    return questions


async def call_openai_api(
    user_input: str, questions: List[Tuple[str, str]]
) -> Dict[str, Dict[str, str]]:
    """
    Call the OpenAI API with the user's input and questions

    Args:
        user_input: The user's input text
        questions: List of (question, classification) tuples

    Returns:
        The OpenAI API response as a dictionary, or None if the call fails
    """
    try:
        # Prepare messages and process sequentially (no concurrency)
        results = {}

        print("Evaluating questions (sequential)...")

        # Support when questions is a dict mapping question->classification
        iterator = (
            enumerate(questions.items())
            if hasattr(questions, "items")
            else enumerate(questions)
        )

        for i, item in iterator:
            if hasattr(questions, "items"):
                question, _ = item
            else:
                question, _ = item  # assume tuple(question, classification)

            messages = [
                {"role": "system", "content": f"{user_input}"},
                {"role": "user", "content": f"{question}"},
            ]

            response = await async_client.beta.chat.completions.parse(
                model="gpt-4o",
                messages=messages,
                response_format=OpenAIResponse,
                temperature=0.0,
                seed=42,
            )

            classification = json.loads(response.choices[0].message.content)["response"]
            results[str(i)] = {
                "classification": classification.strip(),
                "question": question.strip(),
            }
            print(f"Completed {i + 1}", end="\r")

        return results

    except Exception as e:
        print(f"Exception when calling OpenAI API: {str(e)}")
        return None


async def parse_openai_response(
    response: dict[str, dict[str, str]], questions: dict[str, str]
) -> Dict[str, Dict[str, Any]]:
    """
    Parse the OpenAI API response to extract classifications and correctness

    Args:
        response: The OpenAI API response
        questions: List of (question, classification) tuples

    Returns:
        A dictionary with results for each question
    """
    results = {}
    try:
        for key, value in response.items():
            classification = value["classification"]
            question = value["question"].strip()
            expected_label = questions[question]
            predicted = normalize_label(classification)
            expected = normalize_label(expected_label)
            correct = predicted == expected
            if not correct:
                logging.error(
                    f"Incorrect classification: '{classification}' vs expected '{expected_label}' for question: {question}"
                )
            results[key] = {
                "question": question,
                "classification": classification,
                "expected": expected_label,
                "correct": correct,
            }
    except Exception as e:
        print(f"Exception when parsing OpenAI API response: {str(e)}")
        results = {}

    return results


async def evaluate(system_prompt: str, questions) -> Dict[str, Dict[str, Any]]:
    """
    Evaluate free text against known questions using OpenAI API.
    If API call fails, falls back to random classifications.

    Args:
        system_prompt: The free text input from the user
        questions: The questions to evaluate against

    Returns:
        A dictionary mapping question keys to evaluation results
    """

    response: dict[str, dict[str, str]] = await call_openai_api(system_prompt, questions)

    # Parse the response
    if response:
        parsed_data = await parse_openai_response(response, questions)
        return parsed_data

    # Fallback to random results if API call is not possible or fails
    results = {}
    for key, value in questions.items():
        results[key] = {
            "question": key,
            "classification": "?",
            "correct": False,
        }

    return results
