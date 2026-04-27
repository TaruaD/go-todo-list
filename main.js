const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const API_URL = "http://localhost:8080";

// 1. 页面初始化：获取已有数据
document.addEventListener("DOMContentLoaded", fetchTodos);

// 监听回车键添加
todoInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        addTodo();
    }
});

// 获取所有待办事项
async function fetchTodos() {
    try {
        const response = await fetch(`${API_URL}/GetAll`);
        const todos = await response.json();

        // 清空当前列表并重新渲染
        todoList.innerHTML = '';
        if (todos) {
            todos.forEach(todo => {
                renderTodo(todo);
            });
        }
    } catch (error) {
        console.error("获取数据失败:", error);
    }
}

// 渲染单个任务到页面
function renderTodo(todo) {
    const li = document.createElement("li");
    li.innerHTML = `
        <span class="task-text">${todo.name}</span>
        <button class="del-btn" onclick="deleteTask('${todo.id}')">删除</button>
    `;
    todoList.appendChild(li);
}

// 2. 添加任务
async function addTodo() {
    const taskName = todoInput.value.trim();
    if (taskName === '') return;

    try {
        const response = await fetch(`${API_URL}/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: taskName })
        });

        if (response.ok) {
            todoInput.value = ''; // 清空输入框
            fetchTodos();        // 重新拉取列表以同步后端
        }
    } catch (error) {
        console.error("添加失败:", error);
    }
}

// 3. 删除任务
async function deleteTask(id) {
    try {
        const response = await fetch(`${API_URL}/Delete`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: id })
        });

        if (response.ok) {
            fetchTodos(); // 删除成功后刷新列表
        }
    } catch (error) {
        console.error("删除失败:", error);
    }
}

// 清空所有（前端演示，建议后端也增加对应的接口）
function clearAll() {
    if (confirm("确定要清空前端显示吗？(后端数据需配合接口)")) {
        todoList.innerHTML = '';
    }
}