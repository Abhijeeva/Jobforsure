"use client";
import React, { useState } from "react";
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
      // Store data in localStorage
      localStorage.setItem("jobDescription", jobDescription);
      localStorage.setItem("interviewDate", interviewDate);
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
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.titleWrapper}>
          <h1 className={styles.title}>
            <span className={styles.titleText}>Job</span>
            <span className={styles.highlight}>For</span>
            <span className={styles.titleText}>Sure</span>
          </h1>
          <p className={styles.subtitle}>Where Preparation Meets Opportunity</p>
        </div>

        {/* Stats Section */}
        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>50k+</span>
            <span className={styles.statLabel}>Interview Questions</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>1000+</span>
            <span className={styles.statLabel}>Success Stories</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>95%</span>
            <span className={styles.statLabel}>Success Rate</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Assessment Form */}
        <div className={styles.formSection}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <h2 className={styles.formTitle}>
              Start Your Interview Preparation
            </h2>

            <div className={styles.formGroup}>
              <label htmlFor="resume" className={styles.label}>
                Upload Resume
              </label>
              <div className={styles.uploadBox}>
                <input
                  type="file"
                  id="resume"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files) setResume(e.target.files[0]);
                  }}
                  className={styles.fileInput}
                />
                <div className={styles.uploadContent}>
                  <p className={styles.uploadText}>
                    {resume ? resume.name : "Click to upload or drag and drop"}
                  </p>
                  <p className={styles.uploadHint}>
                    PDF, DOC, DOCX (MAX. 10MB)
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="jobDescription" className={styles.label}>
                Job Description
              </label>
              <textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here"
                className={styles.textarea}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="interviewDate" className={styles.label}>
                Interview Date
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

        {/* Features Section */}
        <div className={styles.featuresSection}>
          <h2 className={styles.sectionTitle}>Why Choose Us?</h2>
          <div className={styles.featuresList}>
            <div className={styles.featureItem}>
              <h3 className={styles.featureTitle}>
                Personalized Learning Path
              </h3>
              <p className={styles.featureDescription}>
                Get a customized preparation plan based on your resume and job
                description
              </p>
            </div>
            <div className={styles.featureItem}>
              <h3 className={styles.featureTitle}>Real Interview Questions</h3>
              <p className={styles.featureDescription}>
                Practice with actual questions from top tech companies
              </p>
            </div>
            <div className={styles.featureItem}>
              <h3 className={styles.featureTitle}>Expert Feedback</h3>
              <p className={styles.featureDescription}>
                Receive detailed feedback to improve your interview performance
              </p>
            </div>
            <div className={styles.featureItem}>
              <h3 className={styles.featureTitle}>Progress Tracking</h3>
              <p className={styles.featureDescription}>
                Monitor your improvement with detailed analytics and insights
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
