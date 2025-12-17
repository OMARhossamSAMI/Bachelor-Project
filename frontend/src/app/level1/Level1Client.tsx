"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import "./page.css";

const API_URL = "http://localhost:3000";

interface Question {
  id: string;
  question: string;
  choices: string[];
  answer: number;
  hint?: string;
  explanation?: string;
  difficulty?: string;
}

interface User {
  firstName: string;
  lastName: string;
  email: string;
}

export default function Level1Client() {
  const [stage, setStage] = useState<
    "intro" | "countdown" | "question" | "result"
  >("intro");
  const [count, setCount] = useState<number | string>(3);
  const [points, setPoints] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");

  // === Audio ===
  const countdownAudio = useRef<HTMLAudioElement | null>(null);
  const correctAudio = useRef<HTMLAudioElement | null>(null);
  const wrongAudio = useRef<HTMLAudioElement | null>(null);
  const backgroundAudio = useRef<HTMLAudioElement | null>(null);
  const celebrationAudio = useRef<HTMLAudioElement | null>(null);

  const totalQuestions = questions.length;
  const current = questions[currentIndex];

  // === Fetch Level 1 Questions ===
  useEffect(() => {
    if (!email) return;

    const fetchQuestions = async () => {
      try {
        // Try to fetch existing Level 1 quiz
        const res = await fetch(`${API_URL}/ai/level1/${email}/get`);
        let data;
        if (res.ok) {
          data = await res.json();
        } else {
          // If not found, generate a new one
          const genRes = await fetch(`${API_URL}/ai/level1/${email}`);
          data = await genRes.json();
        }

        if (data && data.questions) {
          setQuestions(data.questions);
        } else {
          console.error("Invalid Level 1 data format:", data);
        }
      } catch (err) {
        console.error("Error fetching Level 1 questions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [email]);

  // === Fetch User Info (optional for personalization) ===
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!email) return;
        const res = await fetch(
          `${API_URL}/users/${encodeURIComponent(email)}`
        );
        if (!res.ok) throw new Error("User not found");
        const data: User = await res.json();
        setUserInfo(data);
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      }
    };
    fetchUser();
  }, [email]);

  // === Countdown Animation ===
  useEffect(() => {
    if (stage === "countdown") {
      setCount(3);
      countdownAudio.current?.play();
      const seq = [3, 2, 1, "Go!"];
      let i = 0;
      const timer = setInterval(() => {
        setCount(seq[i]);
        i++;
        if (i === seq.length) {
          clearInterval(timer);
          setTimeout(() => {
            setStage("question");
            backgroundAudio.current!.loop = true;
            backgroundAudio.current!.volume = 0.4;
            backgroundAudio.current?.play();
          }, 600);
        }
      }, 900);
      return () => clearInterval(timer);
    }
  }, [stage]);

  // === Handle Answer Checking ===
  const handleCheck = () => {
    if (selected === null) return;
    setShowAnswer(true);
    const correct = selected === current.answer;
    if (correct) {
      correctAudio.current?.play();
      setPoints((p) => p + 1);
    } else wrongAudio.current?.play();
    setTimeout(() => setShowExplanation(true), 500);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setShowAnswer(false);
      setShowHint(false);
      setShowExplanation(false);
    } else {
      handleFinish();
    }
  };

  // === Update User Score on Finish ===
  const handleFinish = async () => {
    try {
      if (!email) return;
      await fetch(`${API_URL}/usergame`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, level1Score: points, userLevel: 2 }),
      });
      console.log("✅ Level 1 score updated successfully!");
    } catch (err) {
      console.error("Error updating Level 1 score:", err);
    }
    setStage("result");
    backgroundAudio.current?.pause();
    celebrationAudio.current?.play();
  };

  // === Preloader Effect ===
  useEffect(() => {
    const timer = setTimeout(() => {
      const preloader = document.getElementById("preloader");
      if (preloader) preloader.style.display = "none";
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // === Loading State ===
  if (loading) {
    return (
      <div className="pretest-wrapper">
        <h2 style={{ color: "#facc15" }}>Loading Level 1 questions...</h2>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="pretest-wrapper">
        <h2 style={{ color: "#facc15" }}>No questions found for Level 1.</h2>
      </div>
    );
  }

  // === UI ===
  return (
    <div className="pretest-wrapper">
      {/* === Audio === */}
      <audio
        ref={countdownAudio}
        src="/assets/audio/countdown.mp3"
        preload="auto"
      />
      <audio
        ref={correctAudio}
        src="/assets/audio/correct.mp3"
        preload="auto"
      />
      <audio ref={wrongAudio} src="/assets/audio/wrong.mp3" preload="auto" />
      <audio
        ref={backgroundAudio}
        src="/assets/audio/game-loop.mp3"
        preload="auto"
      />
      <audio
        ref={celebrationAudio}
        src="/assets/audio/celebration.mp3"
        preload="auto"
      />

      {/* === INTRO === */}
      {stage === "intro" && (
        <div className="intro-screen">
          <div className="intro-graphics">
            <svg
              className="floating-svg"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 64 64"
              width="150"
              height="150"
              fill="none"
            >
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#facc15" />
                  <stop offset="100%" stopColor="#ffda47" />
                </linearGradient>
              </defs>
              <path
                fill="url(#grad)"
                d="M32 4c-4.4 0-8 3.6-8 8v6h16v-6c0-4.4-3.6-8-8-8zM10 12a2 2 0 0 0-2 2v8c0 7.7 5.6 14 13 15.6V54h22V37.6c7.4-1.6 13-7.9 13-15.6v-8a2 2 0 0 0-2-2h-8v4h6v6c0 6.1-4.4 11.3-10.3 12.6L40 35v15H24V35l-1.7-.4C16.4 33.3 12 28.1 12 22v-6h6v-4h-8z"
              />
              <circle cx="32" cy="58" r="3" fill="#facc15" />
            </svg>
          </div>

          <h1 className="intro-title bounce-text">
            {userInfo
              ? `Welcome back, ${userInfo.firstName}!`
              : "Ready for Level 1?"}
          </h1>
          <p className="intro-subtitle">Let's test your knowledge ⚡</p>

          <button
            className="start-btn pulse-btn"
            onClick={() => setStage("countdown")}
          >
            Start Level 1
          </button>
        </div>
      )}

      {/* === COUNTDOWN === */}
      {stage === "countdown" && (
        <div className="countdown-screen">
          <div
            className={`countdown-number ${count === "Go!" ? "go-text" : ""}`}
          >
            {count}
          </div>
        </div>
      )}

      {/* === QUESTION === */}
      {stage === "question" && current && (
        <div className="quiz-container fade-in">
          <div className="score-bar">
            Points: <span className="score">{points}</span>/{totalQuestions}
          </div>

          <div className="text-question">
            <div className="hint-header">
              <h2 className="question-title">{current.question}</h2>
              <button
                className="hint-btn"
                onClick={() => setShowHint(!showHint)}
                title="Show Hint"
              >
                💡
              </button>
            </div>

            {showHint && (
              <div className="hint-bubble fade-in">
                <p>{current.hint}</p>
              </div>
            )}

            <div className="options-grid">
              {current.choices.map((choice, index) => {
                const isCorrect = index === current.answer;
                const isSelected = selected === index;
                if (showAnswer && !isCorrect && !isSelected) return null;

                let cls = "option-btn";
                if (showAnswer) {
                  if (isSelected && isCorrect) cls += " correct";
                  else if (isSelected && !isCorrect) cls += " wrong";
                  else if (!isSelected && isCorrect)
                    cls += " correct highlight";
                } else if (isSelected) cls += " selected";

                return (
                  <button
                    key={index}
                    className={cls}
                    onClick={() => !showAnswer && setSelected(index)}
                    disabled={showAnswer}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>

            {!showAnswer && (
              <button
                className={`next-btn ${selected === null ? "disabled" : ""}`}
                onClick={handleCheck}
              >
                Check Answer
              </button>
            )}

            {showAnswer && showExplanation && (
              <div
                className={`explanation-card ${
                  selected === current.answer
                    ? "correct-explanation"
                    : "wrong-explanation"
                } fade-in`}
              >
                <div className="explanation-header">
                  {selected === current.answer ? (
                    <>
                      <span className="icon">✅</span>
                      <h3>Great job! You got it right.</h3>
                    </>
                  ) : (
                    <>
                      <span className="icon">❌</span>
                      <h3>The correct answer was:</h3>
                    </>
                  )}
                </div>
                <p className="explanation-text">{current.explanation}</p>
                <button className="next-btn" onClick={handleNext}>
                  {currentIndex === totalQuestions - 1 ? "Finish" : "Next"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* === RESULT === */}
      {stage === "result" && (
        <div className="result-popup">
          <div className="result-card">
            <h2>🎉 Level 1 Completed!</h2>
            <p>
              You scored <strong>{points}</strong> /{" "}
              <strong>{totalQuestions}</strong>
            </p>
            <button
              className="continue-btn"
              onClick={() =>
                router.push(`/user?email=${encodeURIComponent(email || "")}`)
              }
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
