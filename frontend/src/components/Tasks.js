import { useEffect, useState } from "react";

function Tasks() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const level = localStorage.getItem("stress_level");
    const saved = localStorage.getItem("stress_result");
    const personalityType = saved ? JSON.parse(saved).personality_type : "Balanced Individual";

    fetch(`http://127.0.0.1:8000/stress/tasks/${level}?personality_type=${encodeURIComponent(personalityType)}`)
      .then(res => res.json())
      .then(data => setTasks(data.tasks));
  }, []);

  return (
    <div>
      <h2>Recommended Tasks</h2>
      <ul>
        {tasks.map((task, index) => (
          <li key={index}>{task.title ?? task}</li>
        ))}
      </ul>
    </div>
  );
}

export default Tasks;
