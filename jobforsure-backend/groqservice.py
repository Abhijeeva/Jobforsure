import os
from groq import Groq
from transformers import pipeline, AutoTokenizer, AutoModelForTokenClassification
import json
import re

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
    