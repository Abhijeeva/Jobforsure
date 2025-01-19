"use client";

import React, { useState } from "react";
//import apiService from "../services/apiService"; // Assume this service is implemented
import { useRouter } from "next/navigation";
import styles from "../css/home.module.css";
import { submitProfile } from "../services/apiService";

const Home: React.FC = () => {
  const router = useRouter();
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume || !jobDescription || !interviewDate) {
      setError("All fields are required.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("jobDescription", jobDescription);
    formData.append("interviewDate", interviewDate);

    setLoading(true);
    setError(null);

    try {
      const response = await submitProfile(
        resume,
        jobDescription,
        interviewDate
      );
      alert("Assessment started successfully!");
      router.push(
        `/questions?data=${encodeURIComponent(JSON.stringify(response))}`
      );

      console.log(response);
    } catch (error) {
      setError("Failed to submit profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>JobsForSure - Start Your Assessment</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="resume" className={styles.label}>
            Upload Resume:
          </label>
          <input
            type="file"
            id="resume"
            accept=".pdf,.doc,.docx"
            onChange={(e) => {
              if (e.target.files) setResume(e.target.files[0]);
            }}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="jobDescription" className={styles.label}>
            Job Description:
          </label>
          <textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here"
            className={styles.textarea}
          ></textarea>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="interviewDate" className={styles.label}>
            Interview Date:
          </label>
          <input
            type="date"
            id="interviewDate"
            value={interviewDate}
            onChange={(e) => setInterviewDate(e.target.value)}
            className={styles.input}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? "Starting Assessment..." : "Start Assessment"}
        </button>
      </form>
    </div>
  );
};

export default Home;
