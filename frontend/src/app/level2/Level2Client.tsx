"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import "./page.css";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (() => {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  })();

type DropState = "idle" | "hover" | "correct" | "wrong";
type EndReason = "time" | "completed" | null;

type Card = {
  emoji: string;
  label: string;
  isCorrect: boolean;
  origin: string;
  info?: string; // ✅ NEW
};

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

interface Level2Data {
  email: string;
  region?: string;
  theme?: string;
  difficulty?: string;
  cards: Card[];
  modelUsed?: string;
  generatedAt?: string;
}

const SCORE_MIN = -3;
const SCORE_MAX = 3;
const INITIAL_TIME = 90; // seconds

// fallback cards in case backend fails (same as before)
const FALLBACK_CARDS: Card[] = [
  // ✅ Correct (Berlin / Germany style foods)
  {
    emoji: "🥨",
    label: "Pretzel",
    isCorrect: true,
    origin: "Bavaria, Germany",
  },
  {
    emoji: "🌭",
    label: "Currywurst",
    isCorrect: true,
    origin: "Berlin, Germany",
  },
  { emoji: "🥙", label: "Döner", isCorrect: true, origin: "Berlin, Germany" },
  {
    emoji: "🍛",
    label: "Kebab Teller",
    isCorrect: true,
    origin: "Germany (Turkish–German cuisine)",
  },
  {
    emoji: "🍟",
    label: "Currywurst & Fries",
    isCorrect: true,
    origin: "Berlin, Germany",
  },
  {
    emoji: "🍩",
    label: "Berliner",
    isCorrect: true,
    origin: "Berlin, Germany",
  },

  // ❌ Wrong / imposters
  { emoji: "🍕", label: "Pizza", isCorrect: false, origin: "Naples, Italy" },
  { emoji: "🍣", label: "Sushi", isCorrect: false, origin: "Japan" },
  { emoji: "🌮", label: "Taco", isCorrect: false, origin: "Mexico" },
  { emoji: "🥐", label: "Croissant", isCorrect: false, origin: "France" },
];

// small helper to shuffle once
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function Level2Client() {
  const params = useSearchParams();
  const email = params.get("email");

  const [user, setUser] = useState<User | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [level2Data, setLevel2Data] = useState<Level2Data | null>(null);
  const [cards, setCards] = useState<Card[]>(FALLBACK_CARDS);
  const [levelLoaded, setLevelLoaded] = useState(false);

  const [regionLabel, setRegionLabel] = useState("Germany");
  const isDraggingRef = useRef<boolean[]>(
    Array(FALLBACK_CARDS.length).fill(false)
  );
  const [openInfoId, setOpenInfoId] = useState<number | null>(null);

  const toggleInfo = (id: number) => {
    setOpenInfoId((prev) => (prev === id ? null : id));
  };
  // derived name from user
  const userName = user?.firstName || "Explorer";

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

  const animateBackFromReleaseSide = (
    cardIndex: number,
    el: HTMLElement,
    releaseCX: number,
    releaseCY: number
  ) => {
    const area = areaRef.current;
    if (!area) return;

    const areaRect = area.getBoundingClientRect();
    const cardRect = el.getBoundingClientRect();

    const cardW = cardRect.width;
    const cardH = cardRect.height;

    // final floating position (top-left translate)
    const to = posRef.current[cardIndex];
    const toX = to.x;
    const toY = to.y;

    // release point converted to floating-area coordinates (top-left translate)
    const relX = releaseCX - areaRect.left - cardW / 2;
    const relY = releaseCY - areaRect.top - cardH / 2;

    // detect which side user released from (OUTSIDE area)
    let side: "left" | "right" | "top" | "bottom";

    if (releaseCX < areaRect.left) side = "left";
    else if (releaseCX > areaRect.right) side = "right";
    else if (releaseCY < areaRect.top) side = "top";
    else if (releaseCY > areaRect.bottom) side = "bottom";
    else {
      // if released INSIDE area (but outside bucket), choose nearest edge
      const leftDist = Math.abs(releaseCX - areaRect.left);
      const rightDist = Math.abs(areaRect.right - releaseCX);
      const topDist = Math.abs(releaseCY - areaRect.top);
      const bottomDist = Math.abs(areaRect.bottom - releaseCY);
      const minDist = Math.min(leftDist, rightDist, topDist, bottomDist);

      if (minDist === leftDist) side = "left";
      else if (minDist === rightDist) side = "right";
      else if (minDist === topDist) side = "top";
      else side = "bottom";
    }

    const pad = 30;
    let fromX = toX;
    let fromY = toY;

    if (side === "left") {
      fromX = -cardW - pad;
      fromY = clamp(relY, 0, areaRect.height - cardH);
    } else if (side === "right") {
      fromX = areaRect.width + pad;
      fromY = clamp(relY, 0, areaRect.height - cardH);
    } else if (side === "top") {
      fromY = -cardH - pad;
      fromX = clamp(relX, 0, areaRect.width - cardW);
    } else {
      fromY = areaRect.height + pad;
      fromX = clamp(relX, 0, areaRect.width - cardW);
    }

    // PAUSE floating while throw-back runs (so loop doesn't overwrite transform)
    isDraggingRef.current[cardIndex] = true;

    el.style.setProperty("--from-x", `${fromX}px`);
    el.style.setProperty("--from-y", `${fromY}px`);
    el.style.setProperty("--to-x", `${toX}px`);
    el.style.setProperty("--to-y", `${toY}px`);

    el.classList.remove("throw-back");
    void el.offsetHeight; // restart animation
    el.classList.add("throw-back");

    window.setTimeout(() => {
      el.classList.remove("throw-back");
      el.style.transform = `translate(${toX}px, ${toY}px)`;
      isDraggingRef.current[cardIndex] = false; // resume floating
    }, 350);
  };

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

  // === Fetch Level 2 data (cards) ===
  useEffect(() => {
    if (!email) return;

    const fetchLevel2 = async () => {
      try {
        const res = await fetch(
          `${API_URL}/ai/level2/${encodeURIComponent(email)}/get`
        );

        if (!res.ok) {
          console.warn("No Level 2 found, using fallback cards.");
          setLevel2Data(null);
          setCards(FALLBACK_CARDS);
          setRegionLabel(userInfo?.regionPreference || "Germany");
          setLevelLoaded(true);
          return;
        }

        const data: Level2Data = await res.json();
        if (!data.cards || !Array.isArray(data.cards)) {
          console.warn("Level 2 response has no cards, using fallback.");
          setLevel2Data(null);
          setCards(FALLBACK_CARDS);
          setRegionLabel(userInfo?.regionPreference || "Germany");
        } else {
          setLevel2Data(data);
          setCards(data.cards);
          setRegionLabel(
            data.region || userInfo?.regionPreference || "Germany"
          );
        }
      } catch (err) {
        console.error("Error fetching Level 2 data:", err);
        setLevel2Data(null);
        setCards(FALLBACK_CARDS);
        setRegionLabel(userInfo?.regionPreference || "Germany");
      } finally {
        setLevelLoaded(true);
      }
    };

    fetchLevel2();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  // If userInfo arrives later and region wasn't set from backend, use it
  useEffect(() => {
    if (!level2Data && userInfo?.regionPreference) {
      setRegionLabel(userInfo.regionPreference);
    }
  }, [userInfo, level2Data]);

  // ===================== GAME STATE =====================

  const areaRef = useRef<HTMLDivElement | null>(null);
  const dropRef = useRef<HTMLDivElement | null>(null);
  // ✅ score fly FX ( +1 / -1 flying from bucket to score )
  const scoreValueRef = useRef<HTMLSpanElement | null>(null);

  type ScoreFx = {
    id: number;
    text: "+1" | "-1";
    kind: "good" | "bad";
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  };

  const [scoreFx, setScoreFx] = useState<ScoreFx[]>([]);

  const spawnScoreFx = (delta: 1 | -1) => {
    const drop = dropRef.current;
    if (!drop) return;

    const dropRect = drop.getBoundingClientRect();

    // start point: inside bucket (feels like it comes from it)
    const fromX = dropRect.left + dropRect.width / 2;
    const fromY = dropRect.top + dropRect.height * 0.42;

    // end point: score number (Culture meter)
    const scoreEl = scoreValueRef.current;
    const scoreRect = scoreEl?.getBoundingClientRect();

    const toX = scoreRect
      ? scoreRect.left + scoreRect.width / 2
      : fromX + (delta === 1 ? 60 : -60);

    const toY = scoreRect ? scoreRect.top + scoreRect.height / 2 : fromY - 140;

    const id = Date.now() + Math.floor(Math.random() * 100000);

    setScoreFx((prev) => [
      ...prev,
      {
        id,
        text: delta === 1 ? "+1" : "-1",
        kind: delta === 1 ? "good" : "bad",
        fromX,
        fromY,
        toX,
        toY,
      },
    ]);
  };

  const removeScoreFx = (id: number) => {
    setScoreFx((prev) => prev.filter((fx) => fx.id !== id));
  };

  // 🌟 random order of the cards
  const [order] = useState<number[]>(() =>
    shuffle(Array.from({ length: FALLBACK_CARDS.length }, (_, i) => i))
  );

  // 🌟 activeSlots = up to 5 card indices (rest stay in queue)
  const [activeSlots, setActiveSlots] = useState<(number | null)[]>(() =>
    order.slice(0, 5)
  );
  const activeSlotsRef = useRef<(number | null)[]>(activeSlots);
  useEffect(() => {
    activeSlotsRef.current = activeSlots;
  }, [activeSlots]);

  const orderRef = useRef(order);

  // tracking which correct cards were successfully collected
  const [collectedCorrectIds, setCollectedCorrectIds] = useState<number[]>([]);
  const collectedCorrectIdsRef = useRef<number[]>([]);
  useEffect(() => {
    collectedCorrectIdsRef.current = collectedCorrectIds;
  }, [collectedCorrectIds]);

  // tracking which WRONG cards the player dropped into the bucket
  const [collectedWrongIds, setCollectedWrongIds] = useState<number[]>([]);
  const collectedWrongIdsRef = useRef<number[]>([]);
  useEffect(() => {
    collectedWrongIdsRef.current = collectedWrongIds;
  }, [collectedWrongIds]);

  const [dropState, setDropState] = useState<DropState>("idle");
  const [score, setScore] = useState(0);

  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [gameOver, setGameOver] = useState(false);
  const [endReason, setEndReason] = useState<EndReason>(null);

  // 🌟 stage & countdown (welcome → countdown → playing)
  const [stage, setStage] = useState<"welcome" | "countdown" | "playing">(
    "welcome"
  );
  const [countdown, setCountdown] = useState<number | null>(null);

  // dragging
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const draggingRef = useRef<HTMLElement | null>(null);
  const draggingIndexRef = useRef<number | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // positions & velocities per card index (0–9)
  const posRef = useRef<{ x: number; y: number }[]>(
    Array(FALLBACK_CARDS.length)
      .fill(0)
      .map(() => ({ x: 0, y: 0 }))
  );
  const velRef = useRef<{ x: number; y: number }[]>([
    { x: 1.4, y: 1.8 },
    { x: -1.6, y: 1.2 },
    { x: 1.1, y: -1.4 },
    { x: -1.3, y: -1.7 },
    { x: 1.7, y: 1.1 },
    { x: -1.2, y: 1.6 },
    { x: 1.5, y: -1.5 },
    { x: -1.4, y: 1.4 },
    { x: 1.2, y: 1.6 },
    { x: -1.1, y: -1.3 },
  ]);

  const animationFrameId = useRef<number | null>(null);

  // 🔊 AUDIO REFS
  const countdownSoundRef = useRef<HTMLAudioElement | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const tickRef = useRef<HTMLAudioElement | null>(null);
  const dragSoundRef = useRef<HTMLAudioElement | null>(null);
  const hoverSoundRef = useRef<HTMLAudioElement | null>(null);
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const wrongSoundRef = useRef<HTMLAudioElement | null>(null);
  const gameOverSoundRef = useRef<HTMLAudioElement | null>(null);

  // track entering/leaving bucket hover to not spam hover sound
  const isHoveringDropRef = useRef(false);

  // init audio once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    countdownSoundRef.current = new Audio("/assets/audio/countdown.mp3");
    bgMusicRef.current = new Audio("/assets/audio/bg-music.mp3");
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
        if (a) a.pause();
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

  // helper: get next card to spawn in a freed slot
  const getNextCardIndex = (removedIndex: number): number | null => {
    const active = activeSlotsRef.current;
    const collected = collectedCorrectIdsRef.current;

    // 1️⃣ First, try to spawn any remaining correct card
    for (const idx of orderRef.current) {
      if (
        idx !== removedIndex &&
        !active.includes(idx) &&
        !collected.includes(idx) &&
        cards[idx]?.isCorrect
      ) {
        return idx;
      }
    }

    // 2️⃣ If no correct left in queue, spawn any remaining (wrong) card
    for (const idx of orderRef.current) {
      if (
        idx !== removedIndex &&
        !active.includes(idx) &&
        !collected.includes(idx)
      ) {
        return idx;
      }
    }

    return null;
  };

  // ===============================================
  // 🟠 FLOATING ANIMATION
  // ===============================================
  useEffect(() => {
    const loop = () => {
      const area = areaRef.current;
      if (!area) {
        animationFrameId.current = window.requestAnimationFrame(loop);
        return;
      }

      const areaRect = area.getBoundingClientRect();
      const areaWidth = areaRect.width;
      const areaHeight = areaRect.height;

      const activeIndices = activeSlotsRef.current.filter(
        (i): i is number => i !== null
      );

      const anchors = [
        { x: areaWidth * 0.1, y: areaHeight * 0.25 },
        { x: areaWidth * 0.55, y: areaHeight * 0.15 },
        { x: areaWidth * 0.4, y: areaHeight * 0.3 },
        { x: areaWidth * 0.7, y: areaHeight * 0.45 },
        { x: areaWidth * 0.18, y: areaHeight * 0.35 },
      ];

      activeIndices.forEach((cardIndex) => {
        const el = cardRefs.current[cardIndex];
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const pos = posRef.current[cardIndex];
        const vel = velRef.current[cardIndex];
        // ⛔ Skip floating movement while dragging
        if (isDraggingRef.current[cardIndex]) return;

        if (pos.x === 0 && pos.y === 0) {
          const slotIdx =
            activeSlotsRef.current.findIndex((idx) => idx === cardIndex) ?? 0;
          const anchor = anchors[slotIdx % anchors.length];
          pos.x = anchor.x;
          pos.y = anchor.y;
        }

        pos.x += vel.x;
        pos.y += vel.y;

        if (pos.x <= 0 || pos.x + rect.width >= areaWidth) vel.x *= -1;
        if (pos.y <= 0 || pos.y + rect.height >= areaHeight) vel.y *= -1;

        el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      });

      animationFrameId.current = window.requestAnimationFrame(loop);
    };

    animationFrameId.current = window.requestAnimationFrame(loop);

    return () => {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // ===============================================
  // ⏱ TIMER
  // ===============================================
  useEffect(() => {
    if (gameOver || stage !== "playing") return;

    if (timeLeft <= 0) {
      setGameOver(true);
      setEndReason("time");
      return;
    }

    const intervalId = window.setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [timeLeft, gameOver, stage]);

  // 🔊 tick-tock sound when <= 5s
  useEffect(() => {
    if (stage === "playing" && !gameOver && timeLeft > 0 && timeLeft <= 5) {
      playSound(tickRef, false);
    } else {
      stopSound(tickRef, false);
    }
  }, [timeLeft, stage, gameOver]);

  // ===============================================
  // 🎬 COUNTDOWN
  // ===============================================
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

  // 🔊 bg music
  useEffect(() => {
    if (stage === "playing" && !gameOver) {
      playSound(bgMusicRef, true);
    } else if (stage === "welcome") {
      stopSound(bgMusicRef);
    }
  }, [stage, gameOver]);

  // ===============================================
  // ✅ END WHEN ALL CORRECT CARDS ARE USED
  // ===============================================
  const TOTAL_CORRECT = cards.filter((c) => c.isCorrect).length;

  useEffect(() => {
    if (
      !gameOver &&
      collectedCorrectIds.length === TOTAL_CORRECT &&
      TOTAL_CORRECT > 0
    ) {
      setGameOver(true);
      setEndReason("completed");
    }
  }, [collectedCorrectIds, gameOver, TOTAL_CORRECT]);

  // 🔊 Game over sound
  useEffect(() => {
    if (gameOver) {
      stopSound(bgMusicRef);
      stopSound(tickRef, false);
      playSound(gameOverSoundRef, true);
    }
  }, [gameOver]);

  // ===============================================
  // 🟠 DRAG EVENTS
  // ===============================================
  const startDrag = (clientX: number, clientY: number, cardIndex: number) => {
    const ref = cardRefs.current[cardIndex];
    if (!ref || gameOver || stage !== "playing") return;

    draggingRef.current = ref;
    draggingIndexRef.current = cardIndex;
    setDropState("idle");

    const rect = ref.getBoundingClientRect();
    dragOffsetRef.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };

    isDraggingRef.current[cardIndex] = true;
    ref.classList.add("dragging");
    ref.style.transform = "none";
    ref.style.position = "fixed";
    ref.style.left = `${rect.left}px`;
    ref.style.top = `${rect.top}px`;

    playSound(dragSoundRef, true);
  };

  // 1) generic function that moves the dragged card
  const updateDragPosition = (clientX: number, clientY: number) => {
    if (!draggingRef.current || gameOver || stage !== "playing") return;

    const el = draggingRef.current;
    const { x, y } = dragOffsetRef.current;

    el.style.left = `${clientX - x}px`;
    el.style.top = `${clientY - y}px`;

    const drop = dropRef.current;
    if (!drop) return;

    const cardRect = el.getBoundingClientRect();
    const dropRect = drop.getBoundingClientRect();

    const isInside =
      cardRect.right > dropRect.left &&
      cardRect.left < dropRect.right &&
      cardRect.bottom > dropRect.top &&
      cardRect.top < dropRect.bottom;

    setDropState(isInside ? "hover" : "idle");

    if (isInside && !isHoveringDropRef.current) {
      isHoveringDropRef.current = true;
      playSound(hoverSoundRef, true);
    } else if (!isInside && isHoveringDropRef.current) {
      isHoveringDropRef.current = false;
    }
  };

  // 2) desktop mouse uses it
  const onMouseMove = (e: MouseEvent) => {
    updateDragPosition(e.clientX, e.clientY);
  };

  const stopDrag = () => {
    if (gameOver || stage !== "playing") return;

    const drop = dropRef.current;
    const el = draggingRef.current;
    const cardIndex = draggingIndexRef.current;

    if (!drop || !el || cardIndex === null) return;

    const card = cards[cardIndex];
    if (!card) {
      draggingRef.current = null;
      draggingIndexRef.current = null;
      return;
    }

    const cardRect = el.getBoundingClientRect();
    const dropRect = drop.getBoundingClientRect();

    const inside =
      cardRect.right > dropRect.left &&
      cardRect.left < dropRect.right &&
      cardRect.bottom > dropRect.top &&
      cardRect.top < dropRect.bottom;

    const resetDragStyles = () => {
      el.classList.remove("dragging");
      el.style.position = "";
      el.style.left = "";
      el.style.top = "";
    };

    isHoveringDropRef.current = false;

    // --------------------------------------------------
    // ✔️ CASE 1 — CORRECT DROP
    // --------------------------------------------------
    if (inside && card.isCorrect) {
      isDraggingRef.current[cardIndex] = false; // ← ADD HERE

      setScore((prev) => prev + 1);
      spawnScoreFx(1);

      setDropState("correct");
      el.classList.add("vanish");
      playSound(correctSoundRef, true);

      setTimeout(() => {
        resetDragStyles();

        setCollectedCorrectIds((prev) =>
          prev.includes(cardIndex) ? prev : [...prev, cardIndex]
        );

        const currentPos = { ...posRef.current[cardIndex] };
        const nextCardIndex = getNextCardIndex(cardIndex);

        setActiveSlots((prev) => {
          const slotIndex = prev.findIndex((idx) => idx === cardIndex);
          if (slotIndex === -1) return prev;

          const updated = [...prev];
          updated[slotIndex] = nextCardIndex;

          if (nextCardIndex !== null) {
            posRef.current[nextCardIndex] = { ...currentPos };
            const nextEl = cardRefs.current[nextCardIndex];
            if (nextEl) {
              nextEl.style.transform = `translate(${currentPos.x}px, ${currentPos.y}px)`;
            }
          }

          return updated;
        });

        setDropState("idle");
      }, 350);

      draggingRef.current = null;
      draggingIndexRef.current = null;
      return;
    }

    // --------------------------------------------------
    // ❌ CASE 2 — WRONG DROP
    // --------------------------------------------------
    if (inside && !card.isCorrect) {
      isDraggingRef.current[cardIndex] = false; // ← ADD HERE

      setScore((prev) => prev - 1);
      spawnScoreFx(-1);

      setDropState("wrong");

      setCollectedWrongIds((prev) =>
        prev.includes(cardIndex) ? prev : [...prev, cardIndex]
      );

      playSound(wrongSoundRef, true);

      setTimeout(() => {
        resetDragStyles();

        // ✅ animate from bucket-bottom to the card's stored floating position
        const area = areaRef.current;
        const drop = dropRef.current;
        if (!area || !drop) return;

        const areaRect = area.getBoundingClientRect();
        const dropRect2 = drop.getBoundingClientRect();

        // "from" = bottom center of bucket (relative to floating-area)
        const fromX = dropRect2.left + dropRect2.width / 2 - areaRect.left - 40; // 40 = half card size (80/2)
        const fromY = dropRect2.bottom - areaRect.top; // start from bucket bottom

        // "to" = card's saved position inside floating-area
        const to = posRef.current[cardIndex];
        const toX = to.x;
        const toY = to.y;

        // set css variables for animation
        el.style.setProperty("--from-x", `${fromX}px`);
        el.style.setProperty("--from-y", `${fromY}px`);
        el.style.setProperty("--to-x", `${toX}px`);
        el.style.setProperty("--to-y", `${toY}px`);

        // run animation
        el.classList.remove("throw-back"); // restart-safe
        void el.offsetHeight; // force reflow so animation restarts
        el.classList.add("throw-back");

        // after animation, clean and continue floating normally
        window.setTimeout(() => {
          el.classList.remove("throw-back");

          // ensure final position is exactly the floating position
          el.style.transform = `translate(${toX}px, ${toY}px)`;

          setDropState("idle");
        }, 350);
      }, 0);

      draggingRef.current = null;
      draggingIndexRef.current = null;
      return;
    }

    // --------------------------------------------------
    // 🟡 CASE 3 — DRAG ENDED OUTSIDE BUCKET
    // --------------------------------------------------
    const releaseRect = el.getBoundingClientRect();
    const releaseCX = releaseRect.left + releaseRect.width / 2;
    const releaseCY = releaseRect.top + releaseRect.height / 2;

    resetDragStyles();

    // ✅ now animate using the REAL release position
    animateBackFromReleaseSide(cardIndex, el, releaseCX, releaseCY);
    draggingRef.current = null;
    draggingIndexRef.current = null;
    setDropState("idle");
  };
  // === Update User Score on Finish (Level 2) ===
  const handleFinish = async () => {
    try {
      if (!email) return;

      await fetch(`${API_URL}/usergame`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          // 👇 adjust field names if your backend is different
          level2Score: score,
          userLevel: 3, // unlock next level
        }),
      });

      console.log("✅ Level 2 score updated successfully!");
    } catch (err) {
      console.error("Error updating Level 2 score:", err);
    }

    // optional: extra sound control on finish (bg already stopped on gameOver)
    stopSound(bgMusicRef);
    // playSound(gameOverSoundRef); // only if you want to replay it here

    // Go back to user dashboard
    window.location.href = `/user?email=${encodeURIComponent(email || "")}`;
  };

  useEffect(() => {
    // 🖱️ Desktop
    const handleMouseMove = (e: MouseEvent) => {
      onMouseMove(e);
    };
    const handleMouseUp = (e: MouseEvent) => {
      stopDrag();
    };

    // 📱 Mobile touch
    const handleTouchMove = (e: TouchEvent) => {
      if (!draggingRef.current || gameOver || stage !== "playing") return;

      const touch = e.touches[0];
      if (!touch) return;

      // important so the browser doesn't treat it as scroll/zoom
      e.preventDefault();
      updateDragPosition(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      stopDrag();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // 👇 note the `{ passive: false }` so preventDefault works
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [gameOver, stage]);

  // === Preloader Effect ===
  useEffect(() => {
    const timer = setTimeout(() => {
      const preloader = document.getElementById("preloader");
      if (preloader) preloader.style.display = "none";
    }, 150);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // === Score bar calculation ===
  const clampedScore = Math.max(SCORE_MIN, Math.min(SCORE_MAX, score));
  const safeFillPercent =
    ((clampedScore - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * 100;

  const displayScore = score > 0 ? `+${score}` : `${score}`;

  const formattedTime = `0:${timeLeft.toString().padStart(2, "0")}`;
  const timerClass =
    timeLeft <= 5 ? "timer-pill timer-pill--warning" : "timer-pill";

  const getResultCopy = () => {
    if (score >= 4) {
      return {
        title: "Nice! Your regional radar is strong 🎉",
        body: `Great job, ${userName}! You handled a busy screen of foods and still caught the ${regionLabel} classics in time.`,
      };
    } else if (score >= 1) {
      return {
        title: "Good start! You’re getting there 💪",
        body: `Not bad, ${userName}! With more practice spotting ${regionLabel} dishes under time pressure, you'll get even faster.`,
      };
    } else {
      return {
        title: "Nice try – every expert starts here 🌱",
        body: `Don't worry, ${userName}. This round was intense – lots of imposters and a ticking clock. Try again and you'll improve quickly.`,
      };
    }
  };

  const resultCopy = getResultCopy();

  // If level not loaded yet, show small loading overlay
  if (!levelLoaded) {
    return (
      <div className="level2-container">
        <div className="welcome-screen">
          <h2>Loading your regional quest…</h2>
          <p>Please wait while we fetch your personalized food cards ⚙️</p>
        </div>
      </div>
    );
  }

  return (
    <div className="level2-container">
      {/* ✅ +1 / -1 flying FX layer */}
      <div className="score-fx-layer" aria-hidden="true">
        {scoreFx.map((fx) => (
          <div
            key={fx.id}
            className={`score-fx score-fx--${fx.kind}`}
            style={
              {
                ["--from-x" as any]: `${fx.fromX}px`,
                ["--from-y" as any]: `${fx.fromY}px`,
                ["--to-x" as any]: `${fx.toX}px`,
                ["--to-y" as any]: `${fx.toY}px`,
              } as React.CSSProperties
            }
            onAnimationEnd={() => removeScoreFx(fx.id)}
          >
            {fx.text}
            {/* tiny burst for “good” */}
            {fx.kind === "good" && <span className="score-fx-spark" />}
          </div>
        ))}
      </div>

      {/* 🌟 WELCOME OVERLAY */}
      {stage === "welcome" && (
        <div className="welcome-screen">
          {error && (
            <p style={{ color: "salmon", marginBottom: "6px" }}>{error}</p>
          )}
          <h2>Ready to play, {userName}?</h2>
          <p>
            You’ll see 5 foods at a time – some real {regionLabel} vibes, some
            total imposters. Drag the typical {regionLabel} foods into the
            bucket before the time runs out!
          </p>
          <button
            className="game-modal-button"
            onClick={() => {
              setStage("countdown");
              setCountdown(3);
              playSound(countdownSoundRef, true);
            }}
          >
            Start challenge
          </button>
        </div>
      )}

      {/* ⏳ COUNTDOWN OVERLAY */}
      {stage === "countdown" && countdown !== null && (
        <div className="countdown-screen">
          <p>Ready, steady...</p>
          <h1>{countdown}</h1>
        </div>
      )}

      {/* HEADER */}
      <div className="level2-header">
        <p className="level2-eyebrow">{regionLabel} · Mini Game</p>
        <h2 className="level2-title">{regionLabel} Food Challenge</h2>
        <p className="level2-subtitle">
          There are {cards.length} foods in total, but only 5 float at once.
          Catch the real {regionLabel} dishes – wrong picks waste time and
          points.
        </p>
      </div>

      {/* CULTURE METER */}
      <div className="score-section score-section--top">
        <div className="score-label-row">
          <span className="score-title">Culture meter</span>
          <span className="score-value" ref={scoreValueRef}>
            {displayScore}
          </span>
        </div>
        <div className="score-bar">
          <div
            className="score-bar-fill"
            style={{ width: `${safeFillPercent}%` }}
          />
        </div>
        <div className="score-bar-scale">
          <span>Low</span>
          <span>High</span>
        </div>
        <div className="score-top-row">
          <div className={timerClass}>
            <span className="timer-icon">⏱</span>
            <span className="timer-value">{formattedTime}</span>
          </div>
        </div>
      </div>

      {/* FLOATING CARDS */}
      <div className="floating-area" ref={areaRef}>
        {activeSlots.map((cardIndex) => {
          if (cardIndex === null) return null;
          const card = cards[cardIndex];
          if (!card) return null;
          return (
            <div
              key={cardIndex}
              className="floating-card"
              ref={(el) => {
                cardRefs.current[cardIndex] = el;
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                startDrag(e.clientX, e.clientY, cardIndex);
              }}
              onTouchStart={(e) => {
                const touch = e.touches[0];
                if (!touch) return;
                e.preventDefault();
                startDrag(touch.clientX, touch.clientY, cardIndex);
              }}
            >
              <span className="emoji">{card.emoji}</span>
              <p className="emoji-label">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* BUCKET */}
      <div className="bucket-section">
        <div className={`drop-zone drop-zone--${dropState}`} ref={dropRef}>
          <svg
            className="drop-icon"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--contrast-color)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="4" x2="12" y2="14" />
            <polyline points="8 12 12 16 16 12" />
          </svg>
        </div>

        <p className="bucket-title">{regionLabel} Bucket</p>
      </div>

      {/* GAME OVER MODAL */}
      {gameOver && (
        <div className="game-modal-backdrop">
          <div className="game-modal">
            <p className="game-modal-eyebrow">
              {endReason === "time" ? "Time’s up!" : "Round completed!"}
            </p>
            <h3 className="game-modal-title">{resultCopy.title}</h3>

            <div className="game-modal-score-pill">
              <span>Culture score</span>
              <span>{displayScore}</span>
            </div>

            <p className="game-modal-body">{resultCopy.body}</p>
            {/* FEEDBACK SECTION */}
            <div className="feedback-section">
              <h4 className="feedback-title">What was in your bucket?</h4>

              <div className="feedback-group">
                <h5 className="feedback-subtitle correct">
                  ✔ Correct {regionLabel} foods
                </h5>

                {collectedCorrectIds.length > 0 ? (
                  collectedCorrectIds.map((id) => {
                    const item = cards[id];
                    if (!item) return null;

                    const hasInfo = !!item.info && item.info.trim().length > 0;
                    const isOpen = openInfoId === id;

                    return (
                      <div key={id} className="feedback-row">
                        <div className="feedback-item correct">
                          <span className="feedback-emoji">{item.emoji}</span>
                          <span className="feedback-label">{item.label}</span>
                          <span className="feedback-origin">{item.origin}</span>

                          {hasInfo && (
                            <button
                              type="button"
                              className={`info-btn ${isOpen ? "is-open" : ""}`}
                              onClick={() => setOpenInfoId(isOpen ? null : id)}
                              aria-label={`More info about ${item.label}`}
                              title="Why this belongs to the region"
                            >
                              !
                            </button>
                          )}
                        </div>

                        {hasInfo && isOpen && (
                          <div className="info-panel">
                            <div className="info-panel-title">
                              <span className="info-dot" />
                              Why it fits {regionLabel}
                            </div>
                            <div className="info-panel-body">{item.info}</div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="feedback-empty">
                    You didn&apos;t catch any {regionLabel} classics this round.
                  </p>
                )}
              </div>

              <div className="feedback-group">
                <h5 className="feedback-subtitle wrong">✖ Wrong foods</h5>
                {collectedWrongIds.length > 0 ? (
                  collectedWrongIds.map((id) => {
                    const item = cards[id];
                    if (!item) return null;

                    return (
                      <div key={id} className="feedback-item wrong">
                        <span className="feedback-emoji">{item.emoji}</span>
                        <span className="feedback-label">{item.label}</span>
                        <span className="feedback-origin">{item.origin}</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="feedback-empty">
                    Nice! You didn&apos;t add any imposters.
                  </p>
                )}
              </div>
            </div>

            <div className="modal-buttons">
              <button
                className="game-modal-button"
                onClick={() => window.location.reload()}
              >
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
