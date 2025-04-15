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
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [editingEmotion, setEditingEmotion] = useState(null);
  const [editingNote, setEditingNote] = useState("");

  const startEditEntry = (entry) => {
    setEditingEntryId(entry.id);
    setEditingEmotion(entry.emotion);
    setEditingNote(entry.note);
  };

  const handleEditSave = (entry) => {
    setMoodHistory(moodHistory.map(e =>
      e.id === entry.id
        ? { ...e, emotion: editingEmotion, note: editingNote }
        : e
    ));
    setEditingEntryId(null);
    setEditingEmotion(null);
    setEditingNote("");
  };

  const handleEditCancel = () => {
    setEditingEntryId(null);
    setEditingEmotion(null);
    setEditingNote("");
  };

  const handleEmotionSelect = (emotion) => {
    setSelectEmotion(emotion);
  };

  const handleRegisterMood = () => {
    if (!selectEmotion) return;

    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10); // YYYY-MM-DD

    const newEntry = {
      id: moodHistory.length + 1,
      emotion: selectEmotion,
      date: dateStr,
      time: today.toLocaleTimeString(),
      note: note.trim()
    };

    setMoodHistory([newEntry, ...moodHistory]);
    setSelectEmotion(null);
    setNote("");
  };

  const handleDeleteMood = (id) => {
    setMoodHistory(moodHistory.filter(entry => entry.id !== id));
  };

  const calculateStats = () => {
    const stats = emotions.map(emotion => ({
      name: emotion.name,
      count: moodHistory.filter(m => m.emotion.id === emotion.id).length
    }));
    return stats;
  };

  const stats = calculateStats();

  const getMoodsByDate = () => {
    const grouped = {};
    moodHistory.forEach(entry => {
      if (!grouped[entry.date]) grouped[entry.date] = [];
      grouped[entry.date].push(entry);
    });
    return grouped;
  };
  const moodsByDate = getMoodsByDate();

  function getPredominantEmotion(entries) {
    if (!entries.length) return null;
    const count = {};
    entries.forEach(entry => {
      const id = entry.emotion.id;
      if (!count[id]) count[id] = { ...entry.emotion, times: 0 };
      count[id].times++;
    });
    return Object.values(count).reduce((a, b) => (a.times >= b.times ? a : b));
  }

  // Cálculo de días y offsets según el mes/año seleccionado
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1).getDay();
  const startOffset = (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1);
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  // Funciones para cambiar de mes
  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };
  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  // Nombres de meses para mostrar
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  return (
    <>
      <div className="mood-dashboard">
        {/* Sidebar izquierda: Selector y registro */}
        <div className="sidebar">
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
                placeholder="Agrega una nota sobre tu estado de ánimo..."
              />
              <button onClick={handleRegisterMood}>Registrar emoción</button>
            </div>
          )}
          {/* Historial de emociones en la sidebar */}
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
                  <button className="delete-mood" onClick={() => handleDeleteMood(entry.id)}>Eliminar</button>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Main content derecha: Calendario y gráfico */}
        <div className="main-content">
          <div>
            <div className="calendar-controls">
              <button onClick={handlePrevMonth}>Mes anterior</button>
              <span>{monthNames[calendarMonth]} {calendarYear}</span>
              <button onClick={handleNextMonth}>Mes siguiente</button>
            </div>
            <h2>Calendario de emociones</h2>
            <div className="calendar-grid">
              {/* Encabezados de días */}
              {weekDays.map(day => (
                <div key={day} className="calendar-header">{day}</div>
              ))}
              {/* Celdas vacías al principio */}
              {Array.from({ length: startOffset }).map((_, idx) => (
                <div key={`empty-start-${idx}`} className="calendar-cell empty"></div>
              ))}
              {/* Días del mes */}
              {[...Array(daysInMonth).keys()].map(i => {
                const day = i + 1;
                const dateStr = `${calendarYear}-${(calendarMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                const moods = moodsByDate[dateStr] || [];
                const predominant = getPredominantEmotion(moods);
                return (
                  <div
                    key={day}
                    className="calendar-cell"
                    onClick={() => moods.length > 0 && setSelectedDate(dateStr)}
                    style={{ cursor: moods.length > 0 ? "pointer" : "default" }}
                    title={predominant ? predominant.name : ""}
                  >
                    <div className="calendar-day">{day}</div>
                    <div className="calendar-moods">
                      {predominant
                        ? <span>{predominant.emoji}</span>
                        : <span className="calendar-empty">-</span>
                      }
                    </div>
                  </div>
                );
              })}
              {/* Celdas vacías al final */}
              {Array.from({ length: totalCells - (startOffset + daysInMonth) }).map((_, idx) => (
                <div key={`empty-end-${idx}`} className="calendar-cell empty"></div>
              ))}
            </div>
          </div>
          <div className="mood-stats">
            {/* Aquí va tu visualización gráfica/estadísticas */}
            <h2>Mood Distribution</h2>
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <div className="stat-bar" style={{
                    height: `${stat.count * 10}px`,
                    backgroundColor: `hsl(${(index * 50) % 360}, 70%, 50%)`
                  }}></div>
                  <span className="stat-label">{emotions[index].emoji} {stat.name}: {stat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Debajo: registros diarios del día seleccionado */}
      {selectedDate && (
        <div className="selected-day-records">
          <h3>Registros del {selectedDate}</h3>
          {(moodsByDate[selectedDate] && moodsByDate[selectedDate].length > 0) ? (
            moodsByDate[selectedDate].map((entry) => (
              <div key={entry.id} className="mood-entry">
                {editingEntryId === entry.id ? (
                  <>
                    <select
                      value={editingEmotion ? editingEmotion.id : entry.emotion.id}
                      onChange={e => setEditingEmotion(emotions.find(em => em.id === Number(e.target.value)))}
                    >
                      {emotions.map(e => <option key={e.id} value={e.id}>{e.emoji} {e.name}</option>)}
                    </select>
                    <textarea
                      value={editingNote}
                      onChange={e => setEditingNote(e.target.value)}
                      placeholder="Nota"
                    />
                    <button onClick={() => handleEditSave(entry)}>Guardar</button>
                    <button onClick={handleEditCancel}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <span className="mood-emoji">{entry.emotion.emoji}</span>
                    <span className="mood-name">{entry.emotion.name}</span>
                    <span className="mood-time">{entry.time}</span>
                    {entry.note && <span className="mood-note">{entry.note}</span>}
                    <button className="edit-mood" onClick={() => startEditEntry(entry)}>Editar</button>
                    <button className="delete-mood" onClick={() => handleDeleteMood(entry.id)}>Eliminar</button>
                  </>
                )}
              </div>
            ))
          ) : (
            <div>No hay registros para este día.</div>
          )}
          <button className="close-records-btn" onClick={() => setSelectedDate(null)}>Cerrar</button>
        </div>
      )}
    </>
  );
}
