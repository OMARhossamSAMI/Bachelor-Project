"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import "./page.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
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
export default function PostTestClient() {
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

  // === Audio ===
  const countdownAudio = useRef<HTMLAudioElement | null>(null);
  const backgroundAudio = useRef<HTMLAudioElement | null>(null);
  const correctAudio = useRef<HTMLAudioElement | null>(null);
  const wrongAudio = useRef<HTMLAudioElement | null>(null);
  const celebrationAudio = useRef<HTMLAudioElement | null>(null);
  const [savingScore, setSavingScore] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [scoreSaved, setScoreSaved] = useState(false);

  // === Post-test questions (different content, same structure & domains) ===
  // === Improved Post-test (same photos, pre-test style difficulty) ===
  const questions = [
    {
      id: 1,
      type: "image",
      question:
        "This breaded cutlet is often served with lemon and a potato side. What is it called?",
      image: "/assets/img/Post-test/schnitzel_potatosalad.jpg",
      options: ["Bratwurst", "Wiener Schnitzel", "Sauerkraut", "Pretzel"],
      answer: "Wiener Schnitzel",
      difficulty: "easy" as Difficulty,
      domain: "iconic_dishes" as QuestionDomain,
      explanation:
        "Easy recognition of a famous German/Austrian-style dish. Distractors are well-known German foods but clearly not a breaded cutlet.",
      sources: [
        "https://en.wikipedia.org/wiki/Wiener_schnitzel",
        "https://en.wikipedia.org/wiki/German_cuisine",
      ],
    },

    {
      id: 2,
      type: "text",
      question: "In Germany, what does “Abendbrot” usually refer to?",
      options: [
        "Coffee and cake in the afternoon",
        "A cold evening meal with bread and toppings",
        "A spicy street-food snack",
        "A big warm lunch eaten at midday",
      ],
      answer: "A cold evening meal with bread and toppings",
      difficulty: "medium" as Difficulty,
      domain: "eating_habits" as QuestionDomain,
      explanation:
        "Checks a very common cultural habit foreigners actually encounter: Abendbrot is typically a simple bread-based cold dinner.",
      sources: [
        "https://germanfoods.org/german-food-facts/breakfast-lunch-dinner-snacks/",
        "https://en.wikipedia.org/wiki/German_cuisine",
      ],
    },

    {
      id: 3,
      type: "image",
      question:
        "This cake with cherries, cream, and chocolate shavings is known as…",
      image: "/assets/img/Post-test/schwarzwalder_kirschtorte.jpg",
      options: [
        "Schwarzwälder Kirschtorte",
        "Chocolate brownie",
        "Cheesecake",
        "Tiramisu",
      ],
      answer: "Schwarzwälder Kirschtorte",
      difficulty: "easy" as Difficulty,
      domain: "iconic_dishes" as QuestionDomain,
      explanation:
        "Easy visual recognition of a famous German cake. Distractors are common international desserts that look different.",
      sources: ["https://en.wikipedia.org/wiki/Black_Forest_gateau"],
    },

    {
      id: 4,
      type: "imageGrid",
      question:
        "Which drink is the classic one you most strongly associate with German Christmas markets?",
      imageOptions: [
        {
          src: "/assets/img/Post-test/hot_chocolate.jpg",
          label: "Hot chocolate",
        },
        { src: "/assets/img/Post-test/gluhwein.jpg", label: "Glühwein" },
        { src: "/assets/img/Post-test/coffee.jpg", label: "Coffee" },
        { src: "/assets/img/Post-test/tea.jpg", label: "Tea" },
      ],
      answer: "Glühwein",
      difficulty: "medium" as Difficulty,
      domain: "festival_culture" as QuestionDomain,
      explanation:
        "Medium: all are realistic warm drinks, but Glühwein is the iconic Christmas-market one in Germany.",
      sources: [
        "https://en.wikipedia.org/wiki/Mulled_wine",
        "https://www.dw.com/en/german-christmas-markets-gl%C3%BChwein-and-more/a-36601767",
      ],
    },

    {
      id: 5,
      type: "text",
      question: "Many Germans grab a quick bite at an “Imbiss”. What is that?",
      options: [
        "A small snack stand / takeaway kiosk",
        "A hotel breakfast buffet",
        "A supermarket cashier desk",
        "A fine-dining restaurant",
      ],
      answer: "A small snack stand / takeaway kiosk",
      difficulty: "easy" as Difficulty,
      domain: "street_food" as QuestionDomain,
      explanation:
        "Easy but useful real-life vocabulary: ‘Imbiss’ means a quick snack stand (often sausages, fries, etc.).",
      sources: [
        "https://en.wikipedia.org/wiki/Imbiss",
        "https://germanfoods.org/german-food-facts/snack-time-in-germany/",
      ],
    },

    {
      id: 6,
      type: "matching",
      question: "Match the region to the specialty shown.",
      pairs: [
        {
          id: "berlin",
          label: "Berlin",
          image: "/assets/img/Post-test/currywurst_berlin.jpg",
        },
        {
          id: "thuringia",
          label: "Thuringia",
          image: "/assets/img/Post-test/thuringer_rostbratwurst.jpg",
        },
        {
          id: "blackforest",
          label: "Black Forest region",
          image: "/assets/img/Post-test/blackforest_cake_slice.jpg",
        },
      ],
      difficulty: "hard" as Difficulty,
      domain: "regional_diversity" as QuestionDomain,
      explanation:
        "Hard: checks regional food identity using visuals. No answer is given inside the dish names, so learners must actually know/remember.",
      sources: [
        "https://en.wikipedia.org/wiki/Currywurst",
        "https://en.wikipedia.org/wiki/Th%C3%BCringer_Rostbratwurst",
        "https://en.wikipedia.org/wiki/Black_Forest_gateau",
      ],
    },

    {
      id: 7,
      type: "text",
      question: "What are Spätzle mainly made from?",
      options: [
        "Flour and eggs (soft noodle dough)",
        "Rice and vegetables",
        "Milk and sugar",
        "Cabbage and vinegar",
      ],
      answer: "Flour and eggs (soft noodle dough)",
      difficulty: "medium" as Difficulty,
      domain: "ingredients" as QuestionDomain,
      explanation:
        "Medium ingredient check: Spätzle are traditional egg noodles, common in southern Germany.",
      sources: ["https://en.wikipedia.org/wiki/Sp%C3%A4tzle"],
    },

    {
      id: 8,
      type: "matching",
      question:
        "Match each time of day to the typical German food moment shown.",
      pairs: [
        {
          id: "morning",
          label: "Morning",
          image: "/assets/img/Post-test/german_breakfast.jpg",
        },
        {
          id: "evening",
          label: "Evening",
          image: "/assets/img/Post-test/abendbrot_table.jpg",
        },
        {
          id: "afternoon",
          label: "Afternoon",
          image: "/assets/img/Post-test/kaffee_und_kuchen.jpg",
        },
      ],
      difficulty: "hard" as Difficulty,
      domain: "eating_habits" as QuestionDomain,
      explanation:
        "Hard: tests understanding of daily routine with visuals (breakfast vs coffee/cake vs evening bread meal).",
      sources: [
        "https://germanfoods.org/german-food-facts/breakfast-lunch-dinner-snacks/",
        "https://www.germanfoods.org/german-food-facts/kaffee-und-kuchen/",
      ],
    },

    {
      id: 9,
      type: "imageGrid",
      question:
        "Which bread best matches a typical German dense wholegrain-style bread (Vollkornbrot)?",
      imageOptions: [
        { src: "/assets/img/Post-test/white_toast.jpg", label: "White toast" },
        {
          src: "/assets/img/Post-test/vollkornbrot.jpg",
          label: "Dense wholegrain bread",
        },
        { src: "/assets/img/Post-test/baguette.jpg", label: "Baguette" },
        { src: "/assets/img/Post-test/croissant.jpg", label: "Croissant" },
      ],
      answer: "Dense wholegrain bread",
      difficulty: "medium" as Difficulty,
      domain: "specialty_product" as QuestionDomain,
      explanation:
        "Medium product/culture check: German bread culture is famous for dense wholegrain breads, not just soft toast.",
      sources: [
        "https://en.wikipedia.org/wiki/Vollkornbrot",
        "https://www.dw.com/en/german-bread-culture/a-18277431",
      ],
    },

    {
      id: 10,
      type: "image",
      question:
        "This filled pasta dish (often served in broth) comes from which German region?",
      image: "/assets/img/Post-test/maultaschen.jpg",
      options: ["Northern Germany", "Swabia", "Bavaria", "Saxony"],
      answer: "Swabia",
      difficulty: "medium" as Difficulty,
      domain: "regional_diversity" as QuestionDomain,
      explanation:
        "Medium regional knowledge: Maultaschen are a well-known Swabian specialty (often described as German stuffed pasta).",
      sources: ["https://en.wikipedia.org/wiki/Maultasche"],
    },
  ];

  const totalQuestions = questions.length;

  const [selected, setSelected] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [matched, setMatched] = useState<Record<string, string>>({});

  const current = questions[currentIndex];

  const handleSelect = (opt: string) => !showAnswer && setSelected(opt);

  const calculateUserLevel = (score: number) => {
    if (score >= 8) return "Advanced";
    if (score >= 5) return "Intermediate";
    return "Beginner";
  };

  // 🔁 UPDATE: store POST-test score instead of pre-test
  const updateUserScore = async () => {
    if (!email) return false;
    if (scoreSaved) return true;

    try {
      const res = await fetch(`${API_URL}/usergame`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, posttestScore: points }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Failed to update post-test score");
      }

      setScoreSaved(true);
      console.log("✅ Post-test score updated successfully!");
      return true;
    } catch (err) {
      console.error("❌ Error updating post-test score:", err);
      return false;
    }
  };

  const handleFinish = async () => {
    await updateUserScore();
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
          (p: any) => matched[p.id] === p.id
        ).length;

        if (correctMatches === current.pairs.length) {
          setPoints((p) => p + 1);
          correctAudio.current?.play();
        } else {
          wrongAudio.current?.play();
        }

        // ⭐ AUTO-NEXT AFTER 2 SECONDS
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
        wrongAudio.current?.play();
      }

      // ⭐ AUTO-NEXT AFTER 2 SECONDS
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
              backgroundAudio.current.play().catch(() => {
                /* autoplay block */
              });
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
  const handleTouchStart = (e: any, id: string) => {
    if (showAnswer) return;
    setTouchSource(id);
    setActiveSource(id);
  };

  const handleTouchMove = (e: any) => {
    if (!touchSource) return;
    // avoid scrolling while dragging
    e.preventDefault();
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
              ? `Ready for your post-test, ${userInfo.firstName}? 🎓`
              : "Ready for your post-test?"}
          </h1>
          <p className="intro-subtitle">
            Now that you’ve finished all the levels, this short quiz will check
            what you&apos;ve learned about German food culture. Answer as best
            as you can and compare it with your pre-test!
          </p>
          <button className="start-btn" onClick={() => setStage("countdown")}>
            Start Post-Test
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
            Post-Test · Question {currentIndex + 1}/{totalQuestions} · Points:{" "}
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
                  {current.sources && current.sources.length > 0 && (
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
                  )}
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
                      {formatDifficulty(current.difficulty)} question
                    </span>
                  )}

                  {current.sources && current.sources.length > 0 && (
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
                  )}
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
                      {/* Keep same behavior: hide labels only for question id 9 */}
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
                  {current.pairs.map((pair: any) => {
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
                        onTouchStart={(e) => handleTouchStart(e, pair.id)}
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
                  {current.pairs.map((target: any) => (
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
            <h2>🎉 Post-Test Completed!</h2>
            <p>
              You scored <strong>{points}</strong> out of{" "}
              <strong>{totalQuestions}</strong>
            </p>
            <p>
              Your Level: <span className="level-tag">{userLevel}</span>
            </p>
            <p className="journey-msg">
              Compare this post-test with your pre-test score to see how much
              you&apos;ve improved during your FoodCulture journey!
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
              Back to my dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
