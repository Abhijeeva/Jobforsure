from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from datetime import date
from typing import Optional, List, Dict
import fitz  # PyMuPDF for extracting text from PDFs
import groqservice
import json

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

# Define Pydantic model for questions
class Question(BaseModel):
    question: str
    isCorr: bool


class CreatePlanRequest(BaseModel):
    questions: List[Question]
    jd: str
    interview_date: str


@app.post("/createPlan")
async def create_plan(request: CreatePlanRequest):
    print(request)
    try:
        print("Request:", request)
        questions = [q.dict() for q in request.questions]
        jd = request.jd
        interview_date = request.interview_date
        print("Questions:", questions, "JD:", jd, "Interview Date:", interview_date)

        # # Call the Groq service to create a preparation strategy
        return groqservice.generate_analysis_and_strategy(questions, jd, interview_date)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="127.0.0.1", port=8000)