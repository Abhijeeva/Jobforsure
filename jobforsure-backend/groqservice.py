import os
from groq import Groq
from transformers import pipeline, AutoTokenizer, AutoModelForTokenClassification
import json
import re
import random
import datetime
from datetime import timedelta
from typing import Optional, List, Dict
from datetime import date

GROA_API_KEY = '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'

# Load Hugging Face's NER model and tokenizer
model_name = "dbmdz/bert-large-cased-finetuned-conll03-english"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForTokenClassification.from_pretrained(model_name)
ner_pipeline = pipeline("ner", model=model, tokenizer=tokenizer, grouped_entities=True)

def extract_job_information(job_description):

    sentences = job_description.split("\n")

    job_title = sentences[0].strip() if sentences else "Unknown"

    # Perform Named Entity Recognition (NER)
    ner_results = ner_pipeline(job_description)

    # Extract keywords for skills, technologies, or entities
    skills = [
        ent["word"]
        for ent in ner_results
        if ent["entity_group"] in {"ORG", "MISC", "LOC", "PER"}
    ]

    # Filter responsibilities (sentences with action keywords)
    responsibilities = [
        sentence.strip()
        for sentence in sentences
        if any(
            keyword in sentence.lower()
            for keyword in ["responsible", "develop", "design", "lead", "manage", "build"]
        )
    ]

    # Filter qualifications (sentences with qualification-related keywords)
    qualifications = [
        sentence.strip()
        for sentence in sentences
        if any(
            keyword in sentence.lower()
            for keyword in ["requirement", "must", "qualification", "experience", "degree"]
        )
    ]

    # Compile extracted information
    extracted_info = {
        "Job Title": job_title,
        "Skills": list(set(skills)),  # Deduplicate skills
        "Responsibilities": responsibilities,
        "Qualifications": qualifications,
    }

    return extracted_info

# Create the Groq client
client = Groq(api_key=GROA_API_KEY)

# Function to generate MCQs based on skills
def generate_questions(job_description, resume):
    # Extract skills
    jd_keywords = set(job_description.get("Skills", []))  # Fix here
    resume_skills = set(resume.get("Skills", [])) 

    # Determine missing and matched skills
    missing_skills = list(jd_keywords - resume_skills)
    matched_skills = list(jd_keywords & resume_skills)

    # Prepare system prompt for question generation
    system_prompt = {
        "role": "system",
        "content": (
            "You are an expert interviewer. Your task is to generate 10 multiple-choice interview questions "
            "based on the provided skills. Each question should have 4 options with one correct answer. "
            "Format the response as a JSON array where each object includes: "
            "'question', 'options' (list of 4), and 'correct_answer' (integer 1-4)."
        )
    }

    # Combine missing and matched skills for question generation
    all_skills = missing_skills + matched_skills[:max(10 - len(missing_skills), 0)]
    skill_list = ", ".join(all_skills)

    # Generate the questions prompt
    prompt = {
        "role": "user",
        "content": f"Generate 10 multiple-choice questions for the following skills: {skill_list}."
    }

    # Make a call to the Groq API
    response = client.chat.completions.create(
        model="llama3-70b-8192",
        messages=[system_prompt, prompt],
        max_tokens=1000,
        temperature=1.0
    )

    # Parse and return questions as JSON
    questions = response.choices[0].message.content.strip()
    # print(questions)
    return questions, response

def process_groq_response(response):
    """
    Extract and process the JSON content from Groq's response.
    Args:
        response (dict): The complete response from Groq's API.
    Returns:
        list: Parsed JSON content as a Python object.
    """
    try:
        # Step 1: Extract `message.content`
        message_content = response["choices"][0]["message"]["content"]

        # Step 2: Extract JSON block using regex
        match = re.search(r"```(.*?)```", message_content, re.DOTALL)
        if not match:
            raise ValueError("No JSON block found in the message content.")

        json_content = match.group(1).strip()

        # Step 3: Parse the extracted JSON
        questions = json.loads(json_content)

        # Step 4: Validate the structure of each question
        for question in questions:
            if not all(key in question for key in ["question", "options", "correct_answer"]):
                raise ValueError(f"Invalid question structure: {question}")
            if not isinstance(question["options"], list) or len(question["options"]) != 4:
                raise ValueError(f"Each question must have exactly 4 options: {question}")
            if not isinstance(question["correct_answer"], int) or not (1 <= question["correct_answer"] <= 4):
                raise ValueError(f"Correct answer must be an integer between 1 and 4: {question}")

        return questions

    except KeyError as e:
        raise ValueError(f"Missing expected key in response: {e}")
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse JSON: {e}")
    



# Function to generate dynamic tasks for a given skill
def generate_dynamic_tasks(skill):
    task_templates = [
        f"Study how {skill} is applied in real-world scenarios.",
        f"Implement a small project or example using {skill}.",
        f"Identify common challenges and best practices for {skill}.",
        f"Work on practical exercises related to {skill}.",
        f"Review documentation and tutorials about {skill} to strengthen your understanding.",
        f"Participate in discussions or forums to learn more about {skill}.",
        f"Practice solving problems that involve {skill}.",
        f"Learn about the foundational concepts of {skill}.",
        f"Explore tools or libraries commonly associated with {skill}.",
        f"Review and analyze case studies involving {skill}.",
        f"Set up a development environment to practice {skill}.",
        f"Create a cheat sheet summarizing key aspects of {skill}.",
        f"Conduct a peer review of projects or exercises involving {skill}.",
        f"Complete a guided tutorial focused on mastering {skill}.",
        f"List and address common mistakes made while working with {skill}.",
        f"Develop a checklist for using {skill} effectively in projects.",
        f"Understand the history and evolution of {skill} in the tech industry.",
        f"Document your learnings and insights while working on {skill}.",
        f"Compare {skill} with other similar tools, concepts, or frameworks.",
        f"Simulate a real-world problem and solve it using {skill}.",
        f"Create a simple workflow or pipeline incorporating {skill}.",
        f"Explore advanced features or use cases of {skill}.",
        f"Conduct research on emerging trends related to {skill}.",
        f"Present a short summary or mini-presentation on {skill} to a peer or mentor.",
        f"List key performance metrics to evaluate {skill} in practice.",
        f"Participate in an online coding challenge or competition involving {skill}.",
        f"Contribute to an open-source project that utilizes {skill}.",
        f"Draft interview questions related to {skill} and answer them.",
        f"Create and analyze test cases for scenarios involving {skill}.",
        f"Experiment with integration or interoperability between {skill} and other tools."
    ]
    return random.sample(task_templates, 4)  # Select 4 unique tasks randomly


import json
from datetime import datetime, timedelta
import random

# Function to calculate score and generate preparation strategy
def generate_analysis_and_strategy(questions: List[Dict], jd: str, interview_date: str):

    score = 0
    preparation_plan = []
    today = datetime.today()
    interview_date = datetime.strptime(interview_date, "%Y-%m-%d")

    for i, question in enumerate(questions):
        if question["isCorr"]:
            score += 1
        else:
            # Weak skills handled inline within preparation strategy
            weak_skill = question["question"]
            preparation_plan.append({
                "title": f"Focus on {weak_skill}",
                "date": (today + timedelta(days=len(preparation_plan) + 1)).strftime("%Y-%m-%d"),
                "tasks": [
                    f"Study how {weak_skill} is applied in real-world scenarios.",
                    f"Practice exercises specific to {weak_skill}.",
                    f"Work on practical projects involving {weak_skill}.",
                    f"Review advanced documentation and tutorials on {weak_skill}."
                ]
            })

    # Return only the score and preparation strategy
    return {
        "preparation_strategy": preparation_plan
    }


    questions = [
        {
            "question": "What is the default database system used in Django?",
            "options": ["MySQL", "PostgreSQL", "SQLite", "Oracle"],
            "correct_answer": 3
        },
        {
            "question": "Which of the following Azure services is used for deploying and managing applications?",
            "options": ["Azure VM", "Azure App Service", "Azure Blob Storage", "Azure Functions"],
            "correct_answer": 2
        },
        {
            "question": "What is the primary use of the 'requests' library in Python?",
            "options": ["To handle file I/O", "To send HTTP requests", "To manage databases", "To execute shell commands"],
            "correct_answer": 2
        },
        {
            "question": "In a Django project, what is the purpose of the 'settings.py' file?",
            "options": ["To define database models", "To store project-wide settings", "To manage URLs", "To implement views"],
            "correct_answer": 2
        },
        {
            "question": "What is the purpose of Django's ORM (Object-Relational Mapping) system?",
            "options": ["To manage HTTP requests", "To abstract database interactions", "To store static files", "To implement caching"],
            "correct_answer": 2
        },
        {
            "question": "In Django, what is the purpose of a 'middleware'?",
            "options": ["To define database schema", "To manage templates", "To handle HTTP requests", "To send HTTP responses"],
            "correct_answer": 3
        }
    ]

    user_answers = [2, 3, 4, 1, 2, 3]  # Example user answers
    interview_date = "2025-01-25"

    try:
        # Step 1: Generate analysis and strategy
        result = generate_analysis_and_strategy(questions, user_answers, interview_date)

        # Step 2: Print JSON response
        print(json.dumps(result, indent=4))

    except Exception as e:
        print(json.dumps({"error": str(e)}, indent=4))
