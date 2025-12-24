"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import "./page.css";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (() => {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  })();
const FrontEndURL =
  process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3001";

interface User {
  firstName: string;
  lastName: string;
  email: string;
}

// === Types for questions ===
type Difficulty = "easy" | "medium" | "hard";

type QuestionDomain =
  | "iconic_dishes"
  | "ingredients"
  | "street_food"
  | "regional_diversity"
  | "eating_habits"
  | "festival_culture"
  | "specialty_product";

// small helper to render difficulty nicely
const formatDifficulty = (d: Difficulty) => {
  if (d === "easy") return "Easy";
  if (d === "medium") return "Medium";
  return "Hard";
};

// helper: get clean label from URL (domain only)
const getSourceLabel = (url: string) => {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return hostname;
  } catch {
    return "Source";
  }
};
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function PreTestClient() {
  const [stage, setStage] = useState<"intro" | "countdown" | "question">(
    "intro"
  );
  const [count, setCount] = useState<number | string>(3);
  const [points, setPoints] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [userLevel, setUserLevel] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");
  const [userInfo, setUserInfo] = useState<User | null>(null);

  // drag state for desktop HTML5 drag
  const [dragging, setDragging] = useState<string | null>(null);

  // touch-drag state for mobile
  const [touchSource, setTouchSource] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState<string | null>(null);
  // mobile drag visual (ghost)
  const [dragGhost, setDragGhost] = useState<{
    src: string;
    x: number;
    y: number;
  } | null>(null);

  // === Audio ===
  const countdownAudio = useRef<HTMLAudioElement | null>(null);
  const backgroundAudio = useRef<HTMLAudioElement | null>(null);
  const correctAudio = useRef<HTMLAudioElement | null>(null);
  const wrongAudio = useRef<HTMLAudioElement | null>(null);
  const celebrationAudio = useRef<HTMLAudioElement | null>(null);
  const [shuffledSources, setShuffledSources] = useState<any[]>([]);
  const [shuffledTargets, setShuffledTargets] = useState<any[]>([]);
  const [wrongQuestionIds, setWrongQuestionIds] = useState<number[]>([]);

  // === Question list with difficulty, explanation & sources ===
  const questions = [
    {
      id: 1,
      type: "image",
      question: "What is this dish typically served with?",
      image: "/assets/img/Pre-test/bratwurst.jpg",
      options: [
        "Bread roll & mustard",
        "Potato salad",
        "Sauerkraut & potatoes",
        "Bread with ketchup",
      ],
      answer: "Bread roll & mustard",
      difficulty: "easy" as Difficulty,
      domain: "iconic_dishes" as QuestionDomain,
      explanation:
        "Tests whether the learner knows the typical serving style of German bratwurst as a street snack (Brötchen + mustard).",
      sources: [
        "https://en.wikipedia.org/wiki/Bratwurst",
        "https://festwirt.de/en/bratwursts-and-its-different-varieties/",
      ],
    },

    {
      id: 2,
      type: "text",
      question: "What is the main ingredient in Sauerkraut?",
      options: ["White cabbage", "Red cabbage", "Cucumber", "Turnip"],
      answer: "White cabbage",
      difficulty: "medium" as Difficulty,
      domain: "ingredients" as QuestionDomain,
      explanation:
        "Checks basic knowledge that Sauerkraut is fermented cabbage, a core stereotype of German cuisine.",
      sources: [
        "https://en.wikipedia.org/wiki/Sauerkraut",
        "https://elavegan.com/how-to-make-sauerkraut/",
      ],
    },

    {
      id: 3,
      type: "image",
      question: "What is the name of this baked item?",
      image: "/assets/img/Pre-test/pretzel.jpg",
      options: ["Brezel", "Laugenstange", "Kaisersemmel", "Schrippe"],
      answer: "Brezel",

      difficulty: "easy" as Difficulty,
      domain: "iconic_dishes" as QuestionDomain,
      explanation:
        "Measures recognition of the Brezel/pretzel as an iconic German baked good, especially in Bavaria and at Oktoberfest.",
      sources: [
        "https://en.wikipedia.org/wiki/Pretzel",
        "https://germanfoods.org/german-food-facts/all-hail-the-humble-pretzel-an-oktoberfest-classic/",
      ],
    },

    {
      id: 4,
      type: "imageGrid",
      question: "Which is Germany’s most popular street food today?",
      imageOptions: [
        { src: "/assets/img/Pre-test/doner.jpg", label: "Döner Kebab" },
        { src: "/assets/img/Pre-test/Currywurst.jpg", label: "Currywurst" },
        {
          src: "/assets/img/Pre-test/bratwurst.jpg",
          label: "Bratwurst with roll",
        },
        {
          src: "/assets/img/Pre-test/Leberkäse sandwich.jpg",
          label: "Leberkäse sandwich",
        },
      ],
      answer: "Döner Kebab",

      difficulty: "medium" as Difficulty,
      domain: "street_food" as QuestionDomain,
      explanation:
        "Assesses awareness of modern German street food culture and migration influence, where Döner has overtaken Currywurst in popularity.",
      sources: [
        "https://adventure.com/gemany-fast-food-turkish-doner-kebab/",
        "https://www.aa.com.tr/en/culture/doner-kebab-is-more-popular-than-currywurst-in-germany-survey-finds/2774790",
      ],
    },

    {
      id: 5,
      type: "text",
      question: "How is Sauerbraten traditionally prepared?",
      options: [
        "Marinated & roasted",
        "Smoked & grilled",
        "Pan-fried",
        "Steamed",
      ],
      answer: "Marinated & roasted",
      difficulty: "medium" as Difficulty,
      domain: "iconic_dishes" as QuestionDomain,
      explanation:
        "Tests deeper knowledge that Sauerbraten is a marinated pot roast, usually beef, slowly roasted after several days in a vinegar/wine marinade.",
      sources: [
        "https://en.wikipedia.org/wiki/Sauerbraten",
        "https://daysofjay.com/2022/11/18/real-german-sauerbraten/",
      ],
    },

    {
      id: 6,
      type: "matching",
      question:
        "Match the correct potato salad style to its region (South vs North).",
      pairs: [
        {
          id: "south",
          label: "Southern Germany",
          image: "/assets/img/Pre-test/kartoffelsalat_south.png",
        },
        {
          id: "north",
          label: "Northern Germany",
          image: "/assets/img/Pre-test/kartoffelsalat_north.png",
        },
      ],
      difficulty: "hard" as Difficulty,
      domain: "regional_diversity" as QuestionDomain,
      explanation:
        "Captures knowledge of regional differences in everyday foods: northern Kartoffelsalat is mayo-based, southern versions use broth or vinegar-oil.",
      sources: [
        "https://www.tastingtable.com/926829/what-makes-german-potato-salad-different-from-american/",
        "https://www.reddit.com/r/germany/comments/7v1chy/is_german_potato_salad_a_traditional_dish/",
      ],
    },

    {
      id: 7,
      type: "text",
      question: "Traditionally, when do Germans eat their main warm meal?",
      options: ["Early morning", "Midday", "Late evening", "After midnight"],
      answer: "Midday",
      difficulty: "medium" as Difficulty,
      domain: "eating_habits" as QuestionDomain,
      explanation:
        "Measures understanding of traditional eating habits where the main hot meal (Mittagessen) is eaten around noon.",
      sources: [
        "https://en.wikipedia.org/wiki/German_cuisine",
        "https://germanfoods.org/german-food-facts/breakfast-lunch-dinner-snacks/",
      ],
    },

    {
      id: 8,
      type: "matching",
      question: "Match each dish to its region in Germany.",
      pairs: [
        {
          id: "bavaria",
          label: "Weißwurst (Bavaria)",
          image: "/assets/img/Pre-test/Weisswurst.png",
        },
        {
          id: "north",
          label: "Labskaus (Northern Germany)",
          image: "/assets/img/Pre-test/LabsKaus.png",
        },
        {
          id: "swabia",
          label: "Spätzle (Swabia)",
          image: "/assets/img/Pre-test/Spätzle.png",
        },
      ],

      difficulty: "hard" as Difficulty,
      domain: "regional_diversity" as QuestionDomain,
      explanation:
        "Assesses regional food culture knowledge by linking Weißwurst to Bavaria, Labskaus to Northern Germany, and Spätzle to Swabia.",
      sources: [
        "https://www.discover-bavaria.com/Inspiration/bavarian-specialities",
        "https://en.wikipedia.org/wiki/Labskaus",
        "https://en.wikipedia.org/wiki/Sp%C3%A4tzle",
      ],
    },
    {
      id: 9,
      type: "imageGrid",
      question: "Which of the following cheeses is Milbenkäse?",
      imageOptions: [
        { src: "/assets/img/Pre-test/Milbenkäse.jpg", label: "Milbenkäse" },
        { src: "/assets/img/Pre-test/brie.jpg", label: "Brie" },
        { src: "/assets/img/Pre-test/emmental.jpg", label: "Emmental" },
        { src: "/assets/img/Pre-test/Gouda.jpg", label: "Gouda" },
      ],
      answer: "Milbenkäse",
      difficulty: "hard" as Difficulty,
      domain: "specialty_product" as QuestionDomain,
      explanation:
        "Tests advanced knowledge of a rare German specialty cheese from Würchwitz that is ripened with cheese mites.",
      sources: [
        "https://en.wikipedia.org/wiki/Milbenk%C3%A4se",
        "https://www.atlasobscura.com/places/cheese-mite-memorial",
      ],
    },
    {
      id: 10,
      type: "image",
      question: "What is the volume of a beer Maß at Oktoberfest?",
      image: "/assets/img/Pre-test/beer.jpg",
      options: ["0.5 L", "1 L", "1.5 L", "2 L"],
      answer: "1 L",

      difficulty: "medium" as Difficulty,
      domain: "festival_culture" as QuestionDomain,
      explanation:
        "Checks knowledge of Oktoberfest beer culture, where the standard Maßkrug holds one liter of beer.",
      sources: [
        "https://www.paulaner-shop.de/en/1.0-l-glass-mug/PB05000",
        "https://www.germansteins.com/frankfurt-dimpled-oktoberfest-glass-beer-mug-1-liter/",
      ],
    },
  ];

  const totalQuestions = questions.length;

  const [selected, setSelected] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [matched, setMatched] = useState<Record<string, string>>({});

  const current = questions[currentIndex];

  const handleSelect = (opt: string) => !showAnswer && setSelected(opt);
  const updateWrongQuestions = async () => {
    if (!email) return;

    try {
      await fetch(`${API_URL}/usergame`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          pretestWrongQuestionIds: wrongQuestionIds,
        }),
      });
      console.log("✅ Wrong questions saved:", wrongQuestionIds);
    } catch (err) {
      console.error("❌ Failed to save wrong questions:", err);
    }
  };

  const calculateUserLevel = (score: number) => {
    if (score >= 8) return "Advanced";
    if (score >= 5) return "Intermediate";
    return "Beginner";
  };

  const updateUserScore = async () => {
    if (!email) return;
    try {
      await fetch(`${API_URL}/usergame`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pretestScore: points }),
      });
      console.log("✅ Pretest score updated successfully!");
    } catch (err) {
      console.error("Error updating score:", err);
    }
  };

  const handleFinish = async () => {
    await updateUserScore();
    await updateWrongQuestions();
    const level = calculateUserLevel(points);
    setUserLevel(level);
    setShowResult(true);

    // 🎵 Play celebration sound
    celebrationAudio.current?.play();
  };

  const handleNext = () => {
    // ---------- MATCHING QUESTIONS ----------
    if (current.type === "matching") {
      if (!current.pairs) return; // TS safety

      // If not all matches are placed yet → do nothing
      if (Object.keys(matched).length < current.pairs.length) return;

      // First time: reveal correctness
      if (!showAnswer) {
        setShowAnswer(true);

        // Evaluate correctness
        const correctMatches = current.pairs.filter(
          (p) => matched[p.id] === p.id
        ).length;

        if (correctMatches === current.pairs.length) {
          setPoints((p) => p + 1);
          correctAudio.current?.play();
        } else {
          registerWrongAnswer(current.id);
          wrongAudio.current?.play();
        }

        // ⭐ AUTO-NEXT AFTER 3 SECONDS
        setTimeout(() => {
          if (currentIndex < totalQuestions - 1) {
            setCurrentIndex((i) => i + 1);
            setSelected(null);
            setShowAnswer(false);
            setMatched({});
          } else {
            handleFinish();
          }
        }, 2000);

        return;
      }

      return; // showAnswer is true → wait for auto-next
    }

    // ---------- NORMAL QUESTIONS (text / image / imageGrid) ----------
    if (!selected) return;

    // First click = check correctness
    if (!showAnswer) {
      setShowAnswer(true);
      const correct = selected === current.answer;

      if (correct) {
        setPoints((p) => p + 1);
        correctAudio.current?.play();
      } else {
        registerWrongAnswer(current.id);
        wrongAudio.current?.play();
      }

      // ⭐ AUTO-NEXT AFTER 3 SECONDS
      setTimeout(() => {
        if (currentIndex < totalQuestions - 1) {
          setCurrentIndex((i) => i + 1);
          setSelected(null);
          setShowAnswer(false);
          setMatched({});
        } else {
          handleFinish();
        }
      }, 2000);

      return;
    }

    // Already in showAnswer → auto-next already triggered
  };
  const registerWrongAnswer = (questionId: number) => {
    setWrongQuestionIds((prev) =>
      prev.includes(questionId) ? prev : [...prev, questionId]
    );
  };

  useEffect(() => {
    if (current.type === "matching" && current.pairs) {
      setShuffledSources(shuffleArray(current.pairs));
      setShuffledTargets(shuffleArray(current.pairs));
      setMatched({});
      setShowAnswer(false);
    }
  }, [currentIndex]);

  // countdown
  useEffect(() => {
    if (stage === "countdown") {
      setCount(3);
      countdownAudio.current?.play();
      const numbers: (number | string)[] = [3, 2, 1, "Go!"];
      let i = 0;
      const timer = setInterval(() => {
        setCount(numbers[i]);
        i++;
        if (i === numbers.length) {
          clearInterval(timer);
          setTimeout(() => {
            setStage("question");
            if (backgroundAudio.current) {
              backgroundAudio.current.loop = true;
              backgroundAudio.current.volume = 0.4;
              backgroundAudio.current.play().catch(() => {});
            }
          }, 700);
        }
      }, 800);
      return () => clearInterval(timer);
    }
  }, [stage]);

  // fetch user
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

  // preloader hide
  useEffect(() => {
    const timer = setTimeout(() => {
      const preloader = document.getElementById("preloader");
      if (preloader) preloader.style.display = "none";
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const assignMatch = (sourceId: string | null, targetId: string) => {
    if (!sourceId || showAnswer) return;

    setMatched((prev) => {
      const updated: Record<string, string> = { ...prev };

      // remove old mapping for same target or same source
      for (const key in updated) {
        if (updated[key] === targetId) delete updated[key];
        if (key === sourceId) delete updated[key];
      }

      updated[sourceId] = targetId;
      return updated;
    });

    setDragging(null);
    setActiveSource(null);
    setTouchSource(null);
  };

  // ===== TOUCH DRAG HELPERS (mobile) =====
  const handleTouchStart = (e: any, id: string, image: string) => {
    if (showAnswer) return;

    const touch = e.touches[0];

    setTouchSource(id);
    setActiveSource(id);

    setDragGhost({
      src: image,
      x: touch.clientX,
      y: touch.clientY,
    });
  };

  const handleTouchMove = (e: any) => {
    if (!touchSource || !dragGhost) return;

    e.preventDefault(); // prevent page scroll

    const touch = e.touches[0];

    setDragGhost((g) =>
      g
        ? {
            ...g,
            x: touch.clientX,
            y: touch.clientY,
          }
        : null
    );
  };

  const handleTouchEnd = (e: any) => {
    if (!touchSource || showAnswer) {
      setTouchSource(null);
      setActiveSource(null);
      return;
    }

    const touch = e.changedTouches?.[0];
    if (!touch) {
      setTouchSource(null);
      setActiveSource(null);
      return;
    }

    const x = touch.clientX;
    const y = touch.clientY;

    const elem = document.elementFromPoint(x, y) as HTMLElement | null;
    if (elem) {
      const slot = elem.closest(".drop-slot") as HTMLElement | null;
      if (slot) {
        const targetId = slot.dataset.targetId;
        if (targetId) {
          assignMatch(touchSource, targetId);
        }
      }
    }

    setTouchSource(null);
    setActiveSource(null);
    setDragGhost(null);
  };

  return (
    <div className="pretest-wrapper">
      {/* === Audio === */}
      <audio
        ref={countdownAudio}
        src="/assets/audio/countdown.mp3"
        preload="auto"
      />
      <audio
        ref={backgroundAudio}
        src="/assets/audio/game-loop.mp3"
        preload="auto"
      />
      <audio
        ref={correctAudio}
        src="/assets/audio/correct.mp3"
        preload="auto"
      />
      <audio ref={wrongAudio} src="/assets/audio/wrong.mp3" preload="auto" />
      <audio
        ref={celebrationAudio}
        src="/assets/audio/celebration.mp3"
        preload="auto"
      />

      {stage === "intro" && (
        <div className="intro-screen">
          <h1 className="intro-title">
            {userInfo
              ? `Ready to begin the pre-test, ${userInfo.firstName}? 😄`
              : "Ready to begin the pre-test?"}
          </h1>
          <p className="intro-subtitle">
            This short quiz will measure your current knowledge about German
            food culture. Just answer as best as you can!
          </p>
          <button
            className="start-btn"
            onClick={() => {
              setWrongQuestionIds([]);
              setStage("countdown");
            }}
          >
            Begin Pre-Test
          </button>
        </div>
      )}

      {stage === "countdown" && (
        <div className="countdown-screen">
          <div
            className={`countdown-number ${count === "Go!" ? "go-text" : ""}`}
          >
            {count}
          </div>
        </div>
      )}

      {stage === "question" && (
        <div className="quiz-container fade-in">
          <div className="score-bar">
            Question {currentIndex + 1}/{totalQuestions} · Points:{" "}
            <span className="score">{points}</span>/{totalQuestions}
          </div>

          {/* === TEXT / IMAGE === */}
          {["image", "text"].includes(current.type) && (
            <div
              className={
                current.type === "image" ? "question-layout" : "text-question"
              }
            >
              {current.type === "image" && (
                <div className="image-side">
                  <img
                    src={current.image}
                    alt="Question"
                    className="question-image"
                  />
                </div>
              )}

              <div className="question-side">
                <h2 className="question-title">{current.question}</h2>

                {/* meta: difficulty + domain */}
                <div className="question-meta">
                  {current.difficulty && (
                    <span
                      className={`difficulty-pill diff-${current.difficulty}`}
                    >
                      {formatDifficulty(current.difficulty)} question
                    </span>
                  )}
                  {/* {current.sources && current.sources.length > 0 && (
                      <div className="meta-sources">
                        {current.sources.map((url: string) => (
                          <a
                            key={url}
                            className="meta-source-pill"
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {getSourceLabel(url)}
                          </a>
                        ))}
                      </div>
                    )} */}
                </div>

                <div className="options-grid">
                  {current.options?.map((opt: string) => {
                    const sel = selected === opt;
                    const correct = opt === current.answer;
                    let cls = "option-btn";
                    if (showAnswer) {
                      if (sel && correct) cls += " correct";
                      else if (sel && !correct) cls += " wrong";
                      else if (!sel && correct) cls += " highlight";
                    } else if (sel) cls += " selected";
                    return (
                      <button
                        key={opt}
                        className={cls}
                        onClick={() => handleSelect(opt)}
                        disabled={showAnswer}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                <button
                  className={`next-btn ${
                    !selected && !showAnswer ? "disabled" : ""
                  }`}
                  onClick={handleNext}
                >
                  {currentIndex === totalQuestions - 1 && showAnswer
                    ? "Finish"
                    : showAnswer
                    ? "Next"
                    : "Check Answer"}
                </button>
              </div>
            </div>
          )}

          {/* === IMAGE GRID === */}
          {current.type === "imageGrid" && (
            <div className="image-grid-question">
              <h2 className="question-title">{current.question}</h2>

              <div className="question-meta question-meta-center">
                <div className="question-meta">
                  {current.difficulty && (
                    <span
                      className={`difficulty-pill diff-${current.difficulty}`}
                    >
                      {formatDifficulty(current.difficulty)}
                    </span>
                  )}

                  {/* {current.sources && current.sources.length > 0 && (
                      <div className="meta-sources">
                        {current.sources.map((url) => (
                          <a
                            key={url}
                            className="meta-source-pill"
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {getSourceLabel(url)}
                          </a>
                        ))}
                      </div>
                    )} */}
                </div>
              </div>

              <div className="image-grid">
                {current.imageOptions?.map((img: any) => {
                  const sel = selected === img.label;
                  const correct = img.label === current.answer;
                  let cls = "img-option";
                  if (showAnswer) {
                    if (sel && correct) cls += " correct";
                    else if (sel && !correct) cls += " wrong";
                    else if (!sel && correct) cls += " highlight";
                  } else if (sel) cls += " selected";
                  return (
                    <div
                      key={img.label}
                      className={cls}
                      onClick={() => handleSelect(img.label)}
                    >
                      <img src={img.src} alt={img.label} />
                      {current.id !== 9 && <p>{img.label}</p>}
                    </div>
                  );
                })}
              </div>

              <button
                className={`next-btn ${
                  !selected && !showAnswer ? "disabled" : ""
                }`}
                onClick={handleNext}
              >
                {currentIndex === totalQuestions - 1 && showAnswer
                  ? "Finish"
                  : showAnswer
                  ? "Next"
                  : "Check Answer"}
              </button>
            </div>
          )}

          {/* === MATCHING === */}
          {current.type === "matching" && current.pairs && (
            <div className="matching-question">
              <h2 className="question-title">{current.question}</h2>

              <div className="question-meta question-meta-center">
                {current.difficulty && (
                  <span
                    className={`difficulty-pill diff-${current.difficulty}`}
                  >
                    {formatDifficulty(current.difficulty)} question
                  </span>
                )}
              </div>

              <div className="match-area-simple">
                {/* LEFT DRAGGABLE */}
                <div className="match-source">
                  {shuffledSources.map((pair: any) => {
                    const isPlaced = Object.keys(matched).includes(pair.id);
                    const isActive = activeSource === pair.id;

                    return (
                      <div
                        key={pair.id}
                        className={`match-item ${isPlaced ? "placed" : ""} ${
                          isActive ? "active" : ""
                        }`}
                        draggable={!showAnswer}
                        onDragStart={() => !showAnswer && setDragging(pair.id)}
                        // touch drag (mobile)
                        onTouchStart={(e) =>
                          handleTouchStart(e, pair.id, pair.image)
                        }
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                      >
                        <img src={pair.image} alt={pair.label} />
                      </div>
                    );
                  })}
                </div>

                {/* RIGHT TARGETS */}
                <div className="match-targets">
                  {shuffledTargets.map((target: any) => (
                    <div
                      key={target.id}
                      className={`drop-slot ${
                        showAnswer
                          ? matched[target.id] === target.id
                            ? "correct-slot"
                            : "wrong-slot"
                          : ""
                      }`}
                      data-target-id={target.id}
                      onDrop={() => {
                        if (!dragging || showAnswer) return;
                        assignMatch(dragging, target.id);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDragLeave={(e) => e.preventDefault()}
                      onDragEnter={(e) => e.preventDefault()}
                    >
                      <span className="slot-label">{target.label}</span>
                      {Object.entries(matched)
                        .filter(([_, tgt]) => tgt === target.id)
                        .map(([src]) => {
                          const img = current.pairs.find(
                            (p: any) => p.id === src
                          );
                          return (
                            <img
                              key={src}
                              src={img?.image}
                              alt={img?.label}
                              className="slot-img"
                            />
                          );
                        })}
                    </div>
                  ))}
                </div>
              </div>

              <button
                className={`next-btn ${
                  Object.keys(matched).length < current.pairs.length &&
                  !showAnswer
                    ? "disabled"
                    : ""
                }`}
                onClick={handleNext}
              >
                {currentIndex === totalQuestions - 1 && showAnswer
                  ? "Finish"
                  : showAnswer
                  ? "Next"
                  : "Check Matches"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* === RESULT POPUP === */}
      {showResult && (
        <div className="result-popup">
          <div className="result-card">
            <h2>🎉 Great Job!</h2>
            <p>
              You scored <strong>{points}</strong> out of{" "}
              <strong>{totalQuestions}</strong>
            </p>
            <p>
              Your Level: <span className="level-tag">{userLevel}</span>
            </p>
            <p className="journey-msg">
              We’ll now build your personalized journey based on your
              performance!
            </p>
            <button
              className="continue-btn"
              onClick={() => {
                if (email) {
                  router.push(
                    `${FrontEndURL}/user?email=${encodeURIComponent(email)}`
                  );
                }
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
      {/* === MOBILE DRAG GHOST === */}
      {dragGhost && (
        <div
          className="drag-ghost"
          style={{
            left: dragGhost.x,
            top: dragGhost.y,
          }}
        >
          <img src={dragGhost.src} alt="" />
        </div>
      )}
    </div>
  );
}
