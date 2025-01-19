from fastapi import FastAPI, File, Form, UploadFile
from pydantic import BaseModel
from datetime import date
from typing import Optional
import fitz  # PyMuPDF for extracting text from PDFs
import groqservice
import json
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


def process_extracted_data(pdf_text: str, job_description: str, submission_date: date):
    # Placeholder method to process the extracted text from the PDF
    print("Processing data...")
    print("PDF Text:", pdf_text)
    print("Job Description:", job_description)
    print("Submission Date:", submission_date)

@app.post("/submitProfile")
async def submit_profile(
    pdf_file: UploadFile = File(...),
    job_description: str = Form(...),
    submission_date: Optional[date] = Form(None)
):
    try:
        # Read PDF file and extract text
        pdf_bytes = await pdf_file.read()
        pdf_text = ""
        with fitz.open(stream=pdf_bytes, filetype="pdf") as pdf:
            for page in pdf:
                pdf_text += page.get_text()

        parsed_jd = groqservice.extract_job_information(job_description)
        parsed_resume = groqservice.extract_job_information(pdf_text)
        q, response = groqservice.generate_questions(parsed_jd, parsed_resume)
        groq_response = json.loads(response.to_json())
        try:
            questions = groqservice.process_groq_response(groq_response)
            print("Parsed Questions:")
            print(json.dumps(questions, indent=4))
        except ValueError as e:
            print(f"Error: {e}")
        print("Questions:", questions)
        return questions
        
    except Exception as e:
        return {"error": str(e)}
