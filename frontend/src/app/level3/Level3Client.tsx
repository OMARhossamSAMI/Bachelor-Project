"use client";

import "./page.css";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (() => {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  })();

const MAX_SCORE = 100;
const MIN_SCORE = 0;
const CORRECT_DELTA = 10;
const WRONG_DELTA = -5;

type Stage = "welcome" | "countdown" | "playing";

type Card = {
  emoji: string;
  label: string;
  isCorrect: boolean;
  origin?: string;
};

type Dish = {
  name: string;
  cards: Card[];
};

interface Level3Data {
  email: string;
  dishes: Dish[];
  modelUsed?: string;
  generatedAt?: string;
}

interface User {
  firstName: string;
  lastName: string;
  email: string;
}

// 🔥 Fallback dishes if backend fails
const FALLBACK_DISHES: Dish[] = [
  {
    name: "Sauerbraten Feast",
    cards: [
      { emoji: "🥨", label: "Pretzel", isCorrect: true },
      { emoji: "🍕", label: "Pizza", isCorrect: false },
      { emoji: "🌭", label: "Currywurst", isCorrect: true },
      { emoji: "🍣", label: "Sushi", isCorrect: false },
      { emoji: "🍖", label: "Sauerbraten", isCorrect: true },
      { emoji: "🍟", label: "Fries", isCorrect: false },
    ],
  },
  {
    name: "Pretzel Party",
    cards: [
      { emoji: "🥨", label: "Pretzel", isCorrect: true },
      { emoji: "🍟", label: "Fries", isCorrect: false },
      { emoji: "🍕", label: "Pizza", isCorrect: false },
      { emoji: "🌭", label: "Currywurst", isCorrect: true },
      { emoji: "🍣", label: "Sushi", isCorrect: false },
      { emoji: "🍖", label: "Sauerbraten", isCorrect: true },
    ],
  },
  {
    name: "Currywurst Combo",
    cards: [
      { emoji: "🌭", label: "Currywurst", isCorrect: true },
      { emoji: "🥨", label: "Pretzel", isCorrect: true },
      { emoji: "🍖", label: "Sauerbraten", isCorrect: true },
      { emoji: "🍟", label: "Fries", isCorrect: false },
      { emoji: "🍕", label: "Pizza", isCorrect: false },
      { emoji: "🍣", label: "Sushi", isCorrect: false },
    ],
  },
];

export default function Level3Client() {
  const params = useSearchParams();
  const email = params.get("email");

  const [user, setUser] = useState<User | null>(null);
  const userName = user?.firstName || "Explorer";

  const [levelLoaded, setLevelLoaded] = useState(false);
  const [dishes, setDishes] = useState<Dish[]>(FALLBACK_DISHES);
  const [currentDishIndex, setCurrentDishIndex] = useState(0);

  const scoreRef = useRef(0);
  const placedCorrectRef = useRef(0); // how many correct on this plate

  const [showNext, setShowNext] = useState(false);

  const currentDish: Dish = dishes[currentDishIndex];

  // 🌟 stage & countdown (welcome → countdown → playing)
  const [stage, setStage] = useState<Stage>("welcome");
  const [countdown, setCountdown] = useState<number | null>(null);

  // 🌟 result modal
  const [showResult, setShowResult] = useState(false);
  // 🔀 cards for current dish, in random order
  const [shuffledCards, setShuffledCards] = useState<Card[]>([]);
  // 🔊 AUDIO REFS (same as Level 2)
  const countdownSoundRef = useRef<HTMLAudioElement | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const tickRef = useRef<HTMLAudioElement | null>(null); // not used here but kept
  const dragSoundRef = useRef<HTMLAudioElement | null>(null);
  const hoverSoundRef = useRef<HTMLAudioElement | null>(null);
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const wrongSoundRef = useRef<HTMLAudioElement | null>(null);
  const gameOverSoundRef = useRef<HTMLAudioElement | null>(null);

  const isHoveringPlateRef = useRef(false);

  // === Preloader effect ===
  useEffect(() => {
    const timer = setTimeout(() => {
      const preloader = document.getElementById("preloader");
      if (preloader) preloader.style.display = "none";
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // === Init audio once on mount ===
  useEffect(() => {
    if (typeof window === "undefined") return;

    countdownSoundRef.current = new Audio("/assets/audio/countdown.mp3");
    bgMusicRef.current = new Audio("/assets/audio/level3.mp3");
    tickRef.current = new Audio("/assets/audio/tick.wav");
    dragSoundRef.current = new Audio("/assets/audio/drag.mp3");
    hoverSoundRef.current = new Audio("/assets/audio/bucket-hover.mp3");
    correctSoundRef.current = new Audio("/assets/audio/correct_2.mp3");
    wrongSoundRef.current = new Audio("/assets/audio/wrong_2.mp3");
    gameOverSoundRef.current = new Audio("/assets/audio/game-over.mp3");

    if (bgMusicRef.current) {
      bgMusicRef.current.loop = true;
      bgMusicRef.current.volume = 0.4;
    }
    if (tickRef.current) {
      tickRef.current.loop = true;
      tickRef.current.volume = 0.8;
    }

    return () => {
      const all = [
        countdownSoundRef,
        bgMusicRef,
        tickRef,
        dragSoundRef,
        hoverSoundRef,
        correctSoundRef,
        wrongSoundRef,
        gameOverSoundRef,
      ];
      all.forEach((ref) => {
        const a = ref.current;
        if (a) {
          a.pause();
          a.currentTime = 0;
        }
      });
    };
  }, []);

  // helpers to safely play/stop audio
  const playSound = (
    ref: React.RefObject<HTMLAudioElement | null>,
    reset = true
  ) => {
    const audio = ref.current;
    if (!audio) return;
    if (reset) audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  const stopSound = (
    ref: React.RefObject<HTMLAudioElement | null>,
    reset = true
  ) => {
    const audio = ref.current;
    if (!audio) return;
    audio.pause();
    if (reset) audio.currentTime = 0;
  };

  // === Fetch user (for name in question) ===
  useEffect(() => {
    if (!email) {
      setUser(null);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${API_URL}/users/${encodeURIComponent(email)}`
        );
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = await res.json();
        setUser(data);
      } catch {
        setUser(null);
      }
    };

    fetchUser();
  }, [email]);

  // === Fetch Level 3 dishes from backend ===
  useEffect(() => {
    if (!email) {
      setDishes(FALLBACK_DISHES);
      setLevelLoaded(true);
      return;
    }

    const fetchLevel3 = async () => {
      try {
        const res = await fetch(
          `${API_URL}/ai/level3/${encodeURIComponent(email)}/get`
        );

        if (!res.ok) {
          console.warn("No Level 3 found, using fallback dishes.");
          setDishes(FALLBACK_DISHES);
        } else {
          const data: Level3Data = await res.json();
          if (Array.isArray(data.dishes) && data.dishes.length > 0) {
            setDishes(data.dishes);
          } else {
            console.warn("Level 3 response has no dishes, using fallback.");
            setDishes(FALLBACK_DISHES);
          }
        }
      } catch (err) {
        console.error("Error fetching Level 3 data:", err);
        setDishes(FALLBACK_DISHES);
      } finally {
        setCurrentDishIndex(0);
        setLevelLoaded(true);
      }
    };

    fetchLevel3();
  }, [email]);
  // 🔀 Re-shuffle cards whenever we switch dish or dishes change
  useEffect(() => {
    const dish = dishes[currentDishIndex];
    if (!dish) return;

    // create a shuffled copy so we never mutate state directly
    const shuffled = [...dish.cards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
  }, [dishes, currentDishIndex]);
  // 🎬 COUNTDOWN LOGIC
  useEffect(() => {
    if (stage !== "countdown" || countdown === null) return;

    if (countdown <= 0) {
      setStage("playing");
      setCountdown(null);
      return;
    }

    const t = window.setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : prev));
    }, 1000);

    return () => window.clearTimeout(t);
  }, [stage, countdown]);

  // 🔊 background music depending on stage
  useEffect(() => {
    if (stage === "playing" && !showResult) {
      playSound(bgMusicRef, true);
    } else {
      stopSound(bgMusicRef, false);
    }
  }, [stage, showResult]);

  // 🔊 game over sound when result modal shows
  useEffect(() => {
    if (showResult) {
      stopSound(bgMusicRef);
      stopSound(tickRef, false);
      playSound(gameOverSoundRef, true);
    }
  }, [showResult]);

  // === Drag + drop detection on plate + scoring ===
  useEffect(() => {
    const cards = Array.from(
      document.querySelectorAll<HTMLElement>(".food-card")
    );

    const plate = document.querySelector<HTMLElement>(".plate-area");
    const plateBase = document.querySelector<HTMLElement>(".plate-base");
    const foodsContainer = document.querySelector<HTMLElement>(".plate-foods");

    if (!plate || !plateBase) return;

    // reset per-plate counters
    placedCorrectRef.current = 0;
    setShowNext(false);
    isHoveringPlateRef.current = false;

    const totalCorrect = cards.filter(
      (c) => c.dataset.correct === "true"
    ).length;

    // 🔁 Helper to animate performance meter
    const updateMeter = (score: number) => {
      const circle = document.querySelector<SVGCircleElement>(
        ".score-circle .progress"
      );
      const scoreDisplay = document.getElementById("scoreDisplay");

      const radius = 52;
      const circumference = 2 * Math.PI * radius;

      if (!circle) return;

      circle.style.strokeDasharray = `${circumference}`;
      const offset = circumference - (score / 100) * circumference;
      circle.style.strokeDashoffset = `${offset}`;

      let color = "#ff9f43";
      if (score >= 70) color = "#2ecc71";
      else if (score <= 30) color = "#e74c3c";
      circle.style.stroke = color;

      if (scoreDisplay) scoreDisplay.textContent = String(score);
    };

    // keep whatever global score we already have
    updateMeter(scoreRef.current);

    const handlers: { el: HTMLElement; handler: (e: PointerEvent) => void }[] =
      [];
    const scrollContainer =
      document.querySelector<HTMLElement>(".level3-container");

    cards.forEach((card) => {
      const onPointerDown = (event: PointerEvent) => {
        let dragStarted = false;
        const DRAG_THRESHOLD = 3;

        if (stage !== "playing") return;

        event.preventDefault();
        playSound(dragSoundRef, true);

        try {
          card.setPointerCapture?.(event.pointerId);
        } catch {}

        const rect = card.getBoundingClientRect();
        const scrollY = scrollContainer?.scrollTop ?? 0;
        const plateRect = plate.getBoundingClientRect();

        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;

        const originalPosition = card.style.position;
        const originalLeft = card.style.left;
        const originalTop = card.style.top;
        const originalZ = card.style.zIndex;

        const originX = rect.left;
        const originY = rect.top + scrollY;

        let isOverPlate = false;
        let dropHandled = false; // 🔒 prevents double logic

        const checkOverPlate = (x: number, y: number) =>
          x >= plateRect.left &&
          x <= plateRect.right &&
          y >= plateRect.top &&
          y <= plateRect.bottom;

        const returnCard = () => {
          if (dropHandled) return;
          dropHandled = true;

          const current = card.getBoundingClientRect();
          const scrollY = scrollContainer?.scrollTop ?? 0;

          const dx = originX - current.left;
          const dy = originY - (current.top + scrollY);

          card.style.transition = "translate 0.25s ease";
          // card.style.translate = `${dx}px ${dy}px`;

          setTimeout(() => {
            card.style.transition = "";

            card.style.position = originalPosition;
            card.style.left = originalLeft;
            card.style.top = originalTop;
            card.style.zIndex = originalZ;

            card.classList.remove("dragging", "correct", "wrong", "over-plate");
            plateBase.classList.remove("plate-hover", "plate-wrong");
          }, 260);
        };

        const onMove = (e: PointerEvent) => {
          const dx = Math.abs(e.clientX - event.clientX);
          const dy = Math.abs(e.clientY - event.clientY);

          if (!dragStarted) {
            if (dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) return;

            dragStarted = true;

            card.classList.add("dragging");
            card.style.position = "fixed";
            const scrollY = scrollContainer?.scrollTop ?? 0;

            card.style.left = `${originX}px`;
            card.style.top = `${originY - scrollY}px`;

            card.style.zIndex = "9999";

            card.style.transition = "none";
            // card.style.translate = "0 0";
            card.style.scale = "1";
          }

          card.style.left = `${e.clientX - offsetX}px`;
          card.style.top = `${e.clientY - offsetY}px`;

          const nowOver = checkOverPlate(e.clientX, e.clientY);
          if (nowOver !== isOverPlate) {
            isOverPlate = nowOver;

            if (isOverPlate) {
              card.classList.add("over-plate");
              plateBase.classList.add("plate-hover");
              if (!isHoveringPlateRef.current) {
                isHoveringPlateRef.current = true;
                playSound(hoverSoundRef, true);
              }
            } else {
              card.classList.remove("over-plate");
              plateBase.classList.remove("plate-hover");
              isHoveringPlateRef.current = false;
            }
          }
        };

        const onUp = () => {
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);

          if (!dragStarted) return;

          card.classList.remove("over-plate");
          plateBase.classList.remove("plate-hover");
          isHoveringPlateRef.current = false;

          if (isOverPlate) {
            const isCorrect = card.dataset.correct === "true";

            if (isCorrect && foodsContainer) {
              const emoji = card
                .querySelector(".food-emoji")
                ?.textContent?.trim();
              const label = card
                .querySelector(".food-label")
                ?.textContent?.trim();

              if (emoji && label) {
                if (!foodsContainer.querySelector(`[data-label="${label}"]`)) {
                  const chip = document.createElement("span");
                  chip.className = "plate-food-emoji";
                  chip.textContent = emoji;
                  chip.setAttribute("data-label", label);
                  foodsContainer.appendChild(chip);
                }
              }

              card.classList.add("correct");
              plateBase.classList.add("plate-correct");

              scoreRef.current = Math.min(
                MAX_SCORE,
                scoreRef.current + CORRECT_DELTA
              );
              updateMeter(scoreRef.current);
              playSound(correctSoundRef, true);

              placedCorrectRef.current += 1;
              if (placedCorrectRef.current >= totalCorrect) setShowNext(true);

              setTimeout(() => {
                card.classList.add("removed");
                setTimeout(() => (card.style.display = "none"), 250);
              }, 30);

              return;
            }

            // ❌ wrong ingredient
            card.classList.add("wrong");
            plateBase.classList.add("plate-wrong");

            scoreRef.current = Math.max(
              MIN_SCORE,
              scoreRef.current + WRONG_DELTA
            );
            updateMeter(scoreRef.current);
            playSound(wrongSoundRef, true);

            returnCard();
          } else {
            // ❌ dropped outside plate
            returnCard();
          }
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
      };

      card.addEventListener("pointerdown", onPointerDown);
      handlers.push({ el: card, handler: onPointerDown });
    });

    return () => {
      handlers.forEach(({ el, handler }) =>
        el.removeEventListener("pointerdown", handler)
      );
    };
  }, [currentDishIndex, stage, shuffledCards]); // ⬅️ re-run when plate OR stage changes

  const goToNextOrFinish = () => {
    const foodsContainer = document.querySelector<HTMLElement>(".plate-foods");
    const plateBase = document.querySelector<HTMLElement>(".plate-base");

    // clear plate visuals
    if (foodsContainer) foodsContainer.innerHTML = "";
    if (plateBase)
      plateBase.classList.remove("plate-hover", "plate-correct", "plate-wrong");

    // ✅ Reset all cards back to initial state
    const allCards = document.querySelectorAll<HTMLElement>(".food-card");
    allCards.forEach((card) => {
      card.style.display = "flex";
      card.classList.remove("removed", "correct", "wrong", "dragging");
      card.style.position = "";
      card.style.left = "";
      card.style.top = "";
      card.style.zIndex = "";
    });

    if (currentDishIndex < dishes.length - 1) {
      // move to next dish
      setTimeout(() => {
        setShowNext(false);
        setCurrentDishIndex((prev) => prev + 1);
        placedCorrectRef.current = 0;
      }, 100);
    } else {
      // all dishes done -> show result modal
      setTimeout(() => {
        setShowResult(true);
      }, 200);
    }
  };

  // ===== Result message based on final score =====
  const getResultCopy = () => {
    const score = scoreRef.current;
    if (score >= 80) {
      return {
        title: "Feast Master! 🏆",
        body: "You built a plate that would make any German grandma proud. Your choices show a strong grasp of traditional dishes.",
      };
    } else if (score >= 50) {
      return {
        title: "Tasty effort! 😋",
        body: "Nice job! You selected many of the right ingredients. With a bit more practice, your plate will look completely authentic.",
      };
    } else {
      return {
        title: "Nice start – let’s refine your plate 🌱",
        body: "Some imposters sneaked onto your plate this time. Try again, focus on the core German dishes, and you’ll improve quickly.",
      };
    }
  };

  const resultCopy = getResultCopy();

  const handlePlayAgain = () => {
    window.location.reload();
  };

  const handleFinish = async () => {
    try {
      if (email) {
        await fetch(`${API_URL}/usergame`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            level3Score: scoreRef.current,
            userLevel: 4, // unlock next level
          }),
        });
      }
    } catch (err) {
      console.error("Error updating Level 3 score:", err);
    }

    if (email) {
      window.location.href = `/user?email=${encodeURIComponent(email)}`;
    } else {
      window.location.href = "/user";
    }
  };

  const displayScore = scoreRef.current;

  // Small loading screen while fetching dishes the first time
  if (!levelLoaded) {
    return (
      <div className="level3-container">
        <div className="welcome-screen">
          <h2>Loading your Tradition Feast…</h2>
          <p>Please wait while we fetch your personalized dishes ⚙️</p>
        </div>
      </div>
    );
  }

  return (
    <div className="level3-container">
      {/* 🌟 WELCOME OVERLAY */}
      {stage === "welcome" && (
        <div className="welcome-screen">
          <h2>Ready for the Tradition Feast?</h2>
          <p>
            You&apos;ll see a German dish in the center. Drag the ingredients
            that truly belong on this plate and avoid the imposters.
          </p>
          <button
            className="game-modal-button"
            onClick={() => {
              setStage("countdown");
              setCountdown(3);
              playSound(countdownSoundRef, true);
            }}
          >
            Start level
          </button>
        </div>
      )}

      {/* ⏳ COUNTDOWN OVERLAY */}
      {stage === "countdown" && countdown !== null && (
        <div className="countdown-screen">
          <p>Get ready...</p>
          <h1>{countdown}</h1>
        </div>
      )}

      <div className="level3-header">
        <h1 className="level3-title">Tradition Feast</h1>
        <p className="level3-subtitle">
          Build your German plate by adding the right ingredients.
        </p>
      </div>

      {/* Question + Performance meter row */}
      <div className="level3-top-row">
        <div className="level3-question">
          <p>
            {userName}, can you name the correct ingredients for
            <span className="dish-name"> {currentDish?.name}</span>?
          </p>
        </div>

        <div className="score-meter">
          <div className="score-circle">
            <svg viewBox="0 0 120 120">
              <circle className="bg" cx="60" cy="60" r="52" />
              <circle className="progress" cx="60" cy="60" r="52" />
            </svg>
            <div className="score-text" id="scoreDisplay">
              0
            </div>
          </div>
          <p className="score-label">Performance</p>
        </div>
      </div>

      {/* Place setting: placemat + fork + plate + knife */}
      <div className="place-setting">
        <div className="placemat-wrapper">
          <div className="placemat">
            {/* Fork */}
            <div className="cutlery fork">
              <div className="fork-head">
                <span className="fork-tine" />
                <span className="fork-tine" />
                <span className="fork-tine" />
                <span className="fork-tine" />
              </div>
              <div className="fork-handle" />
            </div>

            {/* Plate in the center */}
            <div className="plate-wrapper">
              <div className="plate-area">
                <div className="plate-shadow" />
                <div className="plate-base">
                  <div className="plate-inner">
                    {/* emojis placed on plate */}
                    <div className="plate-foods" />
                  </div>
                </div>
              </div>
            </div>

            {/* Knife */}
            <div className="cutlery knife">
              <div className="knife-blade" />
              <div className="knife-handle" />
            </div>

            {/* Bubble cards around the whole placemat */}
            <div className="card-ring">
              {shuffledCards.map((card) => (
                <div
                  key={card.label}
                  className="food-card"
                  data-label={card.label}
                  data-correct={card.isCorrect ? "true" : "false"}
                >
                  <span className="food-emoji">{card.emoji}</span>
                  <span className="food-label">{card.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {showNext && (
          <button className="plate-next-button" onClick={goToNextOrFinish}>
            {currentDishIndex < dishes.length - 1
              ? "Next Dish"
              : "Finish Feast"}
          </button>
        )}
      </div>

      {/* GAME RESULT MODAL */}
      {showResult && (
        <div className="game-modal-backdrop">
          <div className="game-modal">
            <p className="game-modal-eyebrow">Tradition Feast Completed</p>
            <h3 className="game-modal-title">{resultCopy.title}</h3>

            <div className="game-modal-score-pill">
              <span>Final performance</span>
              <span>{displayScore}</span>
            </div>

            <p className="game-modal-body">{resultCopy.body}</p>

            <div className="modal-buttons">
              <button className="game-modal-button" onClick={handlePlayAgain}>
                Play again
              </button>
              <button className="game-modal-button" onClick={handleFinish}>
                Return home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
