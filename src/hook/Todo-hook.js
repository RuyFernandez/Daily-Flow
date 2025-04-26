import { useState, useEffect } from "react";

export function useTaskList() {
  // Utilidad para generar IDs únicos
  const generateId = () => Date.now().toString() + Math.random().toString(36).slice(2);

  // Migración de datos antiguos (array plano) a nueva estructura de listas
  const raw = JSON.parse(localStorage.getItem("taskLists") || "[]");
  let migratedLists = [];
  if (raw.length > 0 && !raw[0]?.id) {
    // Estructura antigua: arrays de tareas
    const names = JSON.parse(localStorage.getItem("listNames") || "[]");
    const priorities = JSON.parse(localStorage.getItem("priorities") || "[]");
    migratedLists = raw.map((tasks, i) => ({
      id: generateId(),
      name: names[i] || `Lista ${i+1}`,
      priority: priorities[i] || 'normal',
      tasks: (tasks || []).map(task => typeof task === 'string' ? { id: generateId(), text: task } : task)
    }));
    localStorage.setItem("taskLists", JSON.stringify(migratedLists));
  } else {
    migratedLists = raw;
  }
  const [lists, setLists] = useState(migratedLists);

  // Estado de tareas completadas (por id de lista y de tarea)
  const [completed, setCompleted] = useState(() => {
    const saved = localStorage.getItem("completedTasks");
    let completedRaw = saved ? JSON.parse(saved) : {};
    // MIGRACIÓN: Si algún completedRaw[list.id] es array, conviértelo a objeto
    Object.keys(completedRaw).forEach(listId => {
      if (Array.isArray(completedRaw[listId])) {
        const arr = completedRaw[listId];
        const obj = {};
        arr.forEach((val, idx) => {
          // Solo copia los valores que sean booleanos y tengan un taskId válido
          if (typeof val === "boolean" && migratedLists.some(l => l.id === listId && l.tasks.some(t => t.id === idx))) {
            // Busca el taskId real
            const list = migratedLists.find(l => l.id === listId);
            const task = list.tasks[idx];
            if (task) obj[task.id] = val;
          } else if (typeof val === "object" && val !== null) {
            // Si es un objeto tipo {id, value}, intenta migrar
            if (val.id && typeof val.value === "boolean") {
              obj[val.id] = val.value;
            }
          }
        });
        completedRaw[listId] = obj;
      }
    });
    // Asegura que todos los listId sean objetos
    migratedLists.forEach(list => {
      if (!completedRaw[list.id] || typeof completedRaw[list.id] !== "object") completedRaw[list.id] = {};
      list.tasks.forEach(task => {
        if (typeof completedRaw[list.id][task.id] !== "boolean") {
          completedRaw[list.id][task.id] = false;
        }
      });
    });
    // Limpia el localStorage corrupto
    localStorage.setItem("completedTasks", JSON.stringify(completedRaw));
    return completedRaw;
  });

  // Sincronizar completed con cambios en lists
  useEffect(() => {
    setCompleted(prev => {
      let completedRaw = { ...prev };
      // Sincroniza solo tareas nuevas y elimina las que ya no existen
      lists.forEach(list => {
        if (!completedRaw[list.id]) completedRaw[list.id] = {};
        list.tasks.forEach(task => {
          if (typeof completedRaw[list.id][task.id] !== "boolean") {
            completedRaw[list.id][task.id] = false;
          }
        });
        // Elimina completados de tasks que ya no existen
        Object.keys(completedRaw[list.id]).forEach(taskId => {
          if (!list.tasks.some(t => t.id === taskId)) {
            delete completedRaw[list.id][taskId];
          }
        });
      });
      // Elimina listas que ya no existen
      Object.keys(completedRaw).forEach(listId => {
        if (!lists.some(l => l.id === listId)) delete completedRaw[listId];
      });
      localStorage.setItem("completedTasks", JSON.stringify(completedRaw));
      return completedRaw;
    });
  }, [lists]);

  // inputValues ahora es objeto por id de lista
  const [inputValues, setInputValuesState] = useState(() => {
    const obj = {};
    for (const list of migratedLists) obj[list.id] = "";
    return obj;
  });

  // Añadir tarea a lista por ID
  const addToDo = (listId) => {
    if (inputValues[listId]?.trim()) {
      setLists(prev => prev.map(list =>
        list.id === listId
          ? { ...list, tasks: [...list.tasks, { id: generateId(), text: inputValues[listId] }] }
          : list
      ));
      setInputValuesState(prev => ({ ...prev, [listId]: "" }));
    }
  };

  // Editar input value
  const setInputValues = (listId, value) => {
    setInputValuesState(prev => ({ ...prev, [listId]: value }));
  };

  // Eliminar tarea por ID de lista y de tarea
  const deleteTask = (listId, taskId) => {
    setLists(prev => prev.map(list =>
      list.id === listId
        ? { ...list, tasks: list.tasks.filter(task => task.id !== taskId) }
        : list
    ));
  };

  // Eliminar todas las tareas de una lista
  const deleteAll = (listId) => {
    setLists(prev => prev.map(list =>
      list.id === listId ? { ...list, tasks: [] } : list
    ));
  };

  // Agregar nueva lista
  const addNewList = () => {
    const newId = generateId();
    setLists(prev => ([
      ...prev,
      { id: newId, name: `Lista ${prev.length + 1}`, priority: 'normal', tasks: [] }
    ]));
    setInputValuesState(prev => ({ ...prev, [newId]: "" }));
  };

  // Editar nombre de lista
  const editListName = (listId, newName) => {
    setLists(prev => prev.map(list =>
      list.id === listId ? { ...list, name: newName.trim() } : list
    ));
  };

  // Eliminar lista
  const deleteList = (listId) => {
    setLists(prev => prev.filter(list => list.id !== listId));
    setInputValuesState(prev => {
      const copy = { ...prev };
      delete copy[listId];
      return copy;
    });
  };

  // Cambiar prioridad
  const handlePriorityChange = (listId, value) => {
    setLists(prev => prev.map(list =>
      list.id === listId ? { ...list, priority: value } : list
    ));
  };

  // Sincronizar con localStorage
  useEffect(() => {
    localStorage.setItem("taskLists", JSON.stringify(lists));
  }, [lists]);

  return {
    lists,
    setLists,
    inputValues,
    setInputValues,
    addToDo,
    deleteTask,
    deleteAll,
    addNewList,
    deleteList,
    editListName,
    handlePriorityChange,
    completed,
    setCompleted,
  };

}