import "../Styles/MoodTracker.css";
import { useState } from "react";
import { useMood } from "../hook/Mood-hook";

const emotions = [
  { id: 1, name: "Happy", emoji: "😊" },
  { id: 2, name: "Sad", emoji: "😢" },
  { id: 3, name: "Angry", emoji: "😠" },
  { id: 4, name: "Fear", emoji: "😨" },
  { id: 5, name: "Surprise", emoji: "😲" },
  { id: 6, name: "Disgust", emoji: "🤢" },
  { id: 7, name: "Neutral", emoji: "😐" },
];

export default function MoodTracker() {
  const [selectEmotion, setSelectEmotion] = useState(null);
  const [note, setNote] = useState("");
  const { moodHistory, setMoodHistory } = useMood();

  const handleEmotionSelect = (emotion) => {
    setSelectEmotion(emotion);
  };

  const handleRegisterMood = () => {
    if (!selectEmotion) return;

    const newEntry = {
      id: moodHistory.length + 1,
      emotion: selectEmotion,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      note: note.trim()
    };

    setMoodHistory([newEntry, ...moodHistory]);
    setSelectEmotion(null);
    setNote("");
  };

  const calculateStats = () => {
    const stats = emotions.map(emotion => ({
      name: emotion.name,
      count: moodHistory.filter(m => m.emotion.id === emotion.id).length
    }));
    return stats;
  };

  const stats = calculateStats();

  return (
    <div className="mood-container">
      <h1>Mood Tracker</h1>
      
      {/* Visualización gráfica */}
      <div className="mood-stats">
        <h2>Mood Distribution</h2>
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-bar" style={{
                height: `${stat.count * 10}px`,
                backgroundColor: `hsl(${(index * 50) % 360}, 70%, 50%)`
              }}></div>
              <div className="stat-label">
                <span className="stat-name">{stat.name}</span>
                <span className="stat-count">{stat.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="emotion-selector">
        {emotions.map((emotion) => (
          <button
            key={emotion.id}
            className={`emotion-button ${selectEmotion?.id === emotion.id ? 'selected' : ''}`}
            onClick={() => handleEmotionSelect(emotion)}
          >
            <span className="emotion-emoji">{emotion.emoji}</span>
            <span className="emotion-name">{emotion.name}</span>
          </button>
        ))}
      </div>

      {selectEmotion && (
        <div className="mood-form">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note about your mood..."
          />
          <button onClick={handleRegisterMood}>Register Mood</button>
        </div>
      )}

      {moodHistory.length > 0 && (
        <div className="mood-history">
          <h2>Mood History</h2>
          {moodHistory.map((entry) => (
            <div key={entry.id} className="mood-entry">
              <span className="mood-emoji">{entry.emotion.emoji}</span>
              <span className="mood-name">{entry.emotion.name}</span>
              <span className="mood-date">{entry.date}</span>
              <span className="mood-time">{entry.time}</span>
              {entry.note && <span className="mood-note">{entry.note}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
