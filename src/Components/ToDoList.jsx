import "../Styles/ToDoList.css";
import { useTaskList } from "../hook/Todo-hook";
import { useState } from "react";

export default function ToDoList() {
  const {
    lists,
    listNames,
    priorities,
    taskPriorities,
    handlePriorityChange,
    handleTaskPriorityChange,
    sortTasksByPriority,
    inputValues,
    setInputValues,
    addToDo,
    deleteTask,
    deleteAll,
    addNewList,
    deleteList,
    editListName,
  } = useTaskList();

  const priorityColors = {
    low: "🟢",
    normal: "🟡",
    high: "🔴",
  };

  const [taskToDelete, setTaskToDelete] = useState({
    listIndex: -1,
    taskIndex: -1,
  });

  const handleDeleteTask = (listIndex, taskIndex) => {
    setTaskToDelete({ listIndex, taskIndex });
    setTimeout(() => {
      deleteTask(listIndex, taskIndex);
      setTaskToDelete({ listIndex: -1, taskIndex: -1 });
    }, 500);
  };

  return (
    <div className="container">
      <h1 className="toDoList-title">Lista de tareas</h1>

      <button className="add-list-button" onClick={addNewList}>
        + Nueva Lista
      </button>

      <div className="lists-container">
        {lists.map((tasks, listIndex) => (
          <div key={listIndex} className="list-column">
            <div className="priorities-container">
              <p>Prioridad:</p>
              <div className="priorities-select-container">
                <select
                  value={priorities[listIndex] || "normal"}
                  onChange={(e) =>
                    handlePriorityChange(listIndex, e.target.value)
                  }
                >
                  <option value="high">Alta</option>
                  <option value="normal">Normal</option>
                  <option value="low">Baja</option>
                </select>
              </div>
              <span className="priority-icon">
                {priorityColors[priorities[listIndex] || "normal"]}
              </span>
              <button
                onClick={() => sortTasksByPriority(listIndex)}
                className="sort-button"
              >
                Ordenar por prioridad
              </button>
            </div>

            <div className="list-header">
              <div className="list-name-container">
                <span className="list-name">{listNames[listIndex]}</span>
                <button
                  onClick={() => {
                    const newName = prompt(
                      "Ingrese el nuevo nombre para la lista:",
                      listNames[listIndex]
                    );
                    if (newName && newName.trim()) {
                      editListName(listIndex, newName.trim());
                    }
                  }}
                  className="edit-button"
                >
                  ✎
                </button>
              </div>

              <button
                onClick={() => deleteList(listIndex)}
                disabled={lists.length === 1}
                className="delete-button"
              >
                Eliminar lista
              </button>
            </div>

            <div className="input-container">
              <input
                type="text"
                value={inputValues[listIndex]}
                onChange={(e) => setInputValues(listIndex, e.target.value)}
                placeholder="Nueva tarea"
                onKeyDown={(e) => e.key === "Enter" && addToDo(listIndex)}
              />
              <button onClick={() => addToDo(listIndex)} className="add-button">
                Agregar
              </button>
            </div>

            <ul className="task-list">
              {lists.length > 0 &&
                tasks.map((task, index) => (
                  <li
                    key={index}
                    className={`task ${
                      taskToDelete.listIndex === listIndex &&
                      taskToDelete.taskIndex === index
                        ? "delete-animation"
                        : ""
                    }`}
                  >
                    <div className="task-content">
                      <span>{task}</span>
                      <div className="priority-delete-container">
                        <div className="task-priority-container">
                          <span className="priority-icon">
                            {
                              priorityColors[
                                taskPriorities[listIndex]?.[index] || "normal"
                              ]
                            }
                          </span>
                          <select
                            value={taskPriorities[listIndex][index] || "normal"}
                            onChange={(e) =>
                              handleTaskPriorityChange(
                                listIndex,
                                index,
                                e.target.value
                              )
                            }
                          >
                            <option value="high">Alta</option>
                            <option value="normal">Normal</option>
                            <option value="low">Baja</option>
                          </select>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(listIndex, index);
                          }}
                          className="delete-button"
                        >
                          Terminado
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>

            <button
              onClick={() => deleteAll(listIndex)}
              disabled={tasks.length === 0}
              className="delete-button"
            >
              Eliminar todo
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
