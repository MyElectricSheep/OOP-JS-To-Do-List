// Lists related selectors
const listsContainer = document.querySelector("[data-lists]");
const newListForm = document.querySelector("[data-new-list-form]");
const newListInput = document.querySelector("[data-new-list-input]");
const deleteListBtn = document.querySelector("[data-delete-list-button]");

// Tasks related selectors
const listDisplayContainer = document.querySelector(
  "[data-list-display-container]"
);
const listTitle = document.querySelector("[data-list-title]");
const listCount = document.querySelector("[data-list-count]");
const tasksContainer = document.querySelector("[data-tasks]");
const newTaskForm = document.querySelector("[data-new-task-form]");
const newTaskInput = document.querySelector("[data-new-task-input]");
const clearTasksBtn = document.querySelector("[data-clear-tasks-button]");

// Symbolic constants (fixed values)
const LOCAL_STORAGE_LIST_KEY = "task.lists";
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = "task.selectedListId";

class TodoList {
  constructor() {
    this._lists =
      JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];
    this._selectedListId = localStorage.getItem(
      LOCAL_STORAGE_SELECTED_LIST_ID_KEY
    );
  }

  // Instance Methods
  addNewList(e) {
    e.preventDefault();
    const userInput = newListInput.value;
    if (!userInput) return alert("Please enter the name of a new list");
    if (userInput.length > 14)
      return alert("The list name should be less than 14 characters");
    const newList = TodoList.createList(userInput);
    this._lists.push(newList);
    newListInput.value = null;
    this.saveAndRender();
  }

  selectList(e) {
    if (e.target.tagName.toLowerCase() === "li") {
      this._selectedListId = e.target.dataset.listId;
    }
    this.saveAndRender();
  }

  deleteList() {
    this._lists = this._lists.filter((l) => l.id !== this._selectedListId);
    this._selectedListId = null;
    this.saveAndRender();
  }

  saveToLocalStorage() {
    if (!this._lists.length) {
      localStorage.removeItem(LOCAL_STORAGE_LIST_KEY) 
      localStorage.removeItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY)
      return;
    }
    localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(this._lists));
    localStorage.setItem(
      LOCAL_STORAGE_SELECTED_LIST_ID_KEY,
      this._selectedListId
    );
  }

  saveAndRender() {
    this.saveToLocalStorage();
    render();
  }

  renderLists() {
    this._lists.forEach((li) => {
      const newListItem = document.createElement("li");
      newListItem.dataset.listId = li.id;
      newListItem.textContent = li.name;
      newListItem.classList.add("list-name");
      if (todoList._selectedListId === li.id)
        newListItem.classList.add("active-list");
      listsContainer.appendChild(newListItem);
    });
  }

  // Static Methods
  static createList(name) {
    return {
      id: Date.now().toString(),
      name,
      tasks: [],
    };
  }

  static clearElement(item) {
    while (item.firstChild) {
      item.removeChild(item.firstChild);
    }
  }
}

class Task {
  constructor(id, name, complete) {
    (this.id = id), (this.name = name), (this.complete = complete);
  }

  static markTaskAsDone(e) {
    const input = e.currentTarget.children[0];
    if (input.tagName.toLowerCase() === "input") {
      input.checked = !input.checked;
      const selectedList = todoList._lists.find(
        (list) => list.id === todoList._selectedListId
      );
      const selectedTask = selectedList.tasks.find(
        (task) => task.id === input.dataset.taskId
      );
      selectedTask.complete = input.checked;
      todoList.saveToLocalStorage();
      Task.renderTaskCount(selectedList);
    }
  }

  static renderTaskCount(list) {
    const incompleteTasksCount = list.tasks.filter((task) => !task.complete)
      .length;
    listCount.textContent = !incompleteTasksCount
      ? "No ongoing tasks!"
      : `${incompleteTasksCount} task${
          incompleteTasksCount > 1 ? "s" : ""
        } remaining`;
  }

  static clearFinishedTasks() {
    const selectedList = todoList._lists.find(
      (list) => list.id === todoList._selectedListId
    );
    selectedList.tasks = selectedList.tasks.filter((t) => !t.complete);
    todoList.saveAndRender();
  }

  static addNewTask(e) {
    e.preventDefault();
    const taskName = newTaskInput.value;
    if (!taskName) return alert("Please enter a new task");
    if (taskName.length > 14)
      return alert("The task should be less than 14 characters");
    const newTask = Task.createTask(taskName);

    newTaskInput.value = null;
    const selectedList = todoList._lists.find(
      (list) => list.id === todoList._selectedListId
    );
    selectedList.tasks.push(newTask);
    todoList.saveAndRender();
  }

  static createTask(name) {
    return new Task(Date.now().toString(), name, false);
  }

  static renderTasks(selectedList) {
    selectedList.tasks.forEach((t) => {
      const newTask = document.createElement("div");
      newTask.classList.add("task");
      newTask.innerHTML = `
             <input 
                type="checkbox"
                data-task-id=${t.id}
                ${t.complete ? "checked" : ""}
              />
              <label for=${t.id}>
                <span class="custom-checkbox"></span>
                ${t.name}
              </label>`;
      tasksContainer.appendChild(newTask);
      newTask.addEventListener("click", Task.markTaskAsDone);
    });
  }
}

const todoList = new TodoList();

listsContainer.addEventListener("click", todoList.selectList.bind(todoList));
deleteListBtn.addEventListener("click", todoList.deleteList.bind(todoList));
newListForm.addEventListener("submit", todoList.addNewList.bind(todoList));
newTaskForm.addEventListener("submit", Task.addNewTask);
clearTasksBtn.addEventListener("click", Task.clearFinishedTasks);

function render() {
  TodoList.clearElement(listsContainer);
  todoList.renderLists();
  const selectedList = todoList._lists.find(
    (list) => list.id === todoList._selectedListId
  );
  if (!todoList._selectedListId) {
    listDisplayContainer.style.display = "none";
  } else {
    listDisplayContainer.style.display = "";
    listTitle.textContent = selectedList.name;
    Task.renderTaskCount(selectedList);
    TodoList.clearElement(tasksContainer);
    Task.renderTasks(selectedList);
  }
}

render();
