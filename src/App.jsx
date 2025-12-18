import { useState } from "react";
import "./App.css";

function App() {
  const [goal, setGoal] = useState("Become a junior MERN web developer");
  const [currentSkills, setCurrentSkills] = useState("");
  const [background, setBackground] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [durationWeeks, setDurationWeeks] = useState(6);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setPlan(null);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/plan/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          goal,
          currentSkills,
          background,
          hoursPerWeek: Number(hoursPerWeek),
          durationWeeks: Number(durationWeeks)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }

      setPlan(data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="app-shell">
        <header className="app-header">
          <div>
            <h1>Personalized Learning Assistant</h1>
            <p>
              Move from your current level to a clear, focused 4–6 week learning roadmap.
            </p>
          </div>
         
        </header>

        <main className="app-main">
          {/* Left: Form */}
          <section className="panel panel-form">
            <h2 className="panel-title">Learner Profile</h2>
            <p className="panel-subtitle">
              Tell the assistant about your background and constraints. It will design a customized path.
            </p>

            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label>Learning goal</label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder='e.g., "Become a junior MERN web developer"'
                  required
                />
              </div>

              <div className="form-group">
                <label>Current skills in this domain</label>
                <textarea
                  value={currentSkills}
                  onChange={(e) => setCurrentSkills(e.target.value)}
                  placeholder='e.g., "Basic HTML/CSS, some JavaScript, no backend"'
                  rows={3}
                  required
                />
              </div>

              <div className="form-group">
                <label>Background (education, related experience)</label>
                <textarea
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  placeholder='e.g., "BSCS 5th semester, some OOP in C++"'
                  rows={3}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Hours per week</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Duration (weeks)</label>
                  <select
                    value={durationWeeks}
                    onChange={(e) => setDurationWeeks(e.target.value)}
                  >
                    <option value={4}>4 weeks</option>
                    <option value={5}>5 weeks</option>
                    <option value={6}>6 weeks</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className={`btn-primary ${loading ? "btn-loading" : ""}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" /> Generating plan…
                  </>
                ) : (
                  "Generate Learning Plan"
                )}
              </button>

              {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
            </form>
          </section>

          {/* Right: Result */}
          <section className="panel panel-results">
            <h2 className="panel-title">Generated Plan</h2>
            <p className="panel-subtitle">
              Once generated, your prioritized path and week-by-week roadmap will appear here.
            </p>

            {!plan && !loading && !errorMsg && (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h3>Nothing yet</h3>
                <p>
                  Fill in your details on the left and click{" "}
                  <strong>“Generate Learning Plan”</strong> to see a personalized roadmap.
                </p>
              </div>
            )}

            {plan && (
              <div className="plan">
                <div className="plan-header">
                  <h3>{plan.goal}</h3>
                  <p className="pill">
                    {plan.roadmap?.length || durationWeeks} week roadmap
                  </p>
                </div>

                {plan.assumptions && (
                  <div className="assumptions">
                    <h4>Assumptions</h4>
                    <p>{plan.assumptions}</p>
                  </div>
                )}

                {/* Prioritized Path */}
                {Array.isArray(plan.prioritizedPath) &&
                  plan.prioritizedPath.length > 0 && (
                    <div className="section">
                      <h4>Prioritized Learning Path</h4>
                      <ol className="prioritized-list">
                        {plan.prioritizedPath.map((item) => (
                          <li key={item.order} className="prioritized-item">
                            <div className="prioritized-order">
                              {item.order}
                            </div>
                            <div>
                              <div className="prioritized-title">
                                {item.topic}{" "}
                                {item.core && (
                                  <span className="chip chip-core">Core</span>
                                )}
                              </div>
                              <p className="prioritized-reason">
                                {item.reason}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                {/* Roadmap */}
                {Array.isArray(plan.roadmap) && plan.roadmap.length > 0 && (
                  <div className="section">
                    <h4>Week-by-Week Roadmap</h4>
                    <div className="roadmap-grid">
                      {plan.roadmap.map((week) => (
                        <div key={week.week} className="roadmap-card">
                          <div className="roadmap-header">
                            <span className="chip">Week {week.week}</span>
                            <span className="hours">
                              {week.estimatedHours} hrs
                            </span>
                          </div>
                          <h5>{week.focus}</h5>
                          <ul className="activities">
                            {week.activities?.map((act, idx) => (
                              <li key={idx} className="activity-item">
                                <span className={`activity-type type-${act.type}`}>
                                  {act.type}
                                </span>
                                <span>{act.description}</span>
                                {act.resource && (
                                  <a
                                    href={act.resource.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="resource-link"
                                  >
                                    {act.resource.title} ({act.resource.type})
                                  </a>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
