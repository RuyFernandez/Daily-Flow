import "../Styles/ToDoList.css";
import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useTaskList } from "../hook/Todo-hook";
import ConfirmModal from "./ConfirmModal";

export default function ToDoList() {
  // Estado para editar nombre de lista (similar a tareas)
  const [listEdit, setListEdit] = useState({ listIndex: -1, value: "" });

  const startEditListName = (listId, value) => {
    setListEdit({ listId, value });
  };
  const handleEditListNameChange = (e) => {
    setListEdit((edit) => ({ ...edit, value: e.target.value }));
  };
  const saveEditListName = () => {
    if (listEdit.value.trim()) {
      editListName(listEdit.listId, listEdit.value.trim());
    }
    setListEdit({ listId: null, value: "" });
  };
  const cancelEditListName = () => {
    setListEdit({ listId: null, value: "" });
  };

  const {
    lists,
    setLists,
    handlePriorityChange,
    deleteAll,
    addNewList,
    deleteList,
    editListName,
    addToDo,
    deleteTask,
    inputValues,
    setInputValues,
    completed,
    setCompleted,
  } = useTaskList();

  const [taskToDelete, setTaskToDelete] = useState({
    listId: null,
    taskId: null,
  });
  const [showTaskDeleteModal, setShowTaskDeleteModal] = useState(false);
  const [deletingTask, setDeletingTask] = useState({
    listId: null,
    taskId: null,
  });
  const [listToDelete, setListToDelete] = useState(null);
  const [showListDeleteModal, setShowListDeleteModal] = useState(false);
  const [taskEdit, setTaskEdit] = useState({
    listId: null,
    taskId: null,
    value: "",
  });

  const handleDeleteTask = (listId, taskId) => {
    setTaskToDelete({ listId, taskId });
    setShowTaskDeleteModal(true);
  };

  const confirmDeleteTask = () => {
    setDeletingTask({ ...taskToDelete });
    setShowTaskDeleteModal(false);
    setTimeout(() => {
      deleteTask(taskToDelete.listId, taskToDelete.taskId);
      setCompleted((prev) => {
        const updated = { ...prev };
        if (updated[taskToDelete.listId]) {
          delete updated[taskToDelete.listId][taskToDelete.taskId];
        }
        localStorage.setItem("completedTasks", JSON.stringify(updated));
        return updated;
      });
      setDeletingTask({ listId: null, taskId: null });
      setTaskToDelete({ listId: null, taskId: null });
    }, 500); // coincide con la animación de borrado
  };

  const handleDeleteList = (listId) => {
    setListToDelete(listId);
    setShowListDeleteModal(true);
  };

  const confirmDeleteList = () => {
    deleteList(listToDelete);
    setCompleted((prev) => {
      const updated = { ...prev };
      delete updated[listToDelete];
      localStorage.setItem("completedTasks", JSON.stringify(updated));
      return updated;
    });
    setShowListDeleteModal(false);
    setListToDelete(null);
  };

  const handleToggleComplete = (listId, taskId) => {
    setCompleted((prev) => {
      const updated = { ...prev, [listId]: { ...prev[listId] } };
      updated[listId][taskId] = !updated[listId][taskId];
      localStorage.setItem("completedTasks", JSON.stringify(updated));
      return updated;
    });
  };

  const startEditTask = (listId, taskId, value) => {
    setTaskEdit({ listId, taskId, value });
  };

  const handleEditTaskChange = (e) => {
    setTaskEdit((edit) => ({ ...edit, value: e.target.value }));
  };

  const saveEditTask = () => {
    if (taskEdit.value.trim()) {
      setLists((prev) =>
        prev.map((list) =>
          list.id === taskEdit.listId
            ? {
                ...list,
                tasks: list.tasks.map((t) =>
                  t.id === taskEdit.taskId ? { ...t, text: taskEdit.value } : t
                ),
              }
            : list
        )
      );
    }
    setTaskEdit({ listId: null, taskId: null, value: "" });
  };

  const cancelEditTask = () => {
    setTaskEdit({ listId: null, taskId: null, value: "" });
  };

  // Función para mover tareas entre listas y reordenar
  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    setLists((prevLists) => {
      let newLists = [...prevLists];
      const sourceListIdx = newLists.findIndex(
        (l) => l.id === source.droppableId
      );
      const destListIdx = newLists.findIndex(
        (l) => l.id === destination.droppableId
      );
      if (sourceListIdx === -1 || destListIdx === -1) return newLists;
      if (source.droppableId === destination.droppableId) {
        // Reordenar dentro de la misma lista
        const list = { ...newLists[sourceListIdx] };
        const tasks = [...list.tasks];
        const [removed] = tasks.splice(source.index, 1);
        tasks.splice(destination.index, 0, removed);
        list.tasks = tasks;
        newLists[sourceListIdx] = list;
      } else {
        // Mover entre listas
        const sourceList = { ...newLists[sourceListIdx] };
        const destList = { ...newLists[destListIdx] };
        const sourceTasks = [...sourceList.tasks];
        const destTasks = [...destList.tasks];
        const [removed] = sourceTasks.splice(source.index, 1);
        destTasks.splice(destination.index, 0, removed);
        sourceList.tasks = sourceTasks;
        destList.tasks = destTasks;
        newLists[sourceListIdx] = sourceList;
        newLists[destListIdx] = destList;
      }
      return newLists;
    });

    setCompleted((prevCompleted) => {
      const newCompleted = { ...prevCompleted };
      // Siempre objetos, nunca arrays
      if (!newCompleted[source.droppableId]) newCompleted[source.droppableId] = {};
      if (!newCompleted[destination.droppableId]) newCompleted[destination.droppableId] = {};
      // Si es dentro de la misma lista, no cambia el estado de completado
      if (source.droppableId === destination.droppableId) {
        return newCompleted;
      }
      // Si es entre listas, mueve el estado de la tarea
      const taskId = lists
        .find((l) => l.id === source.droppableId)
        ?.tasks[source.index]?.id;
      if (taskId) {
        const wasCompleted = newCompleted[source.droppableId][taskId];
        delete newCompleted[source.droppableId][taskId];
        newCompleted[destination.droppableId][taskId] = wasCompleted;
      }
      localStorage.setItem("completedTasks", JSON.stringify(newCompleted));
      return newCompleted;
    });
  };

  return (
    <DragDropContext
      onDragEnd={onDragEnd}
      dropAnimation={{ duration: 180, easing: "cubic-bezier(.22,1,.36,1)" }}
    >
      <div className="container">
        <h1 className="toDoList-title">Lista de tareas</h1>

        <button className="add-list-button" onClick={addNewList}>
          + Nueva Lista
        </button>

        <div className="lists-container">
          {lists.map((list) => (
            <Droppable droppableId={list.id} key={list.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`list-column${
                    snapshot.isDraggingOver ? " is-dragging-over" : ""
                  }`}
                  style={{
                    background: snapshot.isDraggingOver ? "#232b36" : undefined,
                  }}
                >
                  <div className="list-header">
                    <div
                      className="priority-indicator"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 6,
                      }}
                    >
                      <button
                        className="priority-btn"
                        title={`Prioridad: ${
                          list.priority === "high"
                            ? "Alta"
                            : list.priority === "low"
                            ? "Baja"
                            : "Media"
                        }`}
                        aria-label={`Cambiar prioridad de la lista: ${
                          list.priority === "high"
                            ? "Alta"
                            : list.priority === "low"
                            ? "Baja"
                            : "Media"
                        }`}
                        onClick={() => {
                          const order = ["high", "normal", "low"];
                          const current = list.priority || "normal";
                          const next =
                            order[(order.indexOf(current) + 1) % order.length];
                          handlePriorityChange(list.id, next);
                        }}
                        style={{ marginRight: 8 }}
                      >
                        <span
                          className={`priority-dot priority-${
                            list.priority || "normal"
                          }`}
                          style={{ marginRight: 6 }}
                        />
                        <span style={{ fontWeight: 500 }}>
                          {list.priority === "high"
                            ? "Alta"
                            : list.priority === "low"
                            ? "Baja"
                            : "Media"}
                        </span>
                      </button>
                    </div>
                    <div className="list-name-container">
                      {listEdit && listEdit.listId === list.id ? (
                        <>
                          <input
                            type="text"
                            value={listEdit.value}
                            onChange={handleEditListNameChange}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEditListName();
                              if (e.key === "Escape") cancelEditListName();
                            }}
                            autoFocus
                            className="edit-task-input"
                            style={{ minWidth: 80, maxWidth: 220 }}
                          />
                          <button
                            onClick={saveEditListName}
                            className="button done-btn"
                            title="Guardar cambios"
                            style={{ marginLeft: 4 }}
                          >
                            <span role="img" aria-label="Guardar">
                              ✔️
                            </span>
                          </button>
                          <button
                            onClick={cancelEditListName}
                            className="button cancel-btn"
                            title="Cancelar"
                          >
                            <span role="img" aria-label="Cancelar">
                              ✖️
                            </span>
                          </button>
                        </>
                      ) : (
                        <span
                          className="list-name"
                          onClick={() => startEditListName(list.id, list.name)}
                          style={{ cursor: "pointer" }}
                        >
                          {list.name}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteList(list.id)}
                      disabled={lists.length === 1}
                      className="delete-button"
                    >
                      Eliminar lista
                    </button>
                  </div>

                  <div className="input-container">
                    <input
                      type="text"
                      value={inputValues[list.id] || ""}
                      onChange={(e) => setInputValues(list.id, e.target.value)}
                      placeholder="Nueva tarea"
                      onKeyDown={(e) => e.key === "Enter" && addToDo(list.id)}
                    />
                    <button
                      onClick={() => addToDo(list.id)}
                      className="add-button"
                    >
                      Agregar
                    </button>
                  </div>

                  <ul className="task-list">
                    {list.tasks
                      .filter(
                        (task) =>
                          task &&
                          typeof task.id === "string" &&
                          typeof task.text === "string"
                      )
                      .map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`task${
                                snapshot.isDragging ? " is-dragging" : ""
                              }${
                                deletingTask.listId === list.id &&
                                list.tasks.findIndex(
                                  (t) => t.id === deletingTask.taskId
                                ) === index
                                  ? " delete-animation"
                                  : ""
                              }${completed[list.id]?.[task.id] ? ' completed' : ''}`}
                              style={provided.draggableProps.style}
                            >
                              <div className="task-content">
                                <input
                                  type="checkbox"
                                  checked={!!completed[list.id]?.[task.id]}
                                  onChange={() =>
                                    handleToggleComplete(list.id, task.id)
                                  }
                                  className="task-checkbox"
                                />
                                {taskEdit.listId === list.id &&
                                  taskEdit.taskId === task.id ? (
                                    <>
                                      <input
                                        type="text"
                                        value={taskEdit.value}
                                        onChange={handleEditTaskChange}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") saveEditTask();
                                          if (e.key === "Escape") cancelEditTask();
                                        }}
                                        autoFocus
                                        className="edit-task-input"
                                      />
                                    <div className="edit-task-actions">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          saveEditTask();
                                        }}
                                        className="button done-btn"
                                        title="Guardar cambios"
                                      >
                                        <span role="img" aria-label="Guardar">
                                          ✔️
                                        </span>
                                      </button>
                                      <button
                                        onClick={cancelEditTask}
                                        className="button cancel-btn"
                                        title="Cancelar"
                                      >
                                        <span role="img" aria-label="Cancelar">
                                          ✖️
                                        </span>
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <span
                                      className="task-text"
                                      onClick={() =>
                                        startEditTask(
                                          list.id,
                                          task.id,
                                          task.text
                                        )
                                      }
                                    >
                                      {task.text}
                                    </span>
                                    <button
                                      onClick={() =>
                                        handleDeleteTask(list.id, task.id)
                                      }
                                      className="delete-button"
                                    >
                                      Eliminar tarea
                                    </button>
                                  </>
                                )}
                              </div>
                            </li>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </ul>
                  <button
                    onClick={() => {
                      deleteAll(list.id);
                      setCompleted((prev) => {
                        const updated = { ...prev };
                        updated[list.id] = {};
                        localStorage.setItem(
                          "completedTasks",
                          JSON.stringify(updated)
                        );
                        return updated;
                      });
                    }}
                    disabled={list.tasks.length === 0}
                    className="delete-button"
                  >
                    Eliminar todo
                  </button>
                </div>
              )}
            </Droppable>
          ))}
          {showTaskDeleteModal && (
            <ConfirmModal
              message="¿Estás seguro de que quieres eliminar esta tarea?"
              onConfirm={confirmDeleteTask}
              onCancel={() => setShowTaskDeleteModal(false)}
            />
          )}
          {showListDeleteModal && (
            <ConfirmModal
              message="¿Estás seguro de que quieres eliminar esta lista?"
              onConfirm={confirmDeleteList}
              onCancel={() => setShowListDeleteModal(false)}
            />
          )}
        </div>
      </div>
    </DragDropContext>
  );
}
