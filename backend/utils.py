import csv
import random
import os

def ensure_data_dir():
    """Ensure the data directory exists"""
    os.makedirs('data', exist_ok=True)

def generate_test_questions(filename='data/test_questions.csv', count=50):
    """Generate a CSV with random questions and classifications"""
    ensure_data_dir()
    
    # List of accounting/ERP related question stems
    question_stems = [
        "Hvordan kan jeg {} i systemet?",
        "Er det mulig å {} fra brukergrensesnittet?",
        "Hva er prosedyren for å {} i regnskapet?",
        "Kan jeg {} uten å kontakte administrator?",
        "Hvilket skjema bruker man for å {}?",
        "Hvor finner jeg {} i menyen?",
        "Hvordan genererer jeg en rapport for {}?",
        "Er det mulig å automatisere {} i systemet?",
        "Hva er riktig kontonummer for {}?",
        "Hvordan håndterer systemet {}?"
    ]
    
    # List of accounting/ERP related operations
    operations = [
        "registrere en ny leverandør",
        "opprette en faktura",
        "korrigere en posteringsfeil",
        "sette opp automatisk betaling",
        "avstemme kontoer",
        "generere årsregnskap",
        "håndtere merverdiavgift",
        "håndtere utenlandske transaksjoner",
        "sette opp nye ansatte",
        "beregne feriepenger",
        "utføre lønnskjøring",
        "importere bankfiler",
        "eksportere data til revisor",
        "sette opp budsjettet",
        "definere prosjektkoder",
        "håndtere anlleggsmidler",
        "bokføre avskrivninger",
        "håndtere valutakurser",
        "sette opp periodisk fakturering",
        "avslutte regnskapsår"
    ]
    
    # Generate random questions
    questions = []
    for _ in range(count):
        stem = random.choice(question_stems)
        operation = random.choice(operations)
        question = stem.format(operation)
        
        # Randomly assign to SupportAI, Sticos or innsiktsmodulen
        classification = random.choice(["SupportAI", "Sticos", "innsiktsmodulen"])
        
        questions.append((question, classification))
    
    # Write to CSV
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['question', 'classification'])
        writer.writerows(questions)
    
    print(f"Generated {count} random questions in {filename}")
    return questions

if __name__ == "__main__":
    generate_test_questions()
