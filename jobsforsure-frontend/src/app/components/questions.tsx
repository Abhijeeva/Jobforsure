"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "../css/questions.module.css";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct_answer: number;
}

const Questions: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          setQuestions(questionsWithIds);
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

  const handleCreatePlan = () => {
    //alert("Creating a personalized plan!");
    router.push("/personalizedplan");
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Assessment Questions</h1>
      {error ? (
        <p>{error}</p>
      ) : questions.length > 0 ? (
        <div className={styles.questionsList}>
          {questions.map((q) => (
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
                    userAnswers[q.id] === q.options[q.correct_answer - 1]
                      ? styles.correct
                      : styles.incorrect
                  }
                >
                  {userAnswers[q.id] === q.options[q.correct_answer - 1]
                    ? "Correct!"
                    : `Incorrect! The correct answer is ${
                        q.options[q.correct_answer - 1]
                      }.`}
                </p>
              )}
            </div>
          ))}
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
