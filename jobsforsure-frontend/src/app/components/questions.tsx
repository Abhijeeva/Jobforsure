"use client";
import React, { useState } from "react";
import styles from "../css/questions.module.css";

interface Question {
  id: number;
  question: string;
  choices: string[];
  correctAnswer: string;
}

const Questions: React.FC = () => {
  const questions: Question[] = [
    {
      id: 1,
      question: "What is the capital of France?",
      choices: ["Berlin", "Madrid", "Paris", "Rome"],
      correctAnswer: "Paris",
    },
    {
      id: 2,
      question: "Which is the largest planet in our solar system?",
      choices: ["Earth", "Mars", "Jupiter", "Venus"],
      correctAnswer: "Jupiter",
    },
    // Add more questions as needed
  ];

  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswerChange = (questionId: number, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const handleCreatePlan = () => {
    alert("Creating a personalized plan!");
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Assessment Questions</h1>
      <div className={styles.questionsList}>
        {questions.map((q) => (
          <div key={q.id} className={styles.questionCard}>
            <p className={styles.questionText}>
              {q.id}. {q.question}
            </p>
            <div className={styles.choices}>
              {q.choices.map((choice, index) => (
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
                  userAnswers[q.id] === q.correctAnswer
                    ? styles.correct
                    : styles.incorrect
                }
              >
                {userAnswers[q.id] === q.correctAnswer
                  ? "Correct!"
                  : `Incorrect! The correct answer is ${q.correctAnswer}.`}
              </p>
            )}
          </div>
        ))}
      </div>
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
