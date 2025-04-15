import { useState, useEffect } from "react";

export const useMood = () => {
  const [moodHistory, setMoodHistory] = useState(() => {
    const savedHistory = localStorage.getItem("moodHistory");
    return savedHistory ? JSON.parse(savedHistory) : [];
  }); 
  
  useEffect(() => {
    localStorage.setItem("moodHistory", JSON.stringify(moodHistory));
  }, [moodHistory]);

  return { moodHistory, setMoodHistory };
};