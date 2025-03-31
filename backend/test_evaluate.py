import csv
import os
import json
import asyncio
from typing import Dict, Any, List, Tuple

from evaluate import evaluate, load_questions


async def test_evaluate(freetext: str, questions) -> Dict[str, Any]:
    """
    Test the evaluate function against expected results from CSV.

    Args:
        freetext: The free text to evaluate
        questions: The questions to evaluate against

    Returns:
        A dictionary with evaluation results and test results
    """
    # Get evaluation results from OpenAI (or fallback)
    eval_results = await evaluate(freetext, questions)

    score = sum(result["correct"] for result in eval_results.values())
    test_results = [question["question"] for question in eval_results.values()]

    # Calculate a percentage score out of 100
    total_questions = len(eval_results)
    tmp_score = (score / total_questions * 100) if total_questions > 0 else 0
    
    await save_evaluation_log(freetext, eval_results, score)

    return {
        "score": score,
        "tmp_score": tmp_score,
        "results": eval_results,
        "test_details": test_results,
    }


async def save_evaluation_log(
    freetext: str,
    results: Dict[str, Any],
    score: int,
) -> None:
    """
    Save the evaluation details to a log file for debugging.

    Args:
        freetext: The user's input text
        results: The evaluation results
        score: The final score (1-5)
    """
    os.makedirs("logs", exist_ok=True)

    # Create a timestamp for the log file
    from datetime import datetime

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    log_data = {
        "timestamp": timestamp,
        "input_text": (
            freetext[:500] + "..." if len(freetext) > 500 else freetext
        ),  # Truncate long inputs
        "score": score,
        "results": results,
    }

    # Write to a JSON file
    with open(f"logs/evaluation_{timestamp}.json", "w", encoding="utf-8") as f:
        json.dump(log_data, f, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    # Test with a sample input
    sample_text = """
    For purregebyr og renter, det må gå minst 14 dager etter forfall. 
    Kontaktperson legges inn via kundekortet under fanen "Kontakter".
    For å trekke en ansatt et beløp i lønn, bruk lønnsart for trekk.
    RF-1321 liste finnes i meny under Lønn > Rapporter > RF-1321.
    Mva på konto uten avdeling krever spesifikk momsbehandling.
    """
    questions = load_questions("data/check_questions.csv")

    # Run the async function in an event loop
    results = asyncio.run(test_evaluate(sample_text, questions))

    print(f"Score (1-5): {results['score']}")
    print(f"Temp Score (0-100): {results['tmp_score']}")
    print("\nResults:")
    for key, result in results["results"].items():
        print(f"  {key}: {result['question']}")
        print(f"      Classification: {result['classification']}")
        print(f"      Correct: {result['correct']}")
