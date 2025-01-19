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
import dynamic from "next/dynamic";
import styles from "../css/personalizedPlan.module.css";

// Dynamically import FullCalendar with no SSR
const FullCalendar = dynamic(() => import("@fullcalendar/react"), {
  ssr: false,
});
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const PersonalizedPlan = () => {
  const pieData = {
    labels: ["Java", "Python", "SQL", "Problem Solving"],
    datasets: [
      {
        data: [25, 20, 30, 25],
        backgroundColor: [
          "rgba(24, 89, 255, 0.85)", // Main blue
          "rgba(24, 89, 255, 0.65)", // Lighter blue
          "rgba(24, 89, 255, 0.45)", // Even lighter blue
          "rgba(24, 89, 255, 0.25)", // Lightest blue
        ],
        borderWidth: 1,
        borderColor: "#ffffff",
      },
    ],
  };

  const barData = {
    labels: ["Java", "Python", "SQL", "Problem Solving"],
    datasets: [
      {
        label: "Scores",
        data: [80, 70, 90, 85],
        backgroundColor: "rgba(24, 89, 255, 0.7)",
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#1f2937",
        bodyColor: "#1f2937",
        borderColor: "rgba(24, 89, 255, 0.2)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            return `Score: ${context.raw}%`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: "rgba(0, 0, 0, 0.06)",
        },
        ticks: {
          color: "#6b7280",
          callback: function (value) {
            return value + "%";
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6b7280",
          font: {
            weight: "500",
          },
        },
      },
    },
  };

  const calendarEvents = [
    {
      title: "Study Java Basics",
      date: "2025-01-19",
      backgroundColor: "rgba(24, 89, 255, 0.85)",
      borderColor: "rgba(24, 89, 255, 0.85)",
      textColor: "#ffffff",
    },
    {
      title: "Practice SQL Queries",
      date: "2025-01-20",
      backgroundColor: "rgba(24, 89, 255, 0.85)",
      borderColor: "rgba(24, 89, 255, 0.85)",
      textColor: "#ffffff",
    },
    {
      title: "Python Advanced Topics",
      date: "2025-01-21",
      backgroundColor: "rgba(24, 89, 255, 0.85)",
      borderColor: "rgba(24, 89, 255, 0.85)",
      textColor: "#ffffff",
    },
    {
      title: "Mock Interview",
      date: "2025-01-22",
      backgroundColor: "rgba(24, 89, 255, 0.85)",
      borderColor: "rgba(24, 89, 255, 0.85)",
      textColor: "#ffffff",
    },
  ];

  return (
    <div className={styles.mainContainer}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h1>Your Personalized Plan</h1>
          <p>
            Congratulations on completing the assessment! Based on your
            performance, we've created a personalized plan to help you improve
            your skills and ace your interviews. Below, you'll find a breakdown
            of your skills, your scores, and a day-by-day study plan.
          </p>
        </div>

        <div className={styles.calendarSection}>
          <h2>Action Plan</h2>
          <div className={styles.calendarWrapper}>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={calendarEvents}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              height={600}
              dayMaxEvents={2}
              eventDisplay="block"
              buttonText={{
                today: "Today",
                month: "Month",
                week: "Week",
                day: "Day",
              }}
            />
          </div>
        </div>

        <div className={styles.chartsSection}>
          <div className={styles.chartContainer}>
            <h2>Skill Distribution</h2>
            <div className={styles.chart}>
              <Pie
                data={pieData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top",
                      labels: {
                        padding: 20,
                        font: {
                          size: 12,
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className={styles.chartContainer}>
            <h2>Skill Scores</h2>
            <div className={styles.chart}>
              <Bar data={barData} options={barOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedPlan;
