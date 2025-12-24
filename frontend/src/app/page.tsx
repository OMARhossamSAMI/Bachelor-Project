"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Script from "next/script";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginProgress, setLoginProgress] = useState(0);
  const startLoginProgress = () => {
    setLoginProgress(10);

    const interval = setInterval(() => {
      setLoginProgress((p) => {
        if (p >= 90) return p;
        return p + Math.random() * 10;
      });
    }, 250);

    return interval;
  };
  const [registerLoading, setRegisterLoading] = useState(false);
  const waitAtLeast = (startTime: number, minMs: number) => {
    const elapsed = Date.now() - startTime;
    return elapsed < minMs
      ? new Promise((res) => setTimeout(res, minMs - elapsed))
      : Promise.resolve();
  };

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    (() => {
      throw new Error("NEXT_PUBLIC_API_URL is not defined");
    })();

  const router = useRouter();
  // First useEffect: Preloader
  useEffect(() => {
    const timer = setTimeout(() => {
      const preloader = document.getElementById("preloader");
      if (preloader) {
        preloader.style.display = "none";
      }
    }, 150);

    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    const handleScroll = () => {
      const header = document.getElementById("header");
      if (window.scrollY > 50) {
        header?.classList.add("scrolled");
      } else {
        header?.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    if (mobileMenu) {
      document.body.classList.add("mobile-nav-active");
    } else {
      document.body.classList.remove("mobile-nav-active");
    }

    // cleanup if component unmounts
    return () => {
      document.body.classList.remove("mobile-nav-active");
    };
  }, [mobileMenu]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setRegisterLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setRegisterLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      setSuccess("🎉 Account created successfully!");

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        setShowRegister(false);
        setShowLogin(true);
        setSuccess(null);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRegisterLoading(false);
    }
  };

  // === Handle login form submit (optional placeholder) ===
  // === Handle login form submit ===
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const email = (
      (e.target as HTMLFormElement).querySelector(
        "input[type='email']"
      ) as HTMLInputElement
    )?.value;

    const password = (
      (e.target as HTMLFormElement).querySelector(
        "input[type='password']"
      ) as HTMLInputElement
    )?.value;

    let progressInterval: any;
    const startTime = Date.now(); // ⏱️ track time

    try {
      setLoginLoading(true);
      setLoginProgress(0);
      progressInterval = startLoginProgress();

      const res = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid email or password.");
      }

      // ✅ ensure bar is visible for at least 1.2s
      await waitAtLeast(startTime, 1200);

      clearInterval(progressInterval);
      setLoginProgress(100);

      setSuccess("✅ Login successful! Redirecting...");

      setTimeout(() => {
        router.push(`/user?email=${encodeURIComponent(email || "")}`);
      }, 600);
    } catch (err: any) {
      clearInterval(progressInterval);
      setLoginProgress(100);
      setError(err.message || "An unexpected error occurred.");

      setTimeout(() => setLoginProgress(0), 800);
    } finally {
      setTimeout(() => setLoginLoading(false), 800);
    }
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
            <ul onClick={() => setMobileMenu(false)}>
              <li>
                <a href="#hero" className="active">
                  Home
                </a>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
            </ul>
            <i
              className={`mobile-nav-toggle d-xl-none bi ${
                mobileMenu ? "bi-x" : "bi-list"
              }`}
              onClick={() => setMobileMenu(!mobileMenu)}
            />
          </nav>

          <a
            href="#"
            className="btn-getstarted"
            onClick={(e) => {
              e.preventDefault(); // stop page jump
              setShowRegister(true); // open signup form
            }}
          >
            Get Started
          </a>
        </div>
      </header>
      <main className="main">
        {/* Hero Section */}
        <section id="hero" className="hero section">
          <div
            className="container d-flex flex-column justify-content-center align-items-center text-center position-relative"
            data-aos="zoom-out"
          >
            <img
              src="assets/img/Street Food-bro.svg"
              className="img-fluid animated"
              alt="FoodCulture Learning Journey"
            />
            <h1>
              Discover <span>German Food Culture</span>
            </h1>
            <p>
              Learn through stories, challenges, and experiences that bring
              culture to life.
            </p>

            <div className="d-flex flex-column flex-sm-row justify-content-center align-items-center gap-3 mt-3">
              <button
                onClick={() => setShowRegister(true)}
                className="btn-get-started scrollto"
              >
                Start Your Journey
              </button>
              <button
                onClick={() => setShowLogin(true)}
                className="btn-outline"
              >
                Sign In
              </button>
            </div>
          </div>
        </section>

        {/* === Register Modal === */}
        {showRegister && (
          <div className="popup-overlay" onClick={() => setShowRegister(false)}>
            <div className="popup-card" onClick={(e) => e.stopPropagation()}>
              {loginLoading && (
                <div className="login-progress-wrapper">
                  <div
                    className="login-progress-bar"
                    style={{ width: `${loginProgress}%` }}
                  />
                </div>
              )}

              <h3>Create Your Account</h3>
              <form className="popup-form" onSubmit={handleRegister}>
                <input
                  type="text"
                  placeholder="First Name"
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                <input
                  type="password"
                  placeholder="Password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                />

                {error && <p className="error-text">{error}</p>}
                {success && <p className="success-text">{success}</p>}

                <button
                  type="submit"
                  className="btn-get-started w-100 mt-2"
                  disabled={registerLoading}
                >
                  {registerLoading ? (
                    <span className="btn-loading">
                      <span className="spinner" /> Registering...
                    </span>
                  ) : (
                    "Register"
                  )}
                </button>
              </form>
              <p className="mt-2 small">
                Already have an account?{" "}
                <span
                  className="link"
                  onClick={() => {
                    setShowRegister(false);
                    setShowLogin(true);
                  }}
                >
                  Sign in here
                </span>
              </p>
            </div>

            {/* Inline styles for success/error boxes */}
            <style jsx>{`
              .error-text,
              .success-text {
                text-align: center;
                font-size: 0.95rem;
                font-weight: 500;
                padding: 10px 14px;
                border-radius: 8px;
                margin-top: 12px;
                margin-bottom: 4px;
                animation: fadeIn 0.4s ease-in-out;
              }

              .error-text {
                background: rgba(255, 77, 79, 0.15);
                color: #ff4d4f;
                border: 1px solid rgba(255, 77, 79, 0.5);
                box-shadow: 0 0 12px rgba(255, 77, 79, 0.3);
              }

              .success-text {
                background: rgba(76, 175, 80, 0.15);
                color: #4caf50;
                border: 1px solid rgba(76, 175, 80, 0.5);
                box-shadow: 0 0 12px rgba(76, 175, 80, 0.3);
              }

              @keyframes fadeIn {
                from {
                  opacity: 0;
                  transform: translateY(-5px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
          </div>
        )}

        {/* === Login Modal === */}
        {showLogin && (
          <div className="popup-overlay" onClick={() => setShowLogin(false)}>
            <div className="popup-card" onClick={(e) => e.stopPropagation()}>
              {loginLoading && (
                <div className="login-progress-wrapper">
                  <div
                    className="login-progress-bar"
                    style={{ width: `${loginProgress}%` }}
                  />
                </div>
              )}

              <h3>Welcome Back</h3>
              <form className="popup-form" onSubmit={handleLogin}>
                <input type="email" placeholder="Email" required />
                <input type="password" placeholder="Password" required />

                {error && <p className="error-text">{error}</p>}
                {success && <p className="success-text">{success}</p>}

                <button
                  type="submit"
                  className="btn-get-started w-100 mt-2"
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <span className="btn-loading">
                      <span className="spinner" /> Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>
              <p className="mt-2 small">
                Don’t have an account?{" "}
                <span
                  className="link"
                  onClick={() => {
                    setShowLogin(false);
                    setShowRegister(true);
                  }}
                >
                  Create one
                </span>
              </p>
            </div>

            {/* Reuse same inline style for consistency */}
            <style jsx>{`
              .error-text,
              .success-text {
                text-align: center;
                font-size: 0.95rem;
                font-weight: 500;
                padding: 10px 14px;
                border-radius: 8px;
                margin-top: 12px;
                margin-bottom: 4px;
                animation: fadeIn 0.4s ease-in-out;
              }

              .error-text {
                background: rgba(255, 77, 79, 0.15);
                color: #ff4d4f;
                border: 1px solid rgba(255, 77, 79, 0.5);
                box-shadow: 0 0 12px rgba(255, 77, 79, 0.3);
              }

              .success-text {
                background: rgba(76, 175, 80, 0.15);
                color: #4caf50;
                border: 1px solid rgba(76, 175, 80, 0.5);
                box-shadow: 0 0 12px rgba(76, 175, 80, 0.3);
              }

              @keyframes fadeIn {
                from {
                  opacity: 0;
                  transform: translateY(-5px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
          </div>
        )}

        {/* /Hero Section */}
        {/* Featured Services Section */}
        <section id="featured-services" className="featured-services section">
          <div className="container">
            <div className="row gy-4">
              <div
                className="col-xl-3 col-md-6 d-flex"
                data-aos="fade-up"
                data-aos-delay={100}
              >
                <div className="service-item position-relative">
                  <div className="icon">
                    <i className="bi bi-translate icon" />
                  </div>
                  <h4>
                    <a href="#" className="stretched-link">
                      Learn by Living
                    </a>
                  </h4>
                  <p>
                    Experience German language and culture through real food
                    stories and local expressions.
                  </p>
                </div>
              </div>
              {/* End Service Item */}
              <div
                className="col-xl-3 col-md-6 d-flex"
                data-aos="fade-up"
                data-aos-delay={200}
              >
                <div className="service-item position-relative">
                  <div className="icon">
                    <i className="bi bi-people icon" />
                  </div>
                  <h4>
                    <a href="#" className="stretched-link">
                      Your Personalized Path
                    </a>
                  </h4>
                  <p>
                    Every journey is tailored to your pace, goals, and interests
                    — just like a real adventure.
                  </p>
                </div>
              </div>
              {/* End Service Item */}
              <div
                className="col-xl-3 col-md-6 d-flex"
                data-aos="fade-up"
                data-aos-delay={300}
              >
                <div className="service-item position-relative">
                  <div className="icon">
                    <i className="bi bi-award icon" />
                  </div>
                  <h4>
                    <a href="#" className="stretched-link">
                      Grow and Earn Badges
                    </a>
                  </h4>
                  <p>
                    Complete fun cultural missions and earn achievements that
                    reflect your learning progress.
                  </p>
                </div>
              </div>
              {/* End Service Item */}
              <div
                className="col-xl-3 col-md-6 d-flex"
                data-aos="fade-up"
                data-aos-delay={400}
              >
                <div className="service-item position-relative">
                  <div className="icon">
                    <i className="bi bi-heart icon" />
                  </div>
                  <h4>
                    <a href="#" className="stretched-link">
                      Connect with Culture
                    </a>
                  </h4>
                  <p>
                    Taste traditions, discover stories, and fall in love with
                    German life through every level.
                  </p>
                </div>
              </div>
              {/* End Service Item */}
            </div>
          </div>
        </section>
        {/* /Featured Services Section */}
        {/* About Section */}
        <section id="about" className="about section">
          {/* Section Title */}
          <div className="container section-title" data-aos="fade-up">
            <h2>About FoodCulture</h2>
            <p>
              Discover, play, and learn German food culture through an
              AI-powered game experience.
            </p>
          </div>
          {/* End Section Title */}

          <div className="container" data-aos="fade-up">
            <div
              className="row g-4 g-lg-5 align-items-center"
              data-aos="fade-up"
              data-aos-delay={200}
            >
              <div className="col-lg-5">
                <div className="about-img">
                  <img
                    src="assets/img/German_Food.jpg"
                    className="img-fluid rounded-3 shadow-sm"
                    alt="Learning German food culture"
                  />
                </div>
              </div>

              <div className="col-lg-7">
                <h3 className="pt-0 pt-lg-4">
                  A gamified journey into Germany’s flavors, culture, and
                  language
                </h3>

                {/* Tabs */}
                <ul className="nav nav-pills mb-3">
                  <li>
                    <a
                      className="nav-link active"
                      data-bs-toggle="pill"
                      href="#about-tab1"
                    >
                      Why We Built It
                    </a>
                  </li>
                  <li>
                    <a
                      className="nav-link"
                      data-bs-toggle="pill"
                      href="#about-tab2"
                    >
                      What You’ll Experience
                    </a>
                  </li>
                  <li>
                    <a
                      className="nav-link"
                      data-bs-toggle="pill"
                      href="#about-tab3"
                    >
                      What You’ll Gain
                    </a>
                  </li>
                </ul>
                {/* End Tabs */}

                {/* Tab Content */}
                <div className="tab-content">
                  {/* Tab 1 */}
                  <div className="tab-pane fade show active" id="about-tab1">
                    <p className="fst-italic">
                      Moving to a new country is exciting — but understanding
                      its culture can be challenging. FoodCulture was created to
                      make this journey easier, friendlier, and more enjoyable.
                    </p>
                    <div className="d-flex align-items-center mt-3">
                      <i className="bi bi-check2" />
                      <h4 className="ms-2">
                        Designed for newcomers and language learners
                      </h4>
                    </div>
                    <p>
                      The game connects you with an AI guide who helps you
                      explore authentic German dishes, habits, and expressions —
                      step by step.
                    </p>
                    <div className="d-flex align-items-center mt-3">
                      <i className="bi bi-check2" />
                      <h4 className="ms-2">Learning through interaction</h4>
                    </div>
                    <p>
                      Instead of reading facts, you experience conversations,
                      make choices, and progress like a story-driven adventure.
                    </p>
                  </div>

                  {/* Tab 2 */}
                  <div className="tab-pane fade" id="about-tab2">
                    <p className="fst-italic">
                      Every level of the game is built around curiosity and
                      personalization — your answers shape your path.
                    </p>
                    <div className="d-flex align-items-center mt-3">
                      <i className="bi bi-check2" />
                      <h4 className="ms-2">Level-based challenges</h4>
                    </div>
                    <p>
                      Unlock themed conversations about markets, cafés,
                      traditions, and regional dishes as you advance.
                    </p>
                    <div className="d-flex align-items-center mt-3">
                      <i className="bi bi-check2" />
                      <h4 className="ms-2">AI-driven personalization</h4>
                    </div>
                    <p>
                      The chatbot adapts to your interests, language level, and
                      mood, making every interaction feel unique and alive.
                    </p>
                    <div className="d-flex align-items-center mt-3">
                      <i className="bi bi-check2" />
                      <h4 className="ms-2">Playful visuals and storytelling</h4>
                    </div>
                    <p>
                      You’ll see images, short scenes, and questions that help
                      you immerse in everyday German culture naturally.
                    </p>
                  </div>

                  {/* Tab 3 */}
                  <div className="tab-pane fade" id="about-tab3">
                    <p className="fst-italic">
                      FoodCulture isn’t just a game — it’s a bridge between
                      language and real cultural understanding.
                    </p>
                    <div className="d-flex align-items-center mt-3">
                      <i className="bi bi-check2" />
                      <h4 className="ms-2">Cultural confidence</h4>
                    </div>
                    <p>
                      By the end, you’ll recognize local dishes, know common
                      dining phrases, and feel more connected to the community.
                    </p>
                    <div className="d-flex align-items-center mt-3">
                      <i className="bi bi-check2" />
                      <h4 className="ms-2">Interactive language learning</h4>
                    </div>
                    <p>
                      Pick up useful German words and phrases naturally as you
                      play, without traditional memorization.
                    </p>
                    <div className="d-flex align-items-center mt-3">
                      <i className="bi bi-check2" />
                      <h4 className="ms-2">A journey that evolves with you</h4>
                    </div>
                    <p>
                      The AI keeps track of your progress and preferences,
                      turning every session into a truly personalized cultural
                      exchange.
                    </p>
                  </div>
                </div>
                {/* End Tab Content */}
              </div>
            </div>
          </div>
        </section>
        {/* /About Section */}
      </main>
    </>
  );
}
