"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "./page.css";

type SetupFormData = {
  age: number | "";
  gender: string;
  nationality: string;
  germanLevel: string;
  previousExperience: string;
  interests: string[];
  goal: string;
  favoriteCuisine: string;
  regionPreference: string[];
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (() => {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  })();

export default function FormClient() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") || "";
  const [otherText, setOtherText] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);
  const startProgress = () => {
    setProgress(5);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p;
        return p + Math.random() * 8;
      });
    }, 300);

    return interval;
  };

  const [form, setForm] = useState<SetupFormData>({
    age: "",
    gender: "",
    nationality: "",
    germanLevel: "",
    previousExperience: "",
    interests: [],
    goal: "",
    favoriteCuisine: "",
    regionPreference: [], // ✅ array now
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  // Preloader
  useEffect(() => {
    const timer = setTimeout(() => {
      const preloader = document.getElementById("preloader");
      if (preloader) preloader.style.display = "none";
    }, 150);
    return () => clearTimeout(timer);
  }, []);
  const isFormValid = () => {
    // basic required fields
    if (
      form.age === "" ||
      !form.gender ||
      !form.nationality ||
      !form.germanLevel ||
      !form.previousExperience ||
      form.interests.length === 0 ||
      !form.goal.trim() ||
      !form.favoriteCuisine.trim() ||
      form.regionPreference.length === 0
    ) {
      return false;
    }

    // "Other" validations
    if (form.nationality === "Other" && !otherText.nationality?.trim()) {
      return false;
    }

    if (
      form.previousExperience === "Other" &&
      !otherText.previousExperience?.trim()
    ) {
      return false;
    }

    if (
      form.regionPreference.includes("Other") &&
      !otherText.regionPreference?.trim()
    ) {
      return false;
    }

    return true;
  };

  const toggleInterest = (val: string) => {
    setForm((f) => {
      const has = f.interests.includes(val);
      return {
        ...f,
        interests: has
          ? f.interests.filter((x) => x !== val)
          : [...f.interests, val],
      };
    });
  };
  const toggleRegion = (region: string) => {
    setForm((f) => {
      const has = f.regionPreference.includes(region);
      return {
        ...f,
        regionPreference: has
          ? f.regionPreference.filter((r) => r !== region)
          : [...f.regionPreference, region],
      };
    });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Missing email in URL.");
      return;
    }

    let progressInterval: any;

    try {
      setLoading(true);
      setError(null);
      setProgress(0);

      progressInterval = startProgress();

      const payload = {
        email,
        age: form.age === "" ? null : Number(form.age),
        gender: form.gender,
        germanLevel: form.germanLevel,
        interests: form.interests,
        goal: form.goal,
        favoriteCuisine: form.favoriteCuisine,

        nationality:
          form.nationality === "Other"
            ? otherText.nationality
            : form.nationality,

        previousExperience:
          form.previousExperience === "Other"
            ? otherText.previousExperience
            : form.previousExperience,

        regionPreference: form.regionPreference.includes("Other")
          ? [
              ...form.regionPreference.filter((r) => r !== "Other"),
              ...(otherText.regionPreference?.trim()
                ? [otherText.regionPreference.trim()]
                : []),
            ]
          : form.regionPreference,
      };

      const res = await fetch(`${API_URL}/userinfo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to submit form");

      clearInterval(progressInterval);
      setProgress(100);

      setTimeout(() => {
        setOk(true);
        router.push(`/user?email=${encodeURIComponent(email)}#missions`);
      }, 300);
    } catch (err: any) {
      clearInterval(progressInterval);
      setProgress(100);
      setError(err?.message || "Something went wrong");

      // reset bar after error
      setTimeout(() => setProgress(0), 800);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  // Options
  const nationalities = [
    "German",
    "Egyptian",
    "French",
    "Italian",
    "Spanish",
    "American",
    "Other",
  ];

  const germanLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];

  const experiences = [
    "Visited Germany",
    "Studied German culture",
    "Watched German media",
    "No prior experience",
    "Other",
  ];

  const regions = [
    "Berlin",
    "Bavaria",
    "Hamburg",
    "Saxony",
    "Hesse",
    "Baden-Württemberg",
    "Other",
  ];

  return (
    <main className="form-wrap">
      <div className="form-card">
        <h1 className="form-title">Complete Your Profile</h1>
        <p className="form-subtitle">
          Tell us a bit about yourself to personalize your learning journey.
        </p>

        {error && <div className="form-alert error">{error}</div>}
        {ok && (
          <div className="form-alert success">Profile saved successfully.</div>
        )}

        <form onSubmit={onSubmit} className="form-grid">
          {/* Age */}
          <div className="form-field">
            <label>Age</label>
            <input
              type="number"
              placeholder="Enter your age"
              value={form.age}
              onChange={(e) =>
                setForm({
                  ...form,
                  age: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
            />
          </div>

          {/* Gender */}
          <div className="form-field">
            <label>Gender</label>
            <div className="pill-row">
              {["Male", "Female", "Other"].map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`pill ${form.gender === g ? "active" : ""}`}
                  onClick={() => setForm({ ...form, gender: g })}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Nationality */}
          <div className="form-field">
            <label>Nationality</label>
            <select
              value={form.nationality}
              onChange={(e) =>
                setForm({ ...form, nationality: e.target.value })
              }
            >
              <option value="">Select your nationality</option>
              {nationalities.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            {form.nationality === "Other" && (
              <input
                type="text"
                placeholder="Please specify"
                value={otherText.nationality || ""}
                onChange={(e) =>
                  setOtherText((prev) => ({
                    ...prev,
                    nationality: e.target.value,
                  }))
                }
                className="input-other"
              />
            )}
          </div>

          {/* German Level */}
          <div className="form-field">
            <label>German Level</label>
            <div className="select-wrapper">
              <select
                value={form.germanLevel}
                onChange={(e) =>
                  setForm({ ...form, germanLevel: e.target.value })
                }
              >
                <option value="">Select level</option>
                {germanLevels.map((lv) => (
                  <option key={lv} value={lv}>
                    {lv} –{" "}
                    {lv === "A1"
                      ? "Beginner"
                      : lv === "C2"
                      ? "Proficient"
                      : "Intermediate"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Previous Experience */}
          <div className="form-field">
            <label>Previous Experience / Familiarity</label>
            <select
              value={form.previousExperience}
              onChange={(e) =>
                setForm({ ...form, previousExperience: e.target.value })
              }
            >
              <option value="">Select your experience</option>
              {experiences.map((exp) => (
                <option key={exp} value={exp}>
                  {exp}
                </option>
              ))}
            </select>
            {form.previousExperience === "Other" && (
              <input
                type="text"
                placeholder="Please specify"
                value={otherText.previousExperience || ""}
                onChange={(e) =>
                  setOtherText((prev) => ({
                    ...prev,
                    previousExperience: e.target.value,
                  }))
                }
                className="input-other"
              />
            )}
          </div>

          {/* Interests */}
          <div className="form-field">
            <label>
              Interests <span className="label-note">(select multiple)</span>
            </label>
            <div className="pill-row">
              {[
                "Street Food",
                "Desserts",
                "Traditional Meals",
                "Culture",
                "History",
                "Festivals & Events",
              ].map((i) => (
                <button
                  key={i}
                  type="button"
                  className={`pill ${
                    form.interests.includes(i) ? "active" : ""
                  }`}
                  onClick={() => toggleInterest(i)}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div className="form-field">
            <label>Learning Goal</label>
            <input
              type="text"
              placeholder="e.g., Learn culture and improve language"
              value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}
            />
          </div>

          {/* Favorite Cuisine */}
          <div className="form-field">
            <label>Favorite Cuisine</label>
            <input
              type="text"
              placeholder="e.g., Italian, Bavarian"
              value={form.favoriteCuisine}
              onChange={(e) =>
                setForm({ ...form, favoriteCuisine: e.target.value })
              }
            />
          </div>

          {/* Region Preference */}
          {/* Region Preference */}
          <div className="form-field">
            <label>
              Region Preference{" "}
              <span className="label-note">(select one or more)</span>
            </label>

            <div className="pill-row">
              {regions.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`pill ${
                    form.regionPreference.includes(r) ? "active" : ""
                  }`}
                  onClick={() => toggleRegion(r)}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Custom input when Other is selected */}
            {form.regionPreference.includes("Other") && (
              <input
                type="text"
                placeholder="Please specify your preferred regions"
                value={otherText.regionPreference || ""}
                onChange={(e) =>
                  setOtherText((prev) => ({
                    ...prev,
                    regionPreference: e.target.value,
                  }))
                }
                className="input-other"
              />
            )}
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn ghost"
              onClick={() => router.back()}
              disabled={loading}
            >
              Back
            </button>
            <button
              className="btn primary"
              disabled={loading || !email || !isFormValid()}
            >
              {loading ? "Saving..." : "Save & Continue"}
            </button>
          </div>
          {loading && (
            <div className="progress-wrapper">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
