"use client";

import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import styles from "../css/personalizedPlan.module.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const barOptions = {
  maintainAspectRatio: true, // Ensures the chart doesn't stretch infinitely
  responsive: true, // Makes the chart responsive
  scales: {
    y: {
      beginAtZero: true, // Ensures the y-axis starts at zero
    },
  },
};

const PersonalizedPlan: React.FC = () => {
  const pieData = {
    labels: ["Java", "Python", "SQL", "Problem Solving"],
    datasets: [
      {
        data: [25, 20, 30, 25],
        backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0"],
        hoverBackgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0"],
      },
    ],
  };

  const barData = {
    labels: ["Java", "Python", "SQL", "Problem Solving"],
    datasets: [
      {
        label: "Scores",
        data: [80, 70, 90, 85],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    maintainAspectRatio: true, // Ensures the chart doesn't stretch infinitely
    responsive: true, // Makes the chart responsive
    scales: {
      y: {
        beginAtZero: true, // Ensures the y-axis starts at zero
      },
    },
  };

  const calendarEvents = [
    { title: "Study Java Basics", date: "2025-01-19" },
    { title: "Practice SQL Queries", date: "2025-01-20" },
    { title: "Python Advanced Topics", date: "2025-01-21" },
    { title: "Mock Interview", date: "2025-01-22" },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Your Personalized Plan</h1>
      <p className={styles.comment}>
        Congratulations on completing the assessment! Based on your performance,
        we’ve created a personalized plan to help you improve your skills and
        ace your interviews. Below, you’ll find a breakdown of your skills, your
        scores, and a day-by-day study plan.
      </p>
      <div className={styles.chartsContainer}>
        <div className={styles.chartWrapper}>
          <h2>Skill Distribution</h2>
          <Pie data={pieData} />
        </div>
        <div className={styles.chartWrapper}>
          <h2>Skill Scores</h2>
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
      <div className={styles.calendarContainer}>
        <h2>Action Plan</h2>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={calendarEvents}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridWeek,dayGridDay",
          }}
        />
      </div>
    </div>
  );
};

export default PersonalizedPlan;
