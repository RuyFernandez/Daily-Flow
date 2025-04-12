import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './Styles/index.css'
import Header from './Components/Header.jsx'
import ToDoList from './Components/ToDoList.jsx'
import MoodTracker from './Components/MoodTracker.jsx'
import Home from './Components/Home.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/todo" element={<ToDoList />} />
        <Route path="/mood" element={<MoodTracker />} />
      </Routes>
    </Router>
  </StrictMode>,
)