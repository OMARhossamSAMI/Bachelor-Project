"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Script from "next/script";
import { useEffect, useState } from "react";

export default function Home() {
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

  return (
    <>
      <header
        id="header"
        className="header d-flex align-items-center custom-sticky"
      >
        <div className="container-fluid position-relative d-flex align-items-center justify-content-between">
          <a
            href="index.html"
            className="logo d-flex align-items-center me-auto me-xl-0"
          >
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
                <a href="#hero" className="active">
                  Home
                </a>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
              {/* <li>
                <a href="#services">Missions</a>
              </li>
              <li>
                <a href="#portfolio">Gallery</a>
              </li>
              <li>
                <a href="#team">Team</a>
              </li>
              <li>
                <a href="blog.html">Blog</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li> */}
            </ul>
            <i className="mobile-nav-toggle d-xl-none bi bi-list" />
          </nav>
          <a className="btn-getstarted" href="#hero">
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
              <a href="#about" className="btn-get-started scrollto">
                Begin Your Journey
              </a>
              <a
                href="https://www.youtube.com/watch?v=Y7f98aduVJ8"
                className="glightbox btn-watch-video d-flex align-items-center"
              >
                <i className="bi bi-play-circle" />
                <span>See How It Works</span>
              </a>
            </div>
          </div>
        </section>
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

        {/* Clients Section */}
        <section id="clients" className="clients section">
          <div className="container" data-aos="fade-up">
            <div className="row gy-4">
              <div className="col-xl-2 col-md-3 col-6 client-logo">
                <img
                  src="assets/img/clients/client-1.png"
                  className="img-fluid"
                  alt=""
                />
              </div>
              {/* End Client Item */}
              <div className="col-xl-2 col-md-3 col-6 client-logo">
                <img
                  src="assets/img/clients/client-2.png"
                  className="img-fluid"
                  alt=""
                />
              </div>
              {/* End Client Item */}
              <div className="col-xl-2 col-md-3 col-6 client-logo">
                <img
                  src="assets/img/clients/client-3.png"
                  className="img-fluid"
                  alt=""
                />
              </div>
              {/* End Client Item */}
              <div className="col-xl-2 col-md-3 col-6 client-logo">
                <img
                  src="assets/img/clients/client-4.png"
                  className="img-fluid"
                  alt=""
                />
              </div>
              {/* End Client Item */}
              <div className="col-xl-2 col-md-3 col-6 client-logo">
                <img
                  src="assets/img/clients/client-5.png"
                  className="img-fluid"
                  alt=""
                />
              </div>
              {/* End Client Item */}
              <div className="col-xl-2 col-md-3 col-6 client-logo">
                <img
                  src="assets/img/clients/client-6.png"
                  className="img-fluid"
                  alt=""
                />
              </div>
              {/* End Client Item */}
            </div>
          </div>
        </section>
        {/* /Clients Section */}
        {/* Call To Action Section */}
        <section id="call-to-action" className="call-to-action section">
          <div className="container" data-aos="zoom-out">
            <div className="row g-5">
              <div className="col-lg-8 col-md-6 content d-flex flex-column justify-content-center order-last order-md-first">
                <h3>
                  Alias sunt quas <em>Cupiditate</em> oluptas hic minima
                </h3>
                <p>
                  Duis aute irure dolor in reprehenderit in voluptate velit esse
                  cillum dolore eu fugiat nulla pariatur. Excepteur sint
                  occaecat cupidatat non proident, sunt in culpa qui officia
                  deserunt mollit anim id est laborum.
                </p>
                <a className="cta-btn align-self-start" href="#">
                  Call To Action
                </a>
              </div>
              <div className="col-lg-4 col-md-6 order-first order-md-last d-flex align-items-center">
                <div className="img">
                  <img src="assets/img/cta.jpg" alt="" className="img-fluid" />
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* /Call To Action Section */}
        {/* Onfocus Section */}
        <section id="onfocus" className="onfocus section dark-background">
          <div className="container-fluid p-0" data-aos="fade-up">
            <div className="row g-0">
              <div className="col-lg-6 video-play position-relative">
                <a
                  href="https://www.youtube.com/watch?v=Y7f98aduVJ8"
                  className="glightbox pulsating-play-btn"
                />
              </div>
              <div className="col-lg-6">
                <div className="content d-flex flex-column justify-content-center h-100">
                  <h3>Voluptatem dignissimos provident quasi corporis</h3>
                  <p className="fst-italic">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua.
                  </p>
                  <ul>
                    <li>
                      <i className="bi bi-check-circle" /> Ullamco laboris nisi
                      ut aliquip ex ea commodo consequat.
                    </li>
                    <li>
                      <i className="bi bi-check-circle" /> Duis aute irure dolor
                      in reprehenderit in voluptate velit.
                    </li>
                    <li>
                      <i className="bi bi-check-circle" /> Ullamco laboris nisi
                      ut aliquip ex ea commodo consequat. Duis aute irure dolor
                      in reprehenderit in voluptate trideta storacalaperda
                      mastiro dolore eu fugiat nulla pariatur.
                    </li>
                  </ul>
                  <a href="#" className="read-more align-self-start">
                    <span>Read More</span>
                    <i className="bi bi-arrow-right" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* /Onfocus Section */}
        {/* Features Section */}
        <section id="features" className="features section">
          <div className="container" data-aos="fade-up">
            <ul className="nav nav-tabs row gy-4 d-flex">
              <li className="nav-item col-6 col-md-4 col-lg-2">
                <a
                  className="nav-link active show"
                  data-bs-toggle="tab"
                  data-bs-target="#features-tab-1"
                >
                  <i
                    className="bi bi-binoculars"
                    style={{ color: "#0dcaf0" }}
                  />
                  <h4>Modinest</h4>
                </a>
              </li>
              {/* End Tab 1 Nav */}
              <li className="nav-item col-6 col-md-4 col-lg-2">
                <a
                  className="nav-link"
                  data-bs-toggle="tab"
                  data-bs-target="#features-tab-2"
                >
                  <i className="bi bi-box-seam" style={{ color: "#6610f2" }} />
                  <h4>Undaesenti</h4>
                </a>
              </li>
              {/* End Tab 2 Nav */}
              <li className="nav-item col-6 col-md-4 col-lg-2">
                <a
                  className="nav-link"
                  data-bs-toggle="tab"
                  data-bs-target="#features-tab-3"
                >
                  <i
                    className="bi bi-brightness-high"
                    style={{ color: "#20c997" }}
                  />
                  <h4>Pariatur</h4>
                </a>
              </li>
              {/* End Tab 3 Nav */}
              <li className="nav-item col-6 col-md-4 col-lg-2">
                <a
                  className="nav-link"
                  data-bs-toggle="tab"
                  data-bs-target="#features-tab-4"
                >
                  <i className="bi bi-command" style={{ color: "#df1529" }} />
                  <h4>Nostrum</h4>
                </a>
              </li>
              {/* End Tab 4 Nav */}
              <li className="nav-item col-6 col-md-4 col-lg-2">
                <a
                  className="nav-link"
                  data-bs-toggle="tab"
                  data-bs-target="#features-tab-5"
                >
                  <i className="bi bi-easel" style={{ color: "#0d6efd" }} />
                  <h4>Adipiscing</h4>
                </a>
              </li>
              {/* End Tab 5 Nav */}
              <li className="nav-item col-6 col-md-4 col-lg-2">
                <a
                  className="nav-link"
                  data-bs-toggle="tab"
                  data-bs-target="#features-tab-6"
                >
                  <i className="bi bi-map" style={{ color: "#fd7e14" }} />
                  <h4>Reprehit</h4>
                </a>
              </li>
              {/* End Tab 6 Nav */}
            </ul>
            <div className="tab-content">
              <div className="tab-pane fade active show" id="features-tab-1">
                <div className="row gy-4">
                  <div
                    className="col-lg-8 order-2 order-lg-1"
                    data-aos="fade-up"
                    data-aos-delay={100}
                  >
                    <h3>Modinest</h3>
                    <p className="fst-italic">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                      sed do eiusmod tempor incididunt ut labore et dolore magna
                      aliqua.
                    </p>
                    <ul>
                      <li>
                        <i className="bi bi-check-circle-fill" /> Ullamco
                        laboris nisi ut aliquip ex ea commodo consequat.
                      </li>
                      <li>
                        <i className="bi bi-check-circle-fill" /> Duis aute
                        irure dolor in reprehenderit in voluptate velit.
                      </li>
                      <li>
                        <i className="bi bi-check-circle-fill" /> Ullamco
                        laboris nisi ut aliquip ex ea commodo consequat. Duis
                        aute irure dolor in reprehenderit in voluptate trideta
                        storacalaperda mastiro dolore eu fugiat nulla pariatur.
                      </li>
                    </ul>
                    <p>
                      Ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      Duis aute irure dolor in reprehenderit in voluptate velit
                      esse cillum dolore eu fugiat nulla pariatur. Excepteur
                      sint occaecat cupidatat non proident, sunt in culpa qui
                      officia deserunt mollit anim id est laborum
                    </p>
                  </div>
                  <div
                    className="col-lg-4 order-1 order-lg-2 text-center"
                    data-aos="fade-up"
                    data-aos-delay={200}
                  >
                    <img
                      src="assets/img/features-1.svg"
                      alt=""
                      className="img-fluid"
                    />
                  </div>
                </div>
              </div>
              {/* End Tab Content 1 */}
              <div className="tab-pane fade" id="features-tab-2">
                <div className="row gy-4">
                  <div className="col-lg-8 order-2 order-lg-1">
                    <h3>Undaesenti</h3>
                    <p>
                      Ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      Duis aute irure dolor in reprehenderit in voluptate velit
                      esse cillum dolore eu fugiat nulla pariatur. Excepteur
                      sint occaecat cupidatat non proident, sunt in culpa qui
                      officia deserunt mollit anim id est laborum
                    </p>
                    <p className="fst-italic">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                      sed do eiusmod tempor incididunt ut labore et dolore magna
                      aliqua.
                    </p>
                    <ul>
                      <li>
                        <i className="bi bi-check-circle-fill" /> Ullamco
                        laboris nisi ut aliquip ex ea commodo consequat.
                      </li>
                      <li>
                        <i className="bi bi-check-circle-fill" /> Duis aute
                        irure dolor in reprehenderit in voluptate velit.
                      </li>
                      <li>
                        <i className="bi bi-check-circle-fill" /> Provident
                        mollitia neque rerum asperiores dolores quos qui a.
                        Ipsum neque dolor voluptate nisi sed.
                      </li>
                      <li>
                        <i className="bi bi-check-circle-fill" /> Ullamco
                        laboris nisi ut aliquip ex ea commodo consequat. Duis
                        aute irure dolor in reprehenderit in voluptate trideta
                        storacalaperda mastiro dolore eu fugiat nulla pariatur.
                      </li>
                    </ul>
                  </div>
                  <div className="col-lg-4 order-1 order-lg-2 text-center">
                    <img
                      src="assets/img/features-2.svg"
                      alt=""
                      className="img-fluid"
                    />
                  </div>
                </div>
              </div>
              {/* End Tab Content 2 */}
              <div className="tab-pane fade" id="features-tab-3">
                <div className="row gy-4">
                  <div className="col-lg-8 order-2 order-lg-1">
                    <h3>Pariatur</h3>
                    <p>
                      Ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      Duis aute irure dolor in reprehenderit in voluptate velit
                      esse cillum dolore eu fugiat nulla pariatur. Excepteur
                      sint occaecat cupidatat non proident, sunt in culpa qui
                      officia deserunt mollit anim id est laborum
                    </p>
                    <ul>
                      <li>
                        <i className="bi bi-check-circle-fill" /> Ullamco
                        laboris nisi ut aliquip ex ea commodo consequat.
                      </li>
                      <li>
                        <i className="bi bi-check-circle-fill" /> Duis aute
                        irure dolor in reprehenderit in voluptate velit.
                      </li>
                      <li>
                        <i className="bi bi-check-circle-fill" /> Provident
                        mollitia neque rerum asperiores dolores quos qui a.
                        Ipsum neque dolor voluptate nisi sed.
                      </li>
                    </ul>
                    <p className="fst-italic">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                      sed do eiusmod tempor incididunt ut labore et dolore magna
                      aliqua.
                    </p>
                  </div>
                  <div className="col-lg-4 order-1 order-lg-2 text-center">
                    <img
                      src="assets/img/features-3.svg"
                      alt=""
                      className="img-fluid"
                    />
                  </div>
                </div>
              </div>
              {/* End Tab Content 3 */}
              <div className="tab-pane fade" id="features-tab-4">
                <div className="row gy-4">
                  <div className="col-lg-8 order-2 order-lg-1">
                    <h3>Nostrum</h3>
                    <p>
                      Ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      Duis aute irure dolor in reprehenderit in voluptate velit
                      esse cillum dolore eu fugiat nulla pariatur. Excepteur
                      sint occaecat cupidatat non proident, sunt in culpa qui
                      officia deserunt mollit anim id est laborum
                    </p>
                    <p className="fst-italic">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                      sed do eiusmod tempor incididunt ut labore et dolore magna
                      aliqua.
                    </p>
                    <ul>
                      <li>
                        <i className="bi bi-check-circle-fill" /> Ullamco
                        laboris nisi ut aliquip ex ea commodo consequat.
                      </li>
                      <li>
                        <i className="bi bi-check-circle-fill" /> Duis aute
                        irure dolor in reprehenderit in voluptate velit.
                      </li>
                      <li>
                        <i className="bi bi-check-circle-fill" /> Ullamco
                        laboris nisi ut aliquip ex ea commodo consequat. Duis
                        aute irure dolor in reprehenderit in voluptate trideta
                        storacalaperda mastiro dolore eu fugiat nulla pariatur.
                      </li>
                    </ul>
                  </div>
                  <div className="col-lg-4 order-1 order-lg-2 text-center">
                    <img
                      src="assets/img/features-4.svg"
                      alt=""
                      className="img-fluid"
                    />
                  </div>
                </div>
              </div>
              {/* End Tab Content 4 */}
              <div className="tab-pane fade" id="features-tab-5">
                <div className="row gy-4">
                  <div className="col-lg-8 order-2 order-lg-1">
                    <h3>Adipiscing</h3>
                    <p>
                      Ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      Duis aute irure dolor in reprehenderit in voluptate velit
                      esse cillum dolore eu fugiat nulla pariatur. Excepteur
                      sint occaecat cupidatat non proident, sunt in culpa qui
                      officia deserunt mollit anim id est laborum
                    </p>
                    <p className="fst-italic">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                      sed do eiusmod tempor incididunt ut labore et dolore magna
                      aliqua.
                    </p>
                    <ul>
                      <li>
                        <i className="bi bi-check-circle-fill" /> Ullamco
                        laboris nisi ut aliquip ex ea commodo consequat.
                      </li>
                      <li>
                        <i className="bi bi-check-circle-fill" /> Duis aute
                        irure dolor in reprehenderit in voluptate velit.
                      </li>
                      <li>
                        <i className="bi bi-check-circle-fill" /> Ullamco
                        laboris nisi ut aliquip ex ea commodo consequat. Duis
                        aute irure dolor in reprehenderit in voluptate trideta
                        storacalaperda mastiro dolore eu fugiat nulla pariatur.
                      </li>
                    </ul>
                  </div>
                  <div className="col-lg-4 order-1 order-lg-2 text-center">
                    <img
                      src="assets/img/features-5.svg"
                      alt=""
                      className="img-fluid"
                    />
                  </div>
                </div>
              </div>
              {/* End Tab Content 5 */}
              <div className="tab-pane fade" id="features-tab-6">
                <div className="row gy-4">
                  <div className="col-lg-8 order-2 order-lg-1">
                    <h3>Reprehit</h3>
                    <p>
                      Ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      Duis aute irure dolor in reprehenderit in voluptate velit
                      esse cillum dolore eu fugiat nulla pariatur. Excepteur
                      sint occaecat cupidatat non proident, sunt in culpa qui
                      officia deserunt mollit anim id est laborum
                    </p>
                    <p className="fst-italic">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                      sed do eiusmod tempor incididunt ut labore et dolore magna
                      aliqua.
                    </p>
                    <ul>
                      <li>
                        <i className="bi bi-check-circle-fill" /> Ullamco
                        laboris nisi ut aliquip ex ea commodo consequat.
                      </li>
                      <li>
                        <i className="bi bi-check-circle-fill" /> Duis aute
                        irure dolor in reprehenderit in voluptate velit.
                      </li>
                      <li>
                        <i className="bi bi-check-circle-fill" /> Ullamco
                        laboris nisi ut aliquip ex ea commodo consequat. Duis
                        aute irure dolor in reprehenderit in voluptate trideta
                        storacalaperda mastiro dolore eu fugiat nulla pariatur.
                      </li>
                    </ul>
                  </div>
                  <div className="col-lg-4 order-1 order-lg-2 text-center">
                    <img
                      src="assets/img/features-6.svg"
                      alt=""
                      className="img-fluid"
                    />
                  </div>
                </div>
              </div>
              {/* End Tab Content 6 */}
            </div>
          </div>
        </section>
        {/* /Features Section */}
        {/* Services Section */}
        <section id="services" className="services section">
          {/* Section Title */}
          <div className="container section-title" data-aos="fade-up">
            <h2>Our Services</h2>
            <p>
              Necessitatibus eius consequatur ex aliquid fuga eum quidem sint
              consectetur velit
            </p>
          </div>
          {/* End Section Title */}
          <div className="container" data-aos="fade-up" data-aos-delay={100}>
            <div className="row gy-5">
              <div
                className="col-xl-4 col-md-6"
                data-aos="zoom-in"
                data-aos-delay={200}
              >
                <div className="service-item">
                  <div className="img">
                    <img
                      src="assets/img/services-1.jpg"
                      className="img-fluid"
                      alt=""
                    />
                  </div>
                  <div className="details position-relative">
                    <div className="icon">
                      <i className="bi bi-activity" />
                    </div>
                    <a href="service-details.html" className="stretched-link">
                      <h3>Nesciunt Mete</h3>
                    </a>
                    <p>
                      Provident nihil minus qui consequatur non omnis maiores.
                      Eos accusantium minus dolores iure perferendis.
                    </p>
                  </div>
                </div>
              </div>
              {/* End Service Item */}
              <div
                className="col-xl-4 col-md-6"
                data-aos="zoom-in"
                data-aos-delay={300}
              >
                <div className="service-item">
                  <div className="img">
                    <img
                      src="assets/img/services-2.jpg"
                      className="img-fluid"
                      alt=""
                    />
                  </div>
                  <div className="details position-relative">
                    <div className="icon">
                      <i className="bi bi-broadcast" />
                    </div>
                    <a href="service-details.html" className="stretched-link">
                      <h3>Eosle Commodi</h3>
                    </a>
                    <p>
                      Ut autem aut autem non a. Sint sint sit facilis nam iusto
                      sint. Libero corrupti neque eum hic non ut nesciunt
                      dolorem.
                    </p>
                  </div>
                </div>
              </div>
              {/* End Service Item */}
              <div
                className="col-xl-4 col-md-6"
                data-aos="zoom-in"
                data-aos-delay={400}
              >
                <div className="service-item">
                  <div className="img">
                    <img
                      src="assets/img/services-3.jpg"
                      className="img-fluid"
                      alt=""
                    />
                  </div>
                  <div className="details position-relative">
                    <div className="icon">
                      <i className="bi bi-easel" />
                    </div>
                    <a href="service-details.html" className="stretched-link">
                      <h3>Ledo Markt</h3>
                    </a>
                    <p>
                      Ut excepturi voluptatem nisi sed. Quidem fuga consequatur.
                      Minus ea aut. Vel qui id voluptas adipisci eos earum
                      corrupti.
                    </p>
                  </div>
                </div>
              </div>
              {/* End Service Item */}
              <div
                className="col-xl-4 col-md-6"
                data-aos="zoom-in"
                data-aos-delay={500}
              >
                <div className="service-item">
                  <div className="img">
                    <img
                      src="assets/img/services-4.jpg"
                      className="img-fluid"
                      alt=""
                    />
                  </div>
                  <div className="details position-relative">
                    <div className="icon">
                      <i className="bi bi-bounding-box-circles" />
                    </div>
                    <a href="service-details.html" className="stretched-link">
                      <h3>Asperiores Commodit</h3>
                    </a>
                    <p>
                      Non et temporibus minus omnis sed dolor esse consequatur.
                      Cupiditate sed error ea fuga sit provident adipisci neque.
                    </p>
                    <a href="service-details.html" className="stretched-link" />
                  </div>
                </div>
              </div>
              {/* End Service Item */}
              <div
                className="col-xl-4 col-md-6"
                data-aos="zoom-in"
                data-aos-delay={600}
              >
                <div className="service-item">
                  <div className="img">
                    <img
                      src="assets/img/services-5.jpg"
                      className="img-fluid"
                      alt=""
                    />
                  </div>
                  <div className="details position-relative">
                    <div className="icon">
                      <i className="bi bi-calendar4-week" />
                    </div>
                    <a href="service-details.html" className="stretched-link">
                      <h3>Velit Doloremque</h3>
                    </a>
                    <p>
                      Cumque et suscipit saepe. Est maiores autem enim facilis
                      ut aut ipsam corporis aut. Sed animi at autem alias eius
                      labore.
                    </p>
                    <a href="service-details.html" className="stretched-link" />
                  </div>
                </div>
              </div>
              {/* End Service Item */}
              <div
                className="col-xl-4 col-md-6"
                data-aos="zoom-in"
                data-aos-delay={700}
              >
                <div className="service-item">
                  <div className="img">
                    <img
                      src="assets/img/services-6.jpg"
                      className="img-fluid"
                      alt=""
                    />
                  </div>
                  <div className="details position-relative">
                    <div className="icon">
                      <i className="bi bi-chat-square-text" />
                    </div>
                    <a href="service-details.html" className="stretched-link">
                      <h3>Dolori Architecto</h3>
                    </a>
                    <p>
                      Hic molestias ea quibusdam eos. Fugiat enim doloremque aut
                      neque non et debitis iure. Corrupti recusandae ducimus
                      enim.
                    </p>
                    <a href="service-details.html" className="stretched-link" />
                  </div>
                </div>
              </div>
              {/* End Service Item */}
            </div>
          </div>
        </section>
        {/* /Services Section */}
        {/* Testimonials Section */}
        <section
          id="testimonials"
          className="testimonials section dark-background"
        >
          {/* Section Title */}
          <div className="container section-title" data-aos="fade-up">
            <h2>Testimonials</h2>
            <p>
              Necessitatibus eius consequatur ex aliquid fuga eum quidem sint
              consectetur velit
            </p>
          </div>
          {/* End Section Title */}
          <img
            src="assets/img/testimonials-bg.jpg"
            className="testimonials-bg"
            alt=""
          />
          <div className="container" data-aos="fade-up" data-aos-delay={100}>
            <div className="swiper init-swiper">
              <div className="swiper-wrapper">
                <div className="swiper-slide">
                  <div className="testimonial-item">
                    <img
                      src="assets/img/testimonials/testimonials-1.jpg"
                      className="testimonial-img"
                      alt=""
                    />
                    <h3>Saul Goodman</h3>
                    <h4>Ceo &amp; Founder</h4>
                    <div className="stars">
                      <i className="bi bi-star-fill" />
                      <i className="bi bi-star-fill" />
                      <i className="bi bi-star-fill" />
                      <i className="bi bi-star-fill" />
                      <i className="bi bi-star-fill" />
                    </div>
                    <p>
                      <i className="bi bi-quote quote-icon-left" />
                      <span>
                        Proin iaculis purus consequat sem cure digni ssim donec
                        porttitora entum suscipit rhoncus. Accusantium quam,
                        ultricies eget id, aliquam eget nibh et. Maecen aliquam,
                        risus at semper.
                      </span>
                      <i className="bi bi-quote quote-icon-right" />
                    </p>
                  </div>
                </div>
                {/* End testimonial item */}
                <div className="swiper-slide">
                  <div className="testimonial-item">
                    <img
                      src="assets/img/testimonials/testimonials-2.jpg"
                      className="testimonial-img"
                      alt=""
                    />
                    <h3>Sara Wilsson</h3>
                    <h4>Designer</h4>
                    <div className="stars">
                      <i className="bi bi-star-fill" />
                      <i className="bi bi-star-fill" />
                      <i className="bi bi-star-fill" />
                      <i className="bi bi-star-fill" />
                      <i className="bi bi-star-fill" />
                    </div>
                    <p>
                      <i className="bi bi-quote quote-icon-left" />
                      <span>
                        Export tempor illum tamen malis malis eram quae irure
                        esse labore quem cillum quid cillum eram malis quorum
                        velit fore eram velit sunt aliqua noster fugiat irure
                        amet legam anim culpa.
                      </span>
                      <i className="bi bi-quote quote-icon-right" />
                    </p>
                  </div>
                </div>
                {/* End testimonial item */}
                <div className="swiper-slide">
                  <div className="testimonial-item">
                    <img
                      src="assets/img/testimonials/testimonials-3.jpg"
                      className="testimonial-img"
                      alt=""
                    />
                    <h3>Jena Karlis</h3>
                    <h4>Store Owner</h4>
                    <div className="stars">
                      <i className="bi bi-star-fill" />
                      <i className="bi bi-star-fill" />
                      <i className="bi bi-star-fill" />
                      <i className="bi bi-star-fill" />
                      <i className="bi bi-star-fill" />
                    </div>
                    <p>
                      <i className="bi bi-quote quote-icon-left" />
                      <span>
                        Enim nisi quem export duis labore cillum quae magna enim
                        sint quorum nulla quem veniam duis minim tempor labore
                        quem eram duis noster aute amet eram fore quis sint
                        minim.
                      </span>
                      <i className="bi bi-quote quote-icon-right" />
                    </p>
                  </div>
                </div>
                {/* End testimonial item */}
                <div className="swiper-slide">
                  <div className="testimonial-item">
                    <img
                      src="assets/img/testimonials/testimonials-4.jpg"
                      className="testimonial-img"
                      alt=""
                    />
                    <h3>Matt Brandon</h3>
                    <h4>Freelancer</h4>
                    <div className="stars">
                      <i className="bi bi-star-fill" />
                      <i className="bi bi-star-fill" />
                      <i className="bi bi-star-fill" />
                      <i className="bi bi-star-fill" />
                      <i className="bi bi-star-fill" />
                    </div>
                    <p>
                      <i className="bi bi-quote quote-icon-left" />
                      <span>
                        Fugiat enim eram quae cillum dolore dolor amet nulla
                        culpa multos export minim fugiat minim velit minim dolor
                        enim duis veniam ipsum anim magna sunt elit fore quem
                        dolore labore illum veniam.
                      </span>
                      <i className="bi bi-quote quote-icon-right" />
                    </p>
                  </div>
                </div>
                {/* End testimonial item */}
                <div className="swiper-slide">
                  <div className="testimonial-item">
                    <img
                      src="assets/img/testimonials/testimonials-5.jpg"
                      className="testimonial-img"
                      alt=""
                    />
                    <h3>John Larson</h3>
                    <h4>Entrepreneur</h4>
                    <div className="stars">
                      <i className="bi bi-star-fill" />
                      <i className="bi bi-star-fill" />
                      <i className="bi bi-star-fill" />
                      <i className="bi bi-star-fill" />
                      <i className="bi bi-star-fill" />
                    </div>
                    <p>
                      <i className="bi bi-quote quote-icon-left" />
                      <span>
                        Quis quorum aliqua sint quem legam fore sunt eram irure
                        aliqua veniam tempor noster veniam enim culpa labore
                        duis sunt culpa nulla illum cillum fugiat legam esse
                        veniam culpa fore nisi cillum quid.
                      </span>
                      <i className="bi bi-quote quote-icon-right" />
                    </p>
                  </div>
                </div>
                {/* End testimonial item */}
              </div>
              <div className="swiper-pagination" />
            </div>
          </div>
        </section>
        {/* /Testimonials Section */}
        {/* Pricing Section */}
        <section id="pricing" className="pricing section">
          {/* Section Title */}
          <div className="container section-title" data-aos="fade-up">
            <h2>Our Pricing</h2>
            <p>
              Necessitatibus eius consequatur ex aliquid fuga eum quidem sint
              consectetur velit
            </p>
          </div>
          {/* End Section Title */}
          <div className="container" data-aos="fade-up" data-aos-delay={100}>
            <div className="row gy-4">
              <div className="col-lg-4" data-aos="zoom-in" data-aos-delay={200}>
                <div className="pricing-item">
                  <div className="pricing-header">
                    <h3>Free Plan</h3>
                    <h4>
                      <sup>$</sup>0<span> / month</span>
                    </h4>
                  </div>
                  <ul>
                    <li>
                      <i className="bi bi-dot" />
                      <span>Quam adipiscing vitae proin</span>
                    </li>
                    <li>
                      <i className="bi bi-dot" />
                      <span>Nec feugiat nisl pretium</span>
                    </li>
                    <li>
                      <i className="bi bi-dot" />
                      <span>Nulla at volutpat diam uteera</span>
                    </li>
                    <li className="na">
                      <i className="bi bi-x" />
                      <span>Pharetra massa massa ultricies</span>
                    </li>
                    <li className="na">
                      <i className="bi bi-x" />
                      <span>Massa ultricies mi quis hendrerit</span>
                    </li>
                  </ul>
                  <div className="text-center mt-auto">
                    <a href="#" className="buy-btn">
                      Buy Now
                    </a>
                  </div>
                </div>
              </div>
              {/* End Pricing Item */}
              <div className="col-lg-4" data-aos="zoom-in" data-aos-delay={400}>
                <div className="pricing-item featured">
                  <div className="pricing-header">
                    <h3>Business Plan</h3>
                    <h4>
                      <sup>$</sup>29<span> / month</span>
                    </h4>
                  </div>
                  <ul>
                    <li>
                      <i className="bi bi-dot" />
                      <span>Quam adipiscing vitae proin</span>
                    </li>
                    <li>
                      <i className="bi bi-dot" />
                      <span>Nec feugiat nisl pretium</span>
                    </li>
                    <li>
                      <i className="bi bi-dot" />
                      <span>Nulla at volutpat diam uteera</span>
                    </li>
                    <li>
                      <i className="bi bi-dot" />
                      <span>Pharetra massa massa ultricies</span>
                    </li>
                    <li>
                      <i className="bi bi-dot" />
                      <span>Massa ultricies mi quis hendrerit</span>
                    </li>
                  </ul>
                  <div className="text-center mt-auto">
                    <a href="#" className="buy-btn">
                      Buy Now
                    </a>
                  </div>
                </div>
              </div>
              {/* End Pricing Item */}
              <div className="col-lg-4" data-aos="zoom-in" data-aos-delay={600}>
                <div className="pricing-item">
                  <div className="pricing-header">
                    <h3>Developer Plan</h3>
                    <h4>
                      <sup>$</sup>49<span> / month</span>
                    </h4>
                  </div>
                  <ul>
                    <li>
                      <i className="bi bi-dot" />
                      <span>Quam adipiscing vitae proin</span>
                    </li>
                    <li>
                      <i className="bi bi-dot" />
                      <span>Nec feugiat nisl pretium</span>
                    </li>
                    <li>
                      <i className="bi bi-dot" />
                      <span>Nulla at volutpat diam uteera</span>
                    </li>
                    <li>
                      <i className="bi bi-dot" />
                      <span>Pharetra massa massa ultricies</span>
                    </li>
                    <li>
                      <i className="bi bi-dot" />
                      <span>Massa ultricies mi quis hendrerit</span>
                    </li>
                  </ul>
                  <div className="text-center mt-auto">
                    <a href="#" className="buy-btn">
                      Buy Now
                    </a>
                  </div>
                </div>
              </div>
              {/* End Pricing Item */}
            </div>
          </div>
        </section>
        {/* /Pricing Section */}
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
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Duis aute irure dolor in reprehenderit
                  </p>
                </div>
                <div
                  className="faq-container px-xl-5"
                  data-aos="fade-up"
                  data-aos-delay={200}
                >
                  <div className="faq-item faq-active">
                    <i className="faq-icon bi bi-question-circle" />
                    <h3>Non consectetur a erat nam at lectus urna duis?</h3>
                    <div className="faq-content">
                      <p>
                        Feugiat pretium nibh ipsum consequat. Tempus iaculis
                        urna id volutpat lacus laoreet non curabitur gravida.
                        Venenatis lectus magna fringilla urna porttitor rhoncus
                        dolor purus non.
                      </p>
                    </div>
                    <i className="faq-toggle bi bi-chevron-right" />
                  </div>
                  {/* End Faq item*/}
                  <div className="faq-item">
                    <i className="faq-icon bi bi-question-circle" />
                    <h3>
                      Feugiat scelerisque varius morbi enim nunc faucibus a
                      pellentesque?
                    </h3>
                    <div className="faq-content">
                      <p>
                        Dolor sit amet consectetur adipiscing elit pellentesque
                        habitant morbi. Id interdum velit laoreet id donec
                        ultrices. Fringilla phasellus faucibus scelerisque
                        eleifend donec pretium. Est pellentesque elit
                        ullamcorper dignissim. Mauris ultrices eros in cursus
                        turpis massa tincidunt dui.
                      </p>
                    </div>
                    <i className="faq-toggle bi bi-chevron-right" />
                  </div>
                  {/* End Faq item*/}
                  <div className="faq-item">
                    <i className="faq-icon bi bi-question-circle" />
                    <h3>
                      Dolor sit amet consectetur adipiscing elit pellentesque?
                    </h3>
                    <div className="faq-content">
                      <p>
                        Eleifend mi in nulla posuere sollicitudin aliquam
                        ultrices sagittis orci. Faucibus pulvinar elementum
                        integer enim. Sem nulla pharetra diam sit amet nisl
                        suscipit. Rutrum tellus pellentesque eu tincidunt.
                        Lectus urna duis convallis convallis tellus. Urna
                        molestie at elementum eu facilisis sed odio morbi quis
                      </p>
                    </div>
                    <i className="faq-toggle bi bi-chevron-right" />
                  </div>
                  {/* End Faq item*/}
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
        {/* Portfolio Section */}
        <section id="portfolio" className="portfolio section">
          {/* Section Title */}
          <div className="container section-title" data-aos="fade-up">
            <h2>Portfolio</h2>
            <p>
              Necessitatibus eius consequatur ex aliquid fuga eum quidem sint
              consectetur velit
            </p>
          </div>
          {/* End Section Title */}
          <div className="container-fluid">
            <div
              className="isotope-layout"
              data-default-filter="*"
              data-layout="masonry"
              data-sort="original-order"
            >
              <ul
                className="portfolio-filters isotope-filters"
                data-aos="fade-up"
                data-aos-delay={100}
              >
                <li data-filter="*" className="filter-active">
                  All
                </li>
                <li data-filter=".filter-app">App</li>
                <li data-filter=".filter-product">Product</li>
                <li data-filter=".filter-branding">Branding</li>
                <li data-filter=".filter-books">Books</li>
              </ul>
              {/* End Portfolio Filters */}
              <div
                className="row g-0 isotope-container"
                data-aos="fade-up"
                data-aos-delay={200}
              >
                <div className="col-xl-3 col-lg-4 col-md-6 portfolio-item isotope-item filter-app">
                  <div className="portfolio-content h-100">
                    <img
                      src="assets/img/portfolio/app-1.jpg"
                      className="img-fluid"
                      alt=""
                    />
                    <div className="portfolio-info">
                      <a
                        href="assets/img/portfolio/app-1.jpg"
                        data-gallery="portfolio-gallery-app"
                        className="glightbox preview-link"
                      >
                        <i className="bi bi-zoom-in" />
                      </a>
                      <a
                        href="portfolio-details.html"
                        title="More Details"
                        className="details-link"
                      >
                        <i className="bi bi-link-45deg" />
                      </a>
                    </div>
                  </div>
                </div>
                {/* End Portfolio Item */}
                <div className="col-xl-3 col-lg-4 col-md-6 portfolio-item isotope-item filter-product">
                  <div className="portfolio-content h-100">
                    <img
                      src="assets/img/portfolio/product-1.jpg"
                      className="img-fluid"
                      alt=""
                    />
                    <div className="portfolio-info">
                      <a
                        href="assets/img/portfolio/product-1.jpg"
                        data-gallery="portfolio-gallery-product"
                        className="glightbox preview-link"
                      >
                        <i className="bi bi-zoom-in" />
                      </a>
                      <a
                        href="portfolio-details.html"
                        title="More Details"
                        className="details-link"
                      >
                        <i className="bi bi-link-45deg" />
                      </a>
                    </div>
                  </div>
                </div>
                {/* End Portfolio Item */}
                <div className="col-xl-3 col-lg-4 col-md-6 portfolio-item isotope-item filter-branding">
                  <div className="portfolio-content h-100">
                    <img
                      src="assets/img/portfolio/branding-1.jpg"
                      className="img-fluid"
                      alt=""
                    />
                    <div className="portfolio-info">
                      <a
                        href="assets/img/portfolio/branding-1.jpg"
                        data-gallery="portfolio-gallery-branding"
                        className="glightbox preview-link"
                      >
                        <i className="bi bi-zoom-in" />
                      </a>
                      <a
                        href="portfolio-details.html"
                        title="More Details"
                        className="details-link"
                      >
                        <i className="bi bi-link-45deg" />
                      </a>
                    </div>
                  </div>
                </div>
                {/* End Portfolio Item */}
                <div className="col-xl-3 col-lg-4 col-md-6 portfolio-item isotope-item filter-books">
                  <div className="portfolio-content h-100">
                    <img
                      src="assets/img/portfolio/books-1.jpg"
                      className="img-fluid"
                      alt=""
                    />
                    <div className="portfolio-info">
                      <a
                        href="assets/img/portfolio/books-1.jpg"
                        data-gallery="portfolio-gallery-book"
                        className="glightbox preview-link"
                      >
                        <i className="bi bi-zoom-in" />
                      </a>
                      <a
                        href="portfolio-details.html"
                        title="More Details"
                        className="details-link"
                      >
                        <i className="bi bi-link-45deg" />
                      </a>
                    </div>
                  </div>
                </div>
                {/* End Portfolio Item */}
                <div className="col-xl-3 col-lg-4 col-md-6 portfolio-item isotope-item filter-app">
                  <div className="portfolio-content h-100">
                    <img
                      src="assets/img/portfolio/app-2.jpg"
                      className="img-fluid"
                      alt=""
                    />
                    <div className="portfolio-info">
                      <a
                        href="assets/img/portfolio/app-2.jpg"
                        data-gallery="portfolio-gallery-app"
                        className="glightbox preview-link"
                      >
                        <i className="bi bi-zoom-in" />
                      </a>
                      <a
                        href="portfolio-details.html"
                        title="More Details"
                        className="details-link"
                      >
                        <i className="bi bi-link-45deg" />
                      </a>
                    </div>
                  </div>
                </div>
                {/* End Portfolio Item */}
                <div className="col-xl-3 col-lg-4 col-md-6 portfolio-item isotope-item filter-product">
                  <div className="portfolio-content h-100">
                    <img
                      src="assets/img/portfolio/product-2.jpg"
                      className="img-fluid"
                      alt=""
                    />
                    <div className="portfolio-info">
                      <a
                        href="assets/img/portfolio/product-2.jpg"
                        data-gallery="portfolio-gallery-product"
                        className="glightbox preview-link"
                      >
                        <i className="bi bi-zoom-in" />
                      </a>
                      <a
                        href="portfolio-details.html"
                        title="More Details"
                        className="details-link"
                      >
                        <i className="bi bi-link-45deg" />
                      </a>
                    </div>
                  </div>
                </div>
                {/* End Portfolio Item */}
                <div className="col-xl-3 col-lg-4 col-md-6 portfolio-item isotope-item filter-branding">
                  <div className="portfolio-content h-100">
                    <img
                      src="assets/img/portfolio/branding-2.jpg"
                      className="img-fluid"
                      alt=""
                    />
                    <div className="portfolio-info">
                      <a
                        href="assets/img/portfolio/branding-2.jpg"
                        data-gallery="portfolio-gallery-branding"
                        className="glightbox preview-link"
                      >
                        <i className="bi bi-zoom-in" />
                      </a>
                      <a
                        href="portfolio-details.html"
                        title="More Details"
                        className="details-link"
                      >
                        <i className="bi bi-link-45deg" />
                      </a>
                    </div>
                  </div>
                </div>
                {/* End Portfolio Item */}
                <div className="col-xl-3 col-lg-4 col-md-6 portfolio-item isotope-item filter-books">
                  <div className="portfolio-content h-100">
                    <img
                      src="assets/img/portfolio/books-2.jpg"
                      className="img-fluid"
                      alt=""
                    />
                    <div className="portfolio-info">
                      <a
                        href="assets/img/portfolio/books-2.jpg"
                        data-gallery="portfolio-gallery-book"
                        className="glightbox preview-link"
                      >
                        <i className="bi bi-zoom-in" />
                      </a>
                      <a
                        href="portfolio-details.html"
                        title="More Details"
                        className="details-link"
                      >
                        <i className="bi bi-link-45deg" />
                      </a>
                    </div>
                  </div>
                </div>
                {/* End Portfolio Item */}
                <div className="col-xl-3 col-lg-4 col-md-6 portfolio-item isotope-item filter-app">
                  <div className="portfolio-content h-100">
                    <img
                      src="assets/img/portfolio/app-3.jpg"
                      className="img-fluid"
                      alt=""
                    />
                    <div className="portfolio-info">
                      <a
                        href="assets/img/portfolio/app-3.jpg"
                        data-gallery="portfolio-gallery-app"
                        className="glightbox preview-link"
                      >
                        <i className="bi bi-zoom-in" />
                      </a>
                      <a
                        href="portfolio-details.html"
                        title="More Details"
                        className="details-link"
                      >
                        <i className="bi bi-link-45deg" />
                      </a>
                    </div>
                  </div>
                </div>
                {/* End Portfolio Item */}
                <div className="col-xl-3 col-lg-4 col-md-6 portfolio-item isotope-item filter-product">
                  <div className="portfolio-content h-100">
                    <img
                      src="assets/img/portfolio/product-3.jpg"
                      className="img-fluid"
                      alt=""
                    />
                    <div className="portfolio-info">
                      <a
                        href="assets/img/portfolio/product-3.jpg"
                        data-gallery="portfolio-gallery-product"
                        className="glightbox preview-link"
                      >
                        <i className="bi bi-zoom-in" />
                      </a>
                      <a
                        href="portfolio-details.html"
                        title="More Details"
                        className="details-link"
                      >
                        <i className="bi bi-link-45deg" />
                      </a>
                    </div>
                  </div>
                </div>
                {/* End Portfolio Item */}
                <div className="col-xl-3 col-lg-4 col-md-6 portfolio-item isotope-item filter-branding">
                  <div className="portfolio-content h-100">
                    <img
                      src="assets/img/portfolio/branding-3.jpg"
                      className="img-fluid"
                      alt=""
                    />
                    <div className="portfolio-info">
                      <a
                        href="assets/img/portfolio/branding-3.jpg"
                        data-gallery="portfolio-gallery-branding"
                        className="glightbox preview-link"
                      >
                        <i className="bi bi-zoom-in" />
                      </a>
                      <a
                        href="portfolio-details.html"
                        title="More Details"
                        className="details-link"
                      >
                        <i className="bi bi-link-45deg" />
                      </a>
                    </div>
                  </div>
                </div>
                {/* End Portfolio Item */}
                <div className="col-xl-3 col-lg-4 col-md-6 portfolio-item isotope-item filter-books">
                  <div className="portfolio-content h-100">
                    <img
                      src="assets/img/portfolio/books-3.jpg"
                      className="img-fluid"
                      alt=""
                    />
                    <div className="portfolio-info">
                      <a
                        href="assets/img/portfolio/books-3.jpg"
                        data-gallery="portfolio-gallery-book"
                        className="glightbox preview-link"
                      >
                        <i className="bi bi-zoom-in" />
                      </a>
                      <a
                        href="portfolio-details.html"
                        title="More Details"
                        className="details-link"
                      >
                        <i className="bi bi-link-45deg" />
                      </a>
                    </div>
                  </div>
                </div>
                {/* End Portfolio Item */}
              </div>
              {/* End Portfolio Container */}
            </div>
          </div>
        </section>
        {/* /Portfolio Section */}
        {/* Team Section */}
        <section id="team" className="team section">
          {/* Section Title */}
          <div className="container section-title" data-aos="fade-up">
            <h2>Our Team</h2>
            <p>
              Necessitatibus eius consequatur ex aliquid fuga eum quidem sint
              consectetur velit
            </p>
          </div>
          {/* End Section Title */}
          <div className="container" data-aos="fade-up" data-aos-delay={100}>
            <div className="row gy-5">
              <div
                className="col-xl-4 col-md-6 d-flex"
                data-aos="zoom-in"
                data-aos-delay={200}
              >
                <div className="team-member">
                  <div className="member-img">
                    <img
                      src="assets/img/team/team-1.jpg"
                      className="img-fluid"
                      alt=""
                    />
                  </div>
                  <div className="member-info">
                    <div className="social">
                      <a href="">
                        <i className="bi bi-twitter-x" />
                      </a>
                      <a href="">
                        <i className="bi bi-facebook" />
                      </a>
                      <a href="">
                        <i className="bi bi-instagram" />
                      </a>
                      <a href="">
                        <i className="bi bi-linkedin" />
                      </a>
                    </div>
                    <h4>Walter White</h4>
                    <span>Chief Executive Officer</span>
                  </div>
                </div>
              </div>
              {/* End Team Member */}
              <div
                className="col-xl-4 col-md-6 d-flex"
                data-aos="zoom-in"
                data-aos-delay={400}
              >
                <div className="team-member">
                  <div className="member-img">
                    <img
                      src="assets/img/team/team-2.jpg"
                      className="img-fluid"
                      alt=""
                    />
                  </div>
                  <div className="member-info">
                    <div className="social">
                      <a href="">
                        <i className="bi bi-twitter-x" />
                      </a>
                      <a href="">
                        <i className="bi bi-facebook" />
                      </a>
                      <a href="">
                        <i className="bi bi-instagram" />
                      </a>
                      <a href="">
                        <i className="bi bi-linkedin" />
                      </a>
                    </div>
                    <h4>Sarah Jhonson</h4>
                    <span>Product Manager</span>
                  </div>
                </div>
              </div>
              {/* End Team Member */}
              <div
                className="col-xl-4 col-md-6 d-flex"
                data-aos="zoom-in"
                data-aos-delay={600}
              >
                <div className="team-member">
                  <div className="member-img">
                    <img
                      src="assets/img/team/team-3.jpg"
                      className="img-fluid"
                      alt=""
                    />
                  </div>
                  <div className="member-info">
                    <div className="social">
                      <a href="">
                        <i className="bi bi-twitter-x" />
                      </a>
                      <a href="">
                        <i className="bi bi-facebook" />
                      </a>
                      <a href="">
                        <i className="bi bi-instagram" />
                      </a>
                      <a href="">
                        <i className="bi bi-linkedin" />
                      </a>
                    </div>
                    <h4>William Anderson</h4>
                    <span>CTO</span>
                  </div>
                </div>
              </div>
              {/* End Team Member */}
            </div>
          </div>
        </section>
        {/* /Team Section */}
        {/* Recent Posts Section */}
        <section id="recent-posts" className="recent-posts section">
          {/* Section Title */}
          <div className="container section-title" data-aos="fade-up">
            <h2>Recent Blog Posts</h2>
            <p>
              Necessitatibus eius consequatur ex aliquid fuga eum quidem sint
              consectetur velit
            </p>
          </div>
          {/* End Section Title */}
          <div className="container">
            <div className="row gy-4">
              <div
                className="col-xl-4 col-md-6"
                data-aos="fade-up"
                data-aos-delay={100}
              >
                <article>
                  <div className="post-img">
                    <img
                      src="assets/img/blog/blog-1.jpg"
                      alt=""
                      className="img-fluid"
                    />
                  </div>
                  <p className="post-category">Politics</p>
                  <h2 className="title">
                    <a href="blog-details.html">
                      Dolorum optio tempore voluptas dignissimos
                    </a>
                  </h2>
                  <div className="d-flex align-items-center">
                    <img
                      src="assets/img/blog/blog-author.jpg"
                      alt=""
                      className="img-fluid post-author-img flex-shrink-0"
                    />
                    <div className="post-meta">
                      <p className="post-author">Maria Doe</p>
                      <p className="post-date">
                        <time dateTime="2022-01-01">Jan 1, 2022</time>
                      </p>
                    </div>
                  </div>
                </article>
              </div>
              {/* End post list item */}
              <div
                className="col-xl-4 col-md-6"
                data-aos="fade-up"
                data-aos-delay={200}
              >
                <article>
                  <div className="post-img">
                    <img
                      src="assets/img/blog/blog-2.jpg"
                      alt=""
                      className="img-fluid"
                    />
                  </div>
                  <p className="post-category">Sports</p>
                  <h2 className="title">
                    <a href="blog-details.html">
                      Nisi magni odit consequatur autem nulla dolorem
                    </a>
                  </h2>
                  <div className="d-flex align-items-center">
                    <img
                      src="assets/img/blog/blog-author-2.jpg"
                      alt=""
                      className="img-fluid post-author-img flex-shrink-0"
                    />
                    <div className="post-meta">
                      <p className="post-author">Allisa Mayer</p>
                      <p className="post-date">
                        <time dateTime="2022-01-01">Jun 5, 2022</time>
                      </p>
                    </div>
                  </div>
                </article>
              </div>
              {/* End post list item */}
              <div
                className="col-xl-4 col-md-6"
                data-aos="fade-up"
                data-aos-delay={300}
              >
                <article>
                  <div className="post-img">
                    <img
                      src="assets/img/blog/blog-3.jpg"
                      alt=""
                      className="img-fluid"
                    />
                  </div>
                  <p className="post-category">Entertainment</p>
                  <h2 className="title">
                    <a href="blog-details.html">
                      Possimus soluta ut id suscipit ea ut in quo quia et soluta
                    </a>
                  </h2>
                  <div className="d-flex align-items-center">
                    <img
                      src="assets/img/blog/blog-author-3.jpg"
                      alt=""
                      className="img-fluid post-author-img flex-shrink-0"
                    />
                    <div className="post-meta">
                      <p className="post-author">Mark Dower</p>
                      <p className="post-date">
                        <time dateTime="2022-01-01">Jun 22, 2022</time>
                      </p>
                    </div>
                  </div>
                </article>
              </div>
              {/* End post list item */}
            </div>
            {/* End recent posts list */}
          </div>
        </section>
        {/* /Recent Posts Section */}
        {/* Contact Section */}
        <section id="contact" className="contact section">
          {/* Section Title */}
          <div className="container section-title" data-aos="fade-up">
            <h2>Contact</h2>
            <p>
              Necessitatibus eius consequatur ex aliquid fuga eum quidem sint
              consectetur velit
            </p>
          </div>
          {/* End Section Title */}
          <div className="mb-5">
            <iframe
              style={{ width: "100%", height: 400 }}
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d12097.433213460943!2d-74.0062269!3d40.7101282!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0xb89d1fe6bc499443!2sDowntown+Conference+Center!5e0!3m2!1smk!2sbg!4v1539943755621"
              frameBorder={0}
              allowFullScreen
            />
          </div>
          {/* End Google Maps */}
          <div className="container" data-aos="fade">
            <div className="row gy-5 gx-lg-5">
              <div className="col-lg-4">
                <div className="info">
                  <h3>Get in touch</h3>
                  <p>
                    Et id eius voluptates atque nihil voluptatem enim in tempore
                    minima sit ad mollitia commodi minus.
                  </p>
                  <div className="info-item d-flex">
                    <i className="bi bi-geo-alt flex-shrink-0" />
                    <div>
                      <h4>Location:</h4>
                      <p>A108 Adam Street, New York, NY 535022</p>
                    </div>
                  </div>
                  {/* End Info Item */}
                  <div className="info-item d-flex">
                    <i className="bi bi-envelope flex-shrink-0" />
                    <div>
                      <h4>Email:</h4>
                      <p>info@example.com</p>
                    </div>
                  </div>
                  {/* End Info Item */}
                  <div className="info-item d-flex">
                    <i className="bi bi-phone flex-shrink-0" />
                    <div>
                      <h4>Call:</h4>
                      <p>+1 5589 55488 55</p>
                    </div>
                  </div>
                  {/* End Info Item */}
                </div>
              </div>
              <div className="col-lg-8">
                <form
                  action="forms/contact.php"
                  method="post"
                  role="form"
                  className="php-email-form"
                >
                  <div className="row">
                    <div className="col-md-6 form-group">
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        id="name"
                        placeholder="Your Name"
                        required
                      />
                    </div>
                    <div className="col-md-6 form-group mt-3 mt-md-0">
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        id="email"
                        placeholder="Your Email"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group mt-3">
                    <input
                      type="text"
                      className="form-control"
                      name="subject"
                      id="subject"
                      placeholder="Subject"
                      required
                    />
                  </div>
                  <div className="form-group mt-3">
                    <textarea
                      className="form-control"
                      name="message"
                      placeholder="Message"
                      required
                      defaultValue={""}
                    />
                  </div>
                  <div className="my-3">
                    <div className="loading">Loading</div>
                    <div className="error-message" />
                    <div className="sent-message">
                      Your message has been sent. Thank you!
                    </div>
                  </div>
                  <div className="text-center">
                    <button type="submit">Send Message</button>
                  </div>
                </form>
              </div>
              {/* End Contact Form */}
            </div>
          </div>
        </section>
        {/* /Contact Section */}
      </main>
      <footer id="footer" className="footer dark-background">
        <div className="footer-top">
          <div className="container">
            <div className="row gy-4">
              <div className="col-lg-4 col-md-6 footer-about">
                <a href="index.html" className="logo d-flex align-items-center">
                  <span className="sitename">HeroBiz</span>
                </a>
                <div className="footer-contact pt-3">
                  <p>A108 Adam Street</p>
                  <p>New York, NY 535022</p>
                  <p className="mt-3">
                    <strong>Phone:</strong> <span>+1 5589 55488 55</span>
                  </p>
                  <p>
                    <strong>Email:</strong> <span>info@example.com</span>
                  </p>
                </div>
              </div>
              <div className="col-lg-2 col-md-3 footer-links">
                <h4>Useful Links</h4>
                <ul>
                  <li>
                    <a href="#">Home</a>
                  </li>
                  <li>
                    <a href="#">About us</a>
                  </li>
                  <li>
                    <a href="#">Services</a>
                  </li>
                  <li>
                    <a href="#">Terms of service</a>
                  </li>
                  <li>
                    <a href="#">Privacy policy</a>
                  </li>
                </ul>
              </div>
              <div className="col-lg-2 col-md-3 footer-links">
                <h4>Our Services</h4>
                <ul>
                  <li>
                    <a href="#">Web Design</a>
                  </li>
                  <li>
                    <a href="#">Web Development</a>
                  </li>
                  <li>
                    <a href="#">Product Management</a>
                  </li>
                  <li>
                    <a href="#">Marketing</a>
                  </li>
                  <li>
                    <a href="#">Graphic Design</a>
                  </li>
                </ul>
              </div>
              <div className="col-lg-2 col-md-3 footer-links">
                <h4>Hic solutasetp</h4>
                <ul>
                  <li>
                    <a href="#">Molestiae accusamus iure</a>
                  </li>
                  <li>
                    <a href="#">Excepturi dignissimos</a>
                  </li>
                  <li>
                    <a href="#">Suscipit distinctio</a>
                  </li>
                  <li>
                    <a href="#">Dilecta</a>
                  </li>
                  <li>
                    <a href="#">Sit quas consectetur</a>
                  </li>
                </ul>
              </div>
              <div className="col-lg-2 col-md-3 footer-links">
                <h4>Nobis illum</h4>
                <ul>
                  <li>
                    <a href="#">Ipsam</a>
                  </li>
                  <li>
                    <a href="#">Laudantium dolorum</a>
                  </li>
                  <li>
                    <a href="#">Dinera</a>
                  </li>
                  <li>
                    <a href="#">Trodelas</a>
                  </li>
                  <li>
                    <a href="#">Flexo</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="copyright text-center">
          <div className="container d-flex flex-column flex-lg-row justify-content-center justify-content-lg-between align-items-center">
            <div className="d-flex flex-column align-items-center align-items-lg-start">
              <div>
                © Copyright{" "}
                <strong>
                  <span>MyWebsite</span>
                </strong>
                . All Rights Reserved
              </div>
              <div className="credits">
                {/* All the links in the footer should remain intact. */}
                {/* You can delete the links only if you purchased the pro version. */}
                {/* Licensing information: https://bootstrapmade.com/license/ */}
                {/* Purchase the pro version with working PHP/AJAX contact form: https://bootstrapmade.com/herobiz-bootstrap-business-template/ */}
                Designed by{" "}
                <a href="https://bootstrapmade.com/">BootstrapMade</a>
              </div>
            </div>
            <div className="social-links order-first order-lg-last mb-3 mb-lg-0">
              <a href="">
                <i className="bi bi-twitter-x" />
              </a>
              <a href="">
                <i className="bi bi-facebook" />
              </a>
              <a href="">
                <i className="bi bi-instagram" />
              </a>
              <a href="">
                <i className="bi bi-linkedin" />
              </a>
            </div>
          </div>
        </div>
      </footer>
      {/* Scroll Top */}
      <a
        href="#"
        id="scroll-top"
        className="scroll-top d-flex align-items-center justify-content-center"
      >
        <i className="bi bi-arrow-up-short" />
      </a>

      {/* Main JS File */}
    </>
  );
}
