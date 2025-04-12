import { useState, useEffect } from "react";

export function useTaskList() {
  const saveLists = JSON.parse(localStorage.getItem("taskLists") || "[]");
  const [lists, setLists] = useState(saveLists);

  const [listNames, setListNames] = useState(
    () =>
      JSON.parse(localStorage.getItem("listNames") || "[]") ||
      Array.from({ length: saveLists.length }, (_, i) => `Lista ${i + 1}`)
  );

  const savePriorities = JSON.parse(localStorage.getItem("priorities") || "[]");
  const [priorities, setPriorities] = useState(() => {
    if (savePriorities.length) {
      return savePriorities;
    }
    const initialPriorities = Array(lists.length).fill("normal");
    localStorage.setItem("priorities", JSON.stringify(initialPriorities));
    return initialPriorities;
  });

  const saveTaskPriorities = JSON.parse(
    localStorage.getItem("taskPriorities") || "[]"
  );
  const [taskPriorities, setTaskPriorities] = useState(() => {
    if (saveTaskPriorities.length) {
      return saveTaskPriorities;
    }
    const initialPriorities = lists.map((tasks) =>
      Array(tasks.length).fill("normal")
    );
    localStorage.setItem("taskPriorities", JSON.stringify(initialPriorities));
    return initialPriorities;
  });

  const [inputValues, setInputValuesState] = useState(
    Array.from({ length: lists.length }, () => "")
  );

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, [lists, priorities]);

  const addToDo = (listIndex) => {
    if (inputValues[listIndex].trim()) {
      const newLists = [...lists];
      const newList = [...newLists[listIndex], inputValues[listIndex]];
      newLists[listIndex] = newList;
      setLists(newLists);
      localStorage.setItem("taskLists", JSON.stringify(newLists));
      setInputValuesState((prev) => {
        const newInputValues = [...prev];
        newInputValues[listIndex] = "";
        return newInputValues;
      });
    }
  };

  const setInputValues = (listIndex, value) => {
    setInputValuesState((prev) => {
      const newInputValues = [...prev];
      newInputValues[listIndex] = value;
      return newInputValues;
    });
  };

  const deleteTask = (listIndex, taskIndex) => {
    const newLists = [...lists];
    const newTaskPriorities = [...taskPriorities];

    newLists[listIndex].splice(taskIndex, 1);
    newTaskPriorities[listIndex].splice(taskIndex, 1);

    setLists(newLists);
    setTaskPriorities(newTaskPriorities);
    localStorage.setItem("taskLists", JSON.stringify(newLists));
    localStorage.setItem("taskPriorities", JSON.stringify(newTaskPriorities));
  };

  const deleteAll = (listIndex) => {
    const newLists = [...lists];
    newLists[listIndex] = [];
    setLists(newLists);
    localStorage.setItem("taskLists", JSON.stringify(newLists));
  };

  const addNewList = () => {
    setLists([...lists, []]);
    setInputValuesState((prev) => [...prev, ""]);
    setListNames((prev) => [...prev, `Lista ${prev.length + 1}`]);

    setPriorities((prev) => [...prev, "normal"]);
    setTaskPriorities((prev) => [...prev, []]);
    localStorage.setItem("taskLists", JSON.stringify([...lists, []]));
    localStorage.setItem(
      "listNames",
      JSON.stringify([...listNames, `Lista ${listNames.length + 1}`])
    );
    localStorage.setItem(
      "priorities",
      JSON.stringify([...priorities, "normal"])
    );
    localStorage.setItem(
      "taskPriorities",
      JSON.stringify([...taskPriorities, []])
    );
  };

  const editListName = (listIndex, newName) => {
    if (newName && newName.trim()) {
      const updatedNames = [...listNames];
      updatedNames[listIndex] = newName.trim();
      setListNames(updatedNames);
      localStorage.setItem("listNames", JSON.stringify(updatedNames));
    }
  };

  const deleteList = (index) => {
    if (lists.length > 1) {
      const newLists = lists.filter((_, i) => i !== index);
      const newNames = listNames.filter((_, i) => i !== index);
      const newPriorities = priorities.filter((_, i) => i !== index);
      const newTaskPriorities = taskPriorities.filter((_, i) => i !== index);
      setLists(newLists);
      setListNames(newNames);
      setPriorities(newPriorities);
      setTaskPriorities(newTaskPriorities);
      setInputValuesState((prev) => prev.filter((_, i) => i !== index));
      localStorage.setItem("taskLists", JSON.stringify(newLists));
      localStorage.setItem("listNames", JSON.stringify(newNames));
      localStorage.setItem("priorities", JSON.stringify(newPriorities));
      localStorage.setItem("taskPriorities", JSON.stringify(newTaskPriorities));
    }
  };

  const handlePriorityChange = (listIndex, value) => {
    setPriorities((prev) => {
      const newPriorities = [...prev];
      newPriorities[listIndex] = value;
      localStorage.setItem("priorities", JSON.stringify(newPriorities));
      return newPriorities;
    });
  };

  const handleTaskPriorityChange = (listIndex, taskIndex, priority) => {
    const newTaskPriorities = [...taskPriorities];
    if (newTaskPriorities[listIndex].length < lists[listIndex].length) {
      newTaskPriorities[listIndex] = Array(lists[listIndex].length).fill(
        "normal"
      );
    }
    newTaskPriorities[listIndex][taskIndex] = priority;
    setTaskPriorities(newTaskPriorities);
    localStorage.setItem("taskPriorities", JSON.stringify(newTaskPriorities));
  };

  const sortTasksByPriority = (listIndex) => {
    const newLists = [...lists];
    const newTaskPriorities = [...taskPriorities];

    const sortedTasks = newLists[listIndex]
      .map((task, index) => ({
        task,
        priority: newTaskPriorities[listIndex][index] || "normal",
      }))
      .sort((a, b) => {
        const priorityOrder = { high: 1, normal: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

    newLists[listIndex] = sortedTasks.map((item) => item.task);
    newTaskPriorities[listIndex] = sortedTasks.map((item) => item.priority);

    setLists(newLists);
    setTaskPriorities(newTaskPriorities);
    localStorage.setItem("taskLists", JSON.stringify(newLists));
    localStorage.setItem("taskPriorities", JSON.stringify(newTaskPriorities));
  };

  useEffect(() => {
    if (lists.length !== priorities.length) {
      const newPriorities = Array(lists.length).fill("normal");
      setPriorities(newPriorities);
      localStorage.setItem("priorities", JSON.stringify(newPriorities));
    }
  }, [lists]);

  useEffect(() => {
    const newTaskPriorities = taskPriorities.map((priorities, index) => {
      const taskCount = lists[index].length;
      if (priorities.length !== taskCount) {
        return Array(taskCount).fill("normal");
      }
      return priorities;
    });

    if (JSON.stringify(newTaskPriorities) !== JSON.stringify(taskPriorities)) {
      setTaskPriorities(newTaskPriorities);
      localStorage.setItem("taskPriorities", JSON.stringify(newTaskPriorities));
    }
  }, [lists]);

  useEffect(() => {
    if (lists.length > taskPriorities.length) {
      const newTaskPriorities = [...taskPriorities, []];
      setTaskPriorities(newTaskPriorities);
      localStorage.setItem("taskPriorities", JSON.stringify(newTaskPriorities));
    }
  }, [lists.length]);

  return {
    lists,
    listNames,
    priorities,
    taskPriorities,
    inputValues,
    setInputValues,
    addToDo,
    deleteTask,
    deleteAll,
    addNewList,
    deleteList,
    editListName,
    handlePriorityChange,
    handleTaskPriorityChange,
    sortTasksByPriority,
    isLoading,
  };
}
