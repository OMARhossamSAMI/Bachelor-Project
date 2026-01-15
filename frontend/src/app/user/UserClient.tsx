"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Script from "next/script";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface User {
  firstName: string;
  lastName: string;
  email: string;
}

interface UserInfo {
  email: string;
  age?: number;
  nationality?: string;
  gender?: string;
  germanLevel?: string;
  interests?: string[];
  goal?: string;
  favoriteCuisine?: string;
  regionPreference?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UserGame {
  email: string;
  pretestScore: number;
  level1Score: number;
  level2Score: number;
  level3Score: number;
  level4Score: number;
  level5Score: number;
  posttestScore: number; // ✅ NEW: post-test score
  totalPoints: number;
  badges: number;
  userLevel: number;

  createdAt?: string;
  updatedAt?: string;
}

import "./page.css";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (() => {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  })();
export default function UserClient() {
  const params = useSearchParams();
  const email = params.get("email");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(0); // first open

  // === NEW STATES ===
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userGame, setUserGame] = useState<UserGame | null>(null);

  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizReady, setQuizReady] = useState(false);
  const [hasLevel1Quiz, setHasLevel1Quiz] = useState(false);

  // 🔹 Level 2 generator
  const [loadingLevel2, setLoadingLevel2] = useState(false);
  const [level2Ready, setLevel2Ready] = useState(false);
  const [hasLevel2Quiz, setHasLevel2Quiz] = useState(false);

  // 🔹 Level 3 generator
  const [loadingLevel3, setLoadingLevel3] = useState(false);
  const [level3Ready, setLevel3Ready] = useState(false);
  const [hasLevel3Data, setHasLevel3Data] = useState(false);

  // === Check if user already has AI Level 1 quiz ===
  useEffect(() => {
    if (!email) return;

    const checkExistingQuiz = async () => {
      try {
        const res = await fetch(
          `${API_URL}/ai/level1/${encodeURIComponent(email)}/get`
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.questions) {
            setQuizReady(true);
            setHasLevel1Quiz(true);
          }
        }
      } catch (err) {
        console.error("Error checking Level 1 quiz:", err);
      }
    };

    checkExistingQuiz();
  }, [email]);

  // 🔹 Check if user already has Level 2 generated
  useEffect(() => {
    if (!email) return;

    const checkExistingLevel2 = async () => {
      try {
        const res = await fetch(
          `${API_URL}/ai/level2/${encodeURIComponent(email)}/get`
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.cards && Array.isArray(data.cards)) {
            setLevel2Ready(true);
            setHasLevel2Quiz(true);
          }
        }
      } catch (err) {
        console.error("Error checking Level 2 data:", err);
      }
    };

    checkExistingLevel2();
  }, [email]);

  // 🔹 Check if Level 3 already exists
  useEffect(() => {
    if (!email) return;

    const checkExistingLevel3 = async () => {
      try {
        const res = await fetch(
          `${API_URL}/ai/level3/${encodeURIComponent(email)}/get`
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.dishes && Array.isArray(data.dishes)) {
            setLevel3Ready(true);
            setHasLevel3Data(true);
          }
        }
      } catch (err) {
        console.error("Error checking Level 3 data:", err);
      }
    };

    checkExistingLevel3();
  }, [email]);

  // === Preloader effect ===
  useEffect(() => {
    const timer = setTimeout(() => {
      const preloader = document.getElementById("preloader");
      if (preloader) preloader.style.display = "none";
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // === Sticky header effect ===
  useEffect(() => {
    const handleScroll = () => {
      const header = document.getElementById("header");
      if (window.scrollY > 50) header?.classList.add("scrolled");
      else header?.classList.remove("scrolled");
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // === Fetch user info when email param exists ===
  useEffect(() => {
    if (!email) return;
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${API_URL}/users/${encodeURIComponent(email)}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load user");
        setUser(data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchUser();
  }, [email]);

  // === Fetch UserInfo (from /userinfo/:email) ===
  useEffect(() => {
    if (!email) return;
    const fetchUserInfo = async () => {
      try {
        const res = await fetch(
          `${API_URL}/userinfo/${encodeURIComponent(email)}`
        );
        if (res.status === 404) {
          setUserInfo(null); // user hasn't filled the form yet
          return;
        }
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Failed to load user info");
        setUserInfo(data);
      } catch (err) {
        console.error("Error fetching user info:", err);
        setUserInfo(null);
      }
    };
    fetchUserInfo();
  }, [email]);
  const journeyCompleted =
    !!userGame &&
    userGame.pretestScore > 0 &&
    userGame.level1Score > 0 &&
    userGame.level2Score > 0 &&
    userGame.level3Score > 0 &&
    userGame.posttestScore > 0;

  // === Fetch UserGame only after UserInfo exists ===
  useEffect(() => {
    if (!userInfo || !email) return;
    const fetchUserGame = async () => {
      try {
        const res = await fetch(
          `${API_URL}/usergame/${encodeURIComponent(email)}`
        );
        if (res.status === 404) {
          setUserGame(null); // no progress record yet
          return;
        }
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Failed to load game data");
        setUserGame(data);
      } catch (err) {
        console.error("Error fetching user game:", err);
        setUserGame(null);
      }
    };
    fetchUserGame();
  }, [userInfo, email]);

  // === Play mission start sound ===
  const playMissionStartSound = () => {
    const sfx = new Audio("assets/audio/begin_level.mp3");
    sfx.volume = 0.8; // not too loud
    sfx.play();
  };

  // === Machine Gear Sound ===
  const playMachineSound = () => {
    const sfx = new Audio("/assets/audio/machine_gear.mp3");
    sfx.volume = 0.8;
    sfx.play();
  };

  const handleGenerateQuiz = async () => {
    if (!email) return;
    setLoadingQuiz(true);

    try {
      // 1️⃣ Check if Level 1 already exists
      const check = await fetch(
        `${API_URL}/ai/level1/${encodeURIComponent(email)}/get`
      );
      if (check.ok) {
        const data = await check.json();
        if (data && data.questions) {
          setQuizReady(true);
          setHasLevel1Quiz(true);
          setLoadingQuiz(false);
          return;
        }
      }

      // 2️⃣ Otherwise, generate a new one
      const res = await fetch(
        `${API_URL}/ai/level1/${encodeURIComponent(email)}`
      );
      if (!res.ok) throw new Error("Failed to generate Level 1 quiz");

      const data = await res.json();
      console.log("Generated Level 1:", data);

      setQuizReady(true);
      setHasLevel1Quiz(true);
    } catch (err) {
      console.error("Error creating Level 1 quiz:", err);
      alert("❌ Error generating Level 1 quiz. Please try again.");
    } finally {
      setLoadingQuiz(false);
    }
  };

  // 🔹 Level 2 generator (Regional Quest cards)
  const handleGenerateLevel2 = async () => {
    if (!email) return;
    setLoadingLevel2(true);

    try {
      // 1️⃣ Check if Level 2 already exists
      const check = await fetch(
        `${API_URL}/ai/level2/${encodeURIComponent(email)}/get`
      );
      if (check.ok) {
        const data = await check.json();
        if (data && data.cards && Array.isArray(data.cards)) {
          setLevel2Ready(true);
          setHasLevel2Quiz(true);
          setLoadingLevel2(false);
          return;
        }
      }

      // 2️⃣ Otherwise, generate new Level 2 cards
      const res = await fetch(
        `${API_URL}/ai/level2/${encodeURIComponent(email)}`
      );
      if (!res.ok) throw new Error("Failed to generate Level 2");

      const data = await res.json();
      console.log("Generated Level 2:", data);

      setLevel2Ready(true);
      setHasLevel2Quiz(true);
    } catch (err) {
      console.error("Error creating Level 2:", err);
      alert("❌ Error generating Level 2. Please try again.");
    } finally {
      setLoadingLevel2(false);
    }
  };

  // 🔹 Level 3 generator (Market Adventure)
  const handleGenerateLevel3 = async () => {
    if (!email) return;
    setLoadingLevel3(true);

    try {
      // 1️⃣ Check if Level 3 already exists
      const check = await fetch(
        `${API_URL}/ai/level3/${encodeURIComponent(email)}/get`
      );
      if (check.ok) {
        const data = await check.json();
        if (data && data.dishes) {
          setLevel3Ready(true);
          setHasLevel3Data(true);
          setLoadingLevel3(false);
          return;
        }
      }

      // 2️⃣ Otherwise generate new Level 3 content
      const res = await fetch(
        `${API_URL}/ai/level3/${encodeURIComponent(email)}`
      );
      if (!res.ok) throw new Error("Failed to generate Level 3");

      const data = await res.json();
      console.log("Generated Level 3:", data);

      setLevel3Ready(true);
      setHasLevel3Data(true);
    } catch (err) {
      console.error("Error creating Level 3:", err);
      alert("❌ Error generating Level 3. Please try again.");
    } finally {
      setLoadingLevel3(false);
    }
  };

  const goTo = (path: string) => {
    playMissionStartSound();
    setTimeout(() => {
      window.location.href = `${path}?email=${encodeURIComponent(email || "")}`;
    }, 900);
  };

  return (
    <>
      <header
        id="header"
        className="header d-flex align-items-center custom-sticky"
      >
        <div className="container-fluid position-relative d-flex align-items-center justify-content-between">
          <a className="logo d-flex align-items-center me-auto me-xl-0">
            {/* Add an image logo (optional) */}
            <img
              src="assets/img/DeutschFlag.png"
              alt="FoodCulture Logo"
              style={{ height: 40, marginRight: 10 }}
            />
            {/* Text logo with emojis */}
            <h1
              className="sitename"
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              Food<span style={{ color: "#ff7b00" }}>Culture 🍽️</span>
            </h1>
          </a>
          <nav id="navmenu" className="navmenu">
            <ul>
              <li>
                <a href="#" className="active">
                  Home
                </a>
              </li>
              <li>
                <a href="#missions">Missions</a>
              </li>
              <li>
                <a href="#faq">FAQ</a>
              </li>
            </ul>
            <i className="mobile-nav-toggle d-xl-none bi bi-list" />
          </nav>
          {/* Music Toggle Button */}
          <button
            id="music-toggle"
            style={{
              backgroundColor: "#ff7b00",
              color: "#fff",
              border: "none",
              padding: "10px 24px",
              borderRadius: "6px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "0.3s",
            }}
            onClick={() => {
              const audio = document.getElementById(
                "bgMusic"
              ) as HTMLAudioElement;
              if (!audio) return;

              if (audio.paused) {
                audio.play();
                (
                  document.getElementById("music-toggle") as HTMLButtonElement
                ).innerText = "🔊 Music On";
              } else {
                audio.pause();
                (
                  document.getElementById("music-toggle") as HTMLButtonElement
                ).innerText = "🔇 Music Off";
              }
            }}
            onMouseOver={(e) =>
              ((e.target as HTMLButtonElement).style.backgroundColor =
                "#ff9c33")
            }
            onMouseOut={(e) =>
              ((e.target as HTMLButtonElement).style.backgroundColor =
                "#ff7b00")
            }
          >
            🎵 Play Music
          </button>

          {/* Hidden audio element */}
          <audio id="bgMusic" src="assets/audio/background_song.mp3" loop />
        </div>
      </header>
      <main className="main">
        {/* === Welcome / Call To Action Section === */}
        <section id="call-to-action" className="call-to-action section">
          <div className="container" data-aos="zoom-out">
            <div className="row g-5 align-items-center">
              {/* Text Side */}
              <div className="col-lg-8 col-md-6 content d-flex flex-column justify-content-center order-last order-md-first">
                {error ? (
                  <h3 style={{ color: "red" }}>{error}</h3>
                ) : !userInfo ? (
                  // --- CASE 1: No user info yet ---
                  <>
                    <h2
                      style={{
                        fontWeight: 800,
                        color: "#fff",
                        fontSize: "2.3rem",
                        marginBottom: "15px",
                      }}
                    >
                      Welcome Home,{" "}
                      <span
                        style={{
                          color: "#ff7b00",
                          fontWeight: 800,
                          textTransform: "capitalize",
                        }}
                      >
                        {user ? `${user.firstName}` : "Explorer"}
                      </span>
                      !
                    </h2>

                    <p
                      style={{
                        color: "#ccc",
                        fontSize: "1.05rem",
                        lineHeight: "1.7",
                        marginBottom: "12px",
                      }}
                    >
                      Before you begin your personalized German food journey,{" "}
                      <strong style={{ color: "#ffb347" }}>
                        {user ? `${user.firstName} ${user.lastName}` : "you"}
                      </strong>{" "}
                      need to complete your quick setup 🍽️
                    </p>

                    <p
                      style={{
                        color: "#ccc",
                        fontSize: "1.05rem",
                        lineHeight: "1.7",
                      }}
                    >
                      Let’s set up your preferences so we can tailor your
                      learning experience — from regional dishes to cultural
                      missions!
                    </p>

                    <a
                      className="cta-btn align-self-start mt-3"
                      href={`/form?email=${encodeURIComponent(email || "")}`}
                      style={{
                        backgroundColor: "#ff7b00",
                        border: "none",
                        color: "#fff",
                        padding: "12px 32px",
                        borderRadius: "6px",
                        fontWeight: 600,
                        fontSize: "1rem",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                        transition: "0.3s",
                        textDecoration: "none",
                      }}
                      onMouseOver={(e) =>
                        ((e.target as HTMLAnchorElement).style.backgroundColor =
                          "#ff9c33")
                      }
                      onMouseOut={(e) =>
                        ((e.target as HTMLAnchorElement).style.backgroundColor =
                          "#ff7b00")
                      }
                    >
                      Complete Setup ⚙️
                    </a>
                  </>
                ) : (
                  // --- CASE 2: User info exists → show gamified status ---
                  <>
                    <h2
                      style={{
                        fontWeight: 800,
                        color: "#fff",
                        fontSize: "2.3rem",
                        marginBottom: "10px",
                      }}
                    >
                      Welcome back,{" "}
                      <span
                        style={{
                          color: "#ff7b00",
                          fontWeight: 800,
                          textTransform: "capitalize",
                        }}
                      >
                        {user?.firstName || "Explorer"}
                      </span>
                      !
                    </h2>

                    <p style={{ color: "#ccc", fontSize: "1.05rem" }}>
                      You’re progressing through your German food journey 🚀
                    </p>

                    {/* --- Dynamic display of gamified data --- */}
                    {userGame ? (
                      <div
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          borderRadius: "10px",
                          padding: "16px 24px",
                          marginTop: "12px",
                          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                          color: "#fff",
                        }}
                      >
                        <h4
                          style={{
                            color: "#ffb347",
                            fontWeight: 700,
                            marginBottom: "10px",
                          }}
                        >
                          🌟 Your Progress Overview
                        </h4>

                        {/* 🎓 Journey completed message if post-test done */}
                        {userGame.posttestScore > 0 && (
                          <div
                            style={{
                              background:
                                "linear-gradient(135deg, #1f2937, #fbbf24)",
                              borderRadius: "12px",
                              padding: "12px 16px",
                              marginBottom: "12px",
                              color: "#111827",
                            }}
                          >
                            <strong style={{ fontSize: "1.05rem" }}>
                              🎓 Congratulations! You completed the full
                              FoodCulture journey.
                            </strong>
                            <p
                              style={{
                                margin: "6px 0 0",
                                fontSize: "0.95rem",
                                color: "#111827",
                              }}
                            >
                              You can now replay any level to improve your
                              scores or just enjoy the missions again.
                            </p>
                          </div>
                        )}

                        {/* --- PRE-TEST always shown if done --- */}
                        {userGame.pretestScore > 0 && (
                          <p>
                            🧠 Pre-Test Score:{" "}
                            <strong style={{ color: "#ff9c33" }}>
                              {userGame.pretestScore}
                            </strong>{" "}
                            points
                          </p>
                        )}

                        {/* --- POST-TEST --- */}
                        {userGame.posttestScore > 0 && (
                          <p>
                            📊 Post-Test Score:{" "}
                            <strong style={{ color: "#ff9c33" }}>
                              {userGame.posttestScore}
                            </strong>{" "}
                            points
                          </p>
                        )}

                        {/* --- LEVEL 1 --- */}
                        {userGame.level1Score > 0 && (
                          <p>
                            🔥 Level 1 Score:{" "}
                            <strong style={{ color: "#ff9c33" }}>
                              {userGame.level1Score}
                            </strong>{" "}
                            points
                          </p>
                        )}

                        {/* --- LEVEL 2 --- */}
                        {userGame.level2Score > 0 && (
                          <p>
                            🛒 Level 2 Score:{" "}
                            <strong style={{ color: "#ff9c33" }}>
                              {userGame.level2Score}
                            </strong>{" "}
                            points
                          </p>
                        )}

                        {/* --- LEVEL 3 --- */}
                        {userGame.level3Score > 0 && (
                          <p>
                            🍽️ Level 3 Score:{" "}
                            <strong style={{ color: "#ff9c33" }}>
                              {userGame.level3Score}
                            </strong>{" "}
                            points
                          </p>
                        )}

                        {/* --- LEVEL 4 --- */}
                        {userGame.level4Score > 0 && (
                          <p>
                            🗺️ Level 4 Score:{" "}
                            <strong style={{ color: "#ff9c33" }}>
                              {userGame.level4Score}
                            </strong>{" "}
                            points
                          </p>
                        )}

                        {/* --- LEVEL 5 --- */}
                        {userGame.level5Score > 0 && (
                          <p>
                            🏰 Level 5 Score:{" "}
                            <strong style={{ color: "#ff9c33" }}>
                              {userGame.level5Score}
                            </strong>{" "}
                            points
                          </p>
                        )}

                        {/* CONTINUE BUTTON */}
                        <div
                          style={{
                            marginTop: "16px",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <a
                            className="cta-btn"
                            href="#missions"
                            style={{
                              backgroundColor: "#ff7b00",
                              border: "none",
                              color: "#fff",
                              padding: "10px 28px",
                              borderRadius: "6px",
                              fontWeight: 600,
                              textDecoration: "none",
                              transition: "0.3s",
                            }}
                            onMouseOver={(e) =>
                              ((
                                e.target as HTMLAnchorElement
                              ).style.backgroundColor = "#ff9c33")
                            }
                            onMouseOut={(e) =>
                              ((
                                e.target as HTMLAnchorElement
                              ).style.backgroundColor = "#ff7b00")
                            }
                          >
                            Continue Missions 🎯
                          </a>
                        </div>
                      </div>
                    ) : (
                      <p style={{ color: "#bbb", marginTop: "10px" }}>
                        Loading your progress...
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Image Side */}
              <div className="col-lg-4 col-md-6 order-first order-md-last d-flex align-items-center">
                <div className="img text-center">
                  <img
                    src="assets/img/People_German_Food.jpg"
                    alt="Food culture setup"
                    className="img-fluid rounded shadow"
                    style={{
                      borderRadius: "16px",
                      maxHeight: "380px",
                      objectFit: "cover",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* === MISSIONS SECTION === */}
        <section id="missions" className="services section position-relative">
          {/* Section Title */}
          <div className="container section-title" data-aos="fade-up">
            <h2>🎯 Your Missions</h2>
            <p style={{ color: "#ccc" }}>
              Begin your learning adventure! Start with the{" "}
              <strong>Pre-Test (Level 0)</strong> to unlock all game levels and
              finish with your <strong>Post-Test</strong> to see how much you
              have learned 🇩🇪🍽️
            </p>
          </div>
          {/* ✅ Journey completion thank-you message */}
          {journeyCompleted && (
            <div
              className="journey-complete-banner"
              data-aos="fade-up"
              data-aos-delay={80}
            >
              <div className="journey-complete-badge">🎓 Journey Complete</div>

              <h4 className="journey-complete-title">
                Thank you{user?.firstName ? `, ${user.firstName}` : ""}!
              </h4>

              <p className="journey-complete-text">
                We truly appreciate you continuing the FoodCulture journey until
                the end. Your time, effort, and participation helped us improve
                the experience and supported the development of this project as
                part of my bachelor thesis.
              </p>

              <p className="journey-complete-text">
                We hope you enjoyed exploring German food culture through these
                missions — and you’re always welcome to replay any level to
                sharpen your skills.
              </p>

              <div className="journey-complete-signature">
                With gratitude ,<span className="sig-line">_Omar_Hossam_</span>
              </div>
            </div>
          )}

          {/* === CASE 1: No user info yet === */}
          {!userInfo && (
            <>
              {/* Mission cards remain visible behind overlay */}
              <div
                className="container"
                data-aos="fade-up"
                data-aos-delay={100}
                style={{
                  position: "relative",
                  zIndex: 1,
                  filter: "blur(2px) brightness(0.6)",
                  pointerEvents: "none",
                }}
              >
                <div className="row gy-5">
                  {[
                    {
                      title: "Pre-Test",
                      emoji: "🧠",
                      desc: "Assess your initial knowledge before the journey begins.",
                    },
                    {
                      title: "Warm-Up Level",
                      emoji: "🔥",
                      desc: "Start easy with quick multiple-choice questions to warm up your mind.",
                    },
                    {
                      title: "Regional Quest",
                      emoji: "🗺️",
                      desc: "Uncover regional specialties from across Germany.",
                    },
                    {
                      title: "Build Your Dish",
                      emoji: "🥣",
                      desc: "Place each ingredient into the right dish level and learn what it’s used for.",
                    },
                    {
                      title: "Post-Test",
                      emoji: "🎓",
                      desc: "Take the final test and compare your learning with the pre-test.",
                    },
                  ].map((mission, i) => (
                    <div
                      key={i}
                      className="col-xl-4 col-md-6"
                      data-aos="zoom-in"
                      data-aos-delay={200 + i * 100}
                    >
                      <div className="service-item position-relative">
                        <div className="img position-relative">
                          <img
                            src={`assets/img/level${i % 6}.jpg`}
                            className="img-fluid"
                            alt={mission.title}
                            style={{
                              width: "100%",
                              height: "220px",
                              objectFit: "cover",
                              borderTopLeftRadius: "8px",
                              borderTopRightRadius: "8px",
                            }}
                          />
                          <div
                            className="card-lock"
                            style={{
                              position: "absolute",
                              top: "12px",
                              right: "12px",
                              background: "rgba(0,0,0,0.6)",
                              borderRadius: "50%",
                              width: "36px",
                              height: "36px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#ff7b00",
                              fontSize: "1.1rem",
                            }}
                          >
                            🔒
                          </div>
                        </div>
                        <div className="details position-relative text-center">
                          <div
                            className="icon"
                            style={{ fontSize: "2rem", color: "#ff7b00" }}
                          >
                            {mission.emoji}
                          </div>
                          <h3 style={{ color: "#ffb347", fontWeight: 700 }}>
                            {mission.title}
                          </h3>
                          <p style={{ color: "#ccc" }}>{mission.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overlay message stays centered above */}
              <div
                className="missions-overlay"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(10, 20, 40, 0.75)",
                  zIndex: 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  textAlign: "center",
                  borderRadius: "8px",
                }}
              >
                <i
                  className="bi bi-lock-fill"
                  style={{
                    fontSize: "3rem",
                    color: "#ff7b00",
                    marginBottom: "10px",
                  }}
                ></i>
                <h4 style={{ fontWeight: 600, marginBottom: "10px" }}>
                  Access Locked
                </h4>
                <p style={{ maxWidth: "420px", color: "#ccc" }}>
                  Please complete your profile form first to unlock your
                  personalized learning missions.
                </p>
                <button
                  style={{
                    background: "#ff7b00",
                    color: "#fff",
                    border: "none",
                    padding: "12px 36px",
                    borderRadius: "6px",
                    fontWeight: "600",
                    fontSize: "1rem",
                    marginTop: "12px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                    transition: "0.3s",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    window.location.href = `/form?email=${encodeURIComponent(
                      email || ""
                    )}`;
                  }}
                  onMouseOver={(e) =>
                    ((e.target as HTMLButtonElement).style.background =
                      "#ff9c33")
                  }
                  onMouseOut={(e) =>
                    ((e.target as HTMLButtonElement).style.background =
                      "#ff7b00")
                  }
                >
                  📝 Fill Your Form
                </button>
              </div>
            </>
          )}

          {/* === CASE 2: userInfo exists === */}
          {userInfo && (
            <div
              className="container"
              data-aos="fade-up"
              data-aos-delay={100}
              style={{ position: "relative", zIndex: 2 }}
            >
              <div className="row gy-5">
                {[
                  {
                    title: "Pre-Test",
                    emoji: "🧠",
                    desc: "Assess your initial knowledge before the journey begins.",
                    key: "pretestScore",
                  },
                  {
                    title: "Warm-Up Level",
                    emoji: "🔥",
                    desc: "Start easy with quick multiple-choice questions to warm up your mind.",
                    key: "level1Score",
                  },
                  {
                    title: "Regional Quest",
                    emoji: "🗺️",
                    desc: "Uncover regional specialties from across Germany.",
                    key: "level2Score",
                  },
                  {
                    title: "Build Your Dish",
                    emoji: "🥣",
                    desc: "Place each ingredient into the right dish level and learn what it’s used for.",
                    key: "level3Score",
                  },
                  {
                    title: "Post-Test",
                    emoji: "🎓",
                    desc: "Take the final test and compare your learning with the pre-test.",
                    key: "posttestScore",
                  },
                ].map((mission, i) => {
                  // ✅ Determine if this level is unlocked
                  const previousKey =
                    i === 0
                      ? null
                      : [
                          "pretestScore",
                          "level1Score",
                          "level2Score",
                          "level3Score",
                        ][i - 1];

                  const completed =
                    !!userGame && (userGame as any)?.[mission.key] > 0;

                  const unlocked =
                    i === 0
                      ? !userGame || userGame.pretestScore === 0
                      : !!userGame && !!previousKey
                      ? (userGame as any)[previousKey] > 0
                      : false;

                  // ✅ Block access if Pre-Test / Post-Test already completed
                  const isPreOrPost =
                    mission.title === "Pre-Test" ||
                    mission.title === "Post-Test";
                  const canEnter = unlocked && !(isPreOrPost && completed);

                  return (
                    <div
                      key={i}
                      className="col-xl-4 col-md-6"
                      data-aos="zoom-in"
                      data-aos-delay={200 + i * 100}
                    >
                      <div
                        className="service-item position-relative"
                        style={{
                          opacity: canEnter || completed ? 1 : 0.5,
                          cursor: canEnter ? "pointer" : "not-allowed",
                          transition: "0.3s",
                          border:
                            completed && (userGame as any)[mission.key] > 0
                              ? "2px solid #28a745"
                              : "none",
                          boxShadow:
                            completed && (userGame as any)[mission.key] > 0
                              ? "0 0 15px rgba(40,167,69,0.4)"
                              : "0 4px 20px rgba(0,0,0,0.2)",
                        }}
                        onClick={() => {
                          if (!canEnter) return;

                          if (mission.title === "Warm-Up Level")
                            goTo("/level1");
                          else if (mission.title === "Regional Quest")
                            goTo("/level2");
                          else if (mission.title === "Build Your Dish")
                            goTo("/level3");
                          else if (mission.title === "Post-Test")
                            goTo("/post-test");
                          else if (mission.title === "Pre-Test")
                            goTo("/pre-test"); // ✅ add this explicitly
                          else {
                            const formattedTitle = mission.title
                              .replace(/\s+/g, "-")
                              .replace(/[^a-zA-Z0-9-]/g, "");
                            goTo(`/${formattedTitle}`);
                          }
                        }}
                      >
                        <div className="img position-relative">
                          <img
                            src={`assets/img/level${i % 6}.jpg`}
                            className="img-fluid"
                            alt={mission.title}
                            style={{
                              width: "100%",
                              height: "220px",
                              objectFit: "cover",
                              borderTopLeftRadius: "8px",
                              borderTopRightRadius: "8px",
                            }}
                          />
                        </div>
                        <div className="details position-relative text-center">
                          <div
                            className="icon"
                            style={{ fontSize: "2rem", color: "#ff7b00" }}
                          >
                            {mission.emoji}
                          </div>
                          <h3 style={{ color: "#ffb347", fontWeight: 700 }}>
                            {mission.title}
                          </h3>
                          {/* Mission description */}
                          <p style={{ color: "#ccc", marginBottom: "8px" }}>
                            {mission.desc}
                          </p>

                          {/* Warm-Up Level generator */}
                          {mission.title === "Warm-Up Level" &&
                            (userGame?.pretestScore ?? 0) > 0 &&
                            (userGame?.level1Score ?? 0) === 0 && (
                              <div className="machine-overlay">
                                {quizReady ? (
                                  <div className="machine-ready">
                                    <h4>
                                      ✅ Your personalized level is ready!
                                    </h4>
                                    <p>
                                      This mission was generated just for you ⚙️
                                    </p>
                                    <button
                                      className="machine-start-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        goTo("/level1");
                                      }}
                                    >
                                      Start Now 🚀
                                    </button>
                                  </div>
                                ) : (
                                  <div className="machine-center">
                                    <div
                                      className={`machine-btn ${
                                        loadingQuiz ? "active" : ""
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        playMachineSound();
                                        if (!loadingQuiz) {
                                          setLoadingQuiz(true);
                                          handleGenerateQuiz().finally(() =>
                                            setLoadingQuiz(false)
                                          );
                                        }
                                      }}
                                    >
                                      <i className="bi bi-gear-fill" />
                                    </div>
                                    <p className="machine-text">
                                      {loadingQuiz
                                        ? "Generating your personalized level..."
                                        : "Power up the machine to generate your level"}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          {isPreOrPost && completed && (
                            <div
                              style={{
                                marginTop: 8,
                                color: "#28a745",
                                fontWeight: 700,
                              }}
                            >
                              ✅ Completed (locked)
                            </div>
                          )}

                          {/* Regional Quest generator */}
                          {mission.title === "Regional Quest" &&
                            (userGame?.level1Score ?? 0) > 0 &&
                            (userGame?.level2Score ?? 0) === 0 && (
                              <div className="machine-overlay">
                                {level2Ready ? (
                                  <div className="machine-ready">
                                    <h4>✅ Your regional quest is ready!</h4>
                                    <p>
                                      We generated a personalized food-sorting
                                      level based on your profile ⚙️
                                    </p>
                                    <button
                                      className="machine-start-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        goTo("/level2");
                                      }}
                                    >
                                      Start Level 2 🚀
                                    </button>
                                  </div>
                                ) : (
                                  <div className="machine-center">
                                    <div
                                      className={`machine-btn ${
                                        loadingLevel2 ? "active" : ""
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        playMachineSound();
                                        if (!loadingLevel2) {
                                          handleGenerateLevel2();
                                        }
                                      }}
                                    >
                                      <i className="bi bi-gear-fill" />
                                    </div>
                                    <p className="machine-text">
                                      {loadingLevel2
                                        ? "Generating your regional quest..."
                                        : "Power up the machine to generate your regional quest"}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                          {/* Market Adventure generator */}
                          {mission.title === "Build Your Dish" &&
                            (userGame?.level2Score ?? 0) > 0 &&
                            (userGame?.level3Score ?? 0) === 0 && (
                              <div className="machine-overlay">
                                {level3Ready ? (
                                  <div className="machine-ready">
                                    <h4>✅ Your Dishes is ready to be made!</h4>
                                    <p>
                                      We created a personalized Ingredients
                                      mission for you ⚙️
                                    </p>
                                    <button
                                      className="machine-start-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        goTo("/level3");
                                      }}
                                    >
                                      Start Level 3 🚀
                                    </button>
                                  </div>
                                ) : (
                                  <div className="machine-center">
                                    <div
                                      className={`machine-btn ${
                                        loadingLevel3 ? "active" : ""
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        playMachineSound();
                                        if (!loadingLevel3)
                                          handleGenerateLevel3();
                                      }}
                                    >
                                      <i className="bi bi-gear-fill" />
                                    </div>
                                    <p className="machine-text">
                                      {loadingLevel3
                                        ? "Generating your Build your Dish Adventure..."
                                        : "Power up the machine to generate Level 3"}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                          {/* Post-Test – ready state (no generator) */}
                          {mission.title === "Post-Test" &&
                            (userGame?.level3Score ?? 0) > 0 &&
                            (userGame?.posttestScore ?? 0) === 0 && (
                              <div className="machine-overlay">
                                <div className="machine-ready">
                                  <h4>✅ Your Post-Test is ready!</h4>
                                  <p>
                                    Take this final test to see how much you
                                    improved compared to your pre-test.
                                  </p>
                                  <button
                                    className="machine-start-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      goTo("/post-test");
                                    }}
                                  >
                                    Start Post-Test 🎓
                                  </button>
                                </div>
                              </div>
                            )}

                          {/* Show current score if available */}
                          {userGame && (userGame as any)[mission.key] > 0 && (
                            <div
                              style={{
                                marginTop: "4px",
                                color: "#ffb347",
                                fontWeight: 600,
                                fontSize: "0.95rem",
                              }}
                            >
                              Score: {(userGame as any)[mission.key]} pts
                            </div>
                          )}

                          {/* Show Finished badge */}
                          {/* Completed Action Bar */}
                          {userGame &&
                            (userGame as any)[mission.key] > 0 &&
                            !["Pre-Test", "Post-Test"].includes(
                              mission.title
                            ) && (
                              <div className="mission-complete-bar">
                                <div className="mission-complete-badge">
                                  <span className="dot" />
                                  Completed
                                </div>

                                <button
                                  className="mission-replay-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    playMissionStartSound();

                                    setTimeout(() => {
                                      if (mission.title === "Warm-Up Level") {
                                        window.location.href = `/level1?email=${encodeURIComponent(
                                          email || ""
                                        )}`;
                                      } else if (
                                        mission.title === "Regional Quest"
                                      ) {
                                        window.location.href = `/level2?email=${encodeURIComponent(
                                          email || ""
                                        )}`;
                                      } else if (
                                        mission.title === "Build Your Dish"
                                      ) {
                                        window.location.href = `/level3?email=${encodeURIComponent(
                                          email || ""
                                        )}`;
                                      }
                                    }, 500);
                                  }}
                                >
                                  🔁 Replay
                                </button>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* /Missions Section */}

        {/* Faq Section */}
        <section id="faq" className="faq section">
          <div className="container-fluid">
            <div className="row gy-4">
              <div className="col-lg-7 d-flex flex-column justify-content-center order-2 order-lg-1">
                <div
                  className="content px-xl-5"
                  data-aos="fade-up"
                  data-aos-delay={100}
                >
                  <h3>
                    <span>Frequently Asked </span>
                    <strong>Questions</strong>
                  </h3>
                  <p>
                    Find clear answers to the most common questions new users
                    ask about our platform — from how it works to how you can
                    get started and make the most out of it.
                  </p>
                </div>
                <div
                  className="faq-container px-xl-5"
                  data-aos="fade-up"
                  data-aos-delay={200}
                >
                  {[
                    {
                      q: "What is FoodCulture and why was it created?",
                      a: "FoodCulture is an interactive learning platform that helps users explore German food culture through gamified missions and quizzes. It was created as part of a bachelor thesis project to study how gamification and AI-based personalization can improve cultural learning experiences.",
                    },
                    {
                      q: "Who developed this project?",
                      a: "FoodCulture was designed and developed by Omar Hossam, a Computer Science student specializing in Data Science and Software Engineering. The project combines academic research with real-world web and AI technologies.",
                    },
                    {
                      q: "How does personalization work in FoodCulture?",
                      a: "Personalization is based on the information you provide during the setup process, such as your preferences, interests, and learning goals. The platform uses this data to generate customized quizzes and missions, making each learning journey unique.",
                    },
                    {
                      q: "What kind of missions and activities can I play?",
                      a: "The platform includes a pre-test, multiple interactive learning levels, regional food challenges, and a final post-test. Each mission builds on the previous one to help you gradually improve your understanding of German food culture.",
                    },
                    {
                      q: "What technologies were used to build the platform?",
                      a: "FoodCulture was built using modern technologies including Next.js for the frontend, NestJS for the backend, MongoDB for data storage, and AI tools to generate personalized learning content dynamically.",
                    },
                    {
                      q: "Is my data safe and is the platform free to use?",
                      a: "Yes. The platform is completely free and all user data is handled securely. Personal information is used only to personalize the learning experience and support academic research purposes.",
                    },
                  ].map((item, index) => {
                    const isActive = activeFaq === index;

                    return (
                      <div
                        className={`faq-item ${isActive ? "faq-active" : ""}`}
                      >
                        <div
                          className="faq-header"
                          onClick={() => setActiveFaq(isActive ? null : index)}
                        >
                          <i className="faq-icon bi bi-question-circle" />
                          <h3>{item.q}</h3>
                          <i
                            className={`faq-toggle bi ${
                              isActive ? "bi-chevron-down" : "bi-chevron-right"
                            }`}
                          />
                        </div>

                        <div
                          className={`faq-content ${isActive ? "open" : ""}`}
                        >
                          <p>{item.a}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="col-lg-5 order-1 order-lg-2">
                <img
                  src="assets/img/faq.jpg"
                  className="img-fluid"
                  alt=""
                  data-aos="zoom-in"
                  data-aos-delay={100}
                />
              </div>
            </div>
          </div>
        </section>
        {/* /Faq Section */}
      </main>

      {/* Scroll Top */}
      <a
        href="#"
        id="scroll-top"
        className="scroll-top d-flex align-items-center justify-content-center"
      >
        <i className="bi bi-arrow-up-short" />
      </a>
    </>
  );
}
