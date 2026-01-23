import React, { useState, useEffect } from "react";
import bg from "../assets/bg-home.jpg";

export default function RatingPage() {
  // 28 ADS LIST (Replace images later)
  const adsList = Array.from({ length: 28 }, (_, i) => ({
    id: i + 1,
    code: `AD-${String(i + 1).padStart(4, "0")}`,
    amount: 101.75,
    image: `/ads/photo_${(i % 5) + 1}.jpg`, // auto rotates photo_1 to photo_5
  }));

  // LOCAL STATE
  const [cooldowns, setCooldowns] = useState({});
  const [timers, setTimers] = useState({});

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cooldowns") || "{}");
    setCooldowns(stored);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let updated = { ...cooldowns };

      Object.keys(updated).forEach((id) => {
        if (now >= updated[id]) {
          delete updated[id];
        }
      });

      setCooldowns(updated);
      localStorage.setItem("cooldowns", JSON.stringify(updated));
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldowns]);

  const startTimer = (id) => {
    setTimers((prev) => ({ ...prev, [id]: 10 }));

    const tick = setInterval(() => {
      setTimers((prev) => {
        const newTime = prev[id] - 1;
        if (newTime <= 0) {
          clearInterval(tick);

          // SET COOLDOWN (24 hours)
          const expires = Date.now() + 24 * 60 * 60 * 1000;
          const updated = { ...cooldowns, [id]: expires };
          setCooldowns(updated);
          localStorage.setItem("cooldowns", JSON.stringify(updated));

          return { ...prev, [id]: 0 };
        }
        return { ...prev, [id]: newTime };
      });
    }, 1000);
  };

  const formatCooldown = (timestamp) => {
    const diff = timestamp - Date.now();
    if (diff <= 0) return "00:00:00";

    const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, "0");
    const mins = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, "0");
    const secs = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");

    return `${hours}:${mins}:${secs}`;
  };

  return (
    <div
      className="rating-bg"
      style={{
        backgroundImage: `url(${bg})`,
      }}
    >
      <div className="rating-overlay">

        <div className="rating-page">

          <div className="rating-header">
            <h2>Rating Ads</h2>
            <p>Click ads and earn 101.75 LKR for each</p>
          </div>

          <div className="ads-grid">
            {adsList.map((ad) => {
              const isCooldown = cooldowns[ad.id];
              const isTimer = timers[ad.id] > 0;

              return (
                <div key={ad.id} className="ad-box">
                  <img
                    src={ad.image}
                    alt={ad.code}
                    className={`ad-image ${
                      isCooldown ? "blurred" : ""
                    }`}
                  />

                  <h3 style={{ marginTop: "10px", fontSize: "15px" }}>
                    {ad.code}
                  </h3>

                  <p style={{ fontSize: "14px", color: "#ccc" }}>
                    Earn: {ad.amount} LKR
                  </p>

                  {/* TIMER RUNNING */}
                  {isTimer && (
                    <button className="ad-btn-timer">
                      Wait {timers[ad.id]}s
                    </button>
                  )}

                  {/* COOLDOWN ACTIVE */}
                  {!isTimer && isCooldown && (
                    <button className="ad-btn-completed">
                      Done — {formatCooldown(cooldowns[ad.id])}
                    </button>
                  )}

                  {/* READY TO CLICK */}
                  {!isTimer && !isCooldown && (
                    <button
                      className="ad-btn"
                      onClick={() => startTimer(ad.id)}
                    >
                      Click Ad
                    </button>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
