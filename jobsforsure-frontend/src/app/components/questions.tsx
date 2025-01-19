"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "../css/questions.module.css";
import { createPlan } from "../services/apiService";

interface Question {
  id: number;
  question: string;
  options?: string[];
  correct_answer?: number;
}

const hardcodedQuestions: Question[] = [
  {
    id: 1001,
    question: "Explain your approach to solving problems in a team setting.",
  },
  {
    id: 1002,
    question: "Describe a challenging project you’ve worked on.",
  },
];

const Questions: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceAnswers, setVoiceAnswers] = useState<{
    [key: number]: Blob | null;
  }>({});

  useEffect(() => {
    const data = searchParams.get("data");
    if (data) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(data));
        if (Array.isArray(parsedData)) {
          const questionsWithIds = parsedData.map(
            (q: Omit<Question, "id">, index: number) => ({
              ...q,
              id: index + 1,
            })
          );
          setQuestions([...questionsWithIds, ...hardcodedQuestions]);
        } else {
          setError("Questions data is missing.");
        }
      } catch (e) {
        setError("Failed to parse questions data.");
      }
    }
  }, [searchParams]);

  const handleAnswerChange = (questionId: number, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const handleCreatePlan = async () => {
    const jobDescription = localStorage.getItem("jobDescription");
    const interviewDate = localStorage.getItem("interviewDate");

    if (jobDescription && interviewDate) {
      try {
        // Prepare question-boolean pairs
        const results = questions.map((q) => ({
          question: q.question,
          isCorr: q.options
            ? userAnswers[q.id] === q.options[q.correct_answer! - 1]
            : true, // Assume open-ended questions are correct by default
        }));

        // Make API call with the transformed data
        const response = await createPlan(
          results,
          jobDescription,
          interviewDate
        );
        console.log(results, jobDescription, interviewDate);
        alert("Personalized plan created successfully!");
        router.push("/personalizedplan");
      } catch (error) {
        setError("Failed to create personalized plan. Please try again.");
      }
    } else {
      alert("Job description or interview date is missing.");
    }
  };

  const startRecording = async (questionId: number) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const chunks: BlobPart[] = [];

    mediaRecorder.ondataavailable = (event) => {
      chunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(chunks, { type: "audio/wav" });
      setVoiceAnswers((prev) => ({ ...prev, [questionId]: audioBlob }));
    };

    mediaRecorder.start();

    setTimeout(() => {
      mediaRecorder.stop();
      stream.getTracks().forEach((track) => track.stop());
    }, 10000); // Record for 10 seconds
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Assessment Questions</h1>
      {error ? (
        <p>{error}</p>
      ) : questions.length > 0 ? (
        <div className={styles.questionsList}>
          {questions.map((q) =>
            q.options ? (
              <div key={q.id} className={styles.questionCard}>
                <p className={styles.questionText}>
                  {q.id}. {q.question}
                </p>
                <div className={styles.choices}>
                  {q.options.map((choice, index) => (
                    <label key={index} className={styles.choiceLabel}>
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={choice}
                        checked={userAnswers[q.id] === choice}
                        onChange={() => handleAnswerChange(q.id, choice)}
                      />
                      {choice}
                    </label>
                  ))}
                </div>
                {showResults && (
                  <p
                    className={
                      userAnswers[q.id] === q.options[q.correct_answer! - 1]
                        ? styles.correct
                        : styles.incorrect
                    }
                  >
                    {userAnswers[q.id] === q.options[q.correct_answer! - 1]
                      ? "Correct!"
                      : `Incorrect! The correct answer is ${
                          q.options[q.correct_answer! - 1]
                        }.`}
                  </p>
                )}
              </div>
            ) : (
              <div key={q.id} className={styles.questionCard}>
                <p className={styles.questionText}>{q.question}</p>
                <button
                  className={styles.recordButton}
                  onClick={() => startRecording(q.id)}
                >
                  Record Answer
                </button>
                {voiceAnswers[q.id] && (
                  <audio
                    controls
                    src={URL.createObjectURL(voiceAnswers[q.id]!)}
                  />
                )}
              </div>
            )
          )}
        </div>
      ) : (
        <p>Loading questions...</p>
      )}
      {!showResults && (
        <button className={styles.button} onClick={handleSubmit}>
          Submit Test
        </button>
      )}
      {showResults && (
        <button className={styles.button} onClick={handleCreatePlan}>
          Create Personalized Plan
        </button>
      )}
    </div>
  );
};

export default Questions;
