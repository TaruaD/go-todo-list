/**
 * go-todo-list 前端脚本
 * 职责：读取页面输入 → 通过 fetch 调用 Gin REST API → 渲染列表
 *
 * 对应后端（main.go）：
 *   GET    /v1/todo       获取全部
 *   POST   /v1/todo       新增
 *   PUT    /v1/todo/:id   修改
 *   DELETE /v1/todo/:id   删除（后端路由需自行补全）
 *
 * 注意：main.go 里 r.Run() 之后的代码不会执行，/v1 路由须写在 Run 之前，否则前端会 404。
 */

// ---------------------------------------------------------------------------
// 配置
// ---------------------------------------------------------------------------

/**
 * API 根路径
 * 知识点：使用相对路径 "/v1" 而非完整 URL，可与页面同源（localhost:8080），避免跨域 CORS。
 * 若前后端分离到不同端口，才需要写 "http://localhost:8080/v1" 并在 Gin 配置 CORS。
 */
const API_URL = "/v1";

/** 与 Go 结构体 Todo 的 json 字段一致：id, title, status */
const DEFAULT_STATUS = "pending";

// ---------------------------------------------------------------------------
// DOM 引用（页面加载后即可获取，脚本在 </body> 前引入）
// ---------------------------------------------------------------------------

/**
 * 知识点：document.getElementById 通过 id 获取单个元素。
 * index.html 中：id="todo-input"、id="todo-list"
 */
const todoInput = document.getElementById("todo-input");
const todoListEl = document.getElementById("todo-list");

// ---------------------------------------------------------------------------
// 初始化
// ---------------------------------------------------------------------------

/**
 * 知识点：DOMContentLoaded 在 HTML 解析完成后触发，比 window.onload 更早，适合拉取首屏数据。
 */
document.addEventListener("DOMContentLoaded", () => {
    fetchTodos();
});

/**
 * 知识点：keypress / keydown 监听键盘；Enter 键 key === "Enter"
 */
todoInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        addTodo();
    }
});

// ---------------------------------------------------------------------------
// 与 Gin 通信的核心：fetch + async/await
// ---------------------------------------------------------------------------

/**
 * 获取全部待办
 *
 * 知识点：
 * - fetch(url) 返回 Promise<Response>，默认 GET
 * - response.ok 表示状态码 200-299
 * - response.json() 把响应体解析为 JS 对象（Gin 的 c.JSON 发的就是 JSON）
 */
async function fetchTodos() {
    try {
        const response = await fetch(`${API_URL}/todo`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const todos = await response.json();
        renderTodoList(Array.isArray(todos) ? todos : []);
    } catch (err) {
        console.error("获取列表失败:", err);
        showMessage("无法加载列表，请确认后端已启动且 /v1 路由已注册");
    }
}

/**
 * 新增待办（供 index.html 的 onclick="addTodo()" 调用）
 *
 * 知识点：
 * - POST：创建资源
 * - headers["Content-Type"] = "application/json" 告诉 Gin 用 BindJSON/ShouldBindJSON 解析
 * - body: JSON.stringify(obj) 把 JS 对象序列化为 JSON 字符串
 * - Gin 侧字段名需与 json tag 一致：title, status（见 main.go Todo 结构体）
 */
async function addTodo() {
    const title = todoInput.value.trim();
    if (!title) {
        showMessage("请输入任务内容");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/todo`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: title,
                status: DEFAULT_STATUS,
            }),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            throw new Error(data.error || `HTTP ${response.status}`);
        }

        todoInput.value = "";
        todoInput.focus();
        await fetchTodos();
    } catch (err) {
        console.error("添加失败:", err);
        showMessage("添加失败，请查看控制台");
    }
}

/**
 * 删除单条（列表里按钮调用）
 *
 * 知识点：
 * - DELETE：删除资源，id 放在 URL 路径：/v1/todo/3
 * - REST 风格：资源名复数 + :id 路径参数，Gin 用 c.Param("id") 读取
 */
async function deleteTodo(id) {
    if (!confirm("确定删除这条任务吗？")) return;

    try {
        const response = await fetch(`${API_URL}/todo/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || `HTTP ${response.status}`);
        }

        await fetchTodos();
    } catch (err) {
        console.error("删除失败:", err);
        showMessage("删除失败：请确认后端已实现 DELETE /v1/todo/:id");
    }
}

/**
 * 切换完成状态（点击任务文字时调用，可选增强）
 *
 * 知识点：
 * - PUT：更新已有资源，需带上 id；body 里传要更新的字段
 * - 先 GET 列表再本地改 status 再 PUT，是常见的前端更新模式
 */
async function toggleTodoStatus(todo) {
    const nextStatus = todo.status === "done" ? "pending" : "done";
    const payload = {
        id: todo.id,
        title: todo.title,
        status: nextStatus,
    };

    try {
        const response = await fetch(`${API_URL}/todo/${todo.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok || data.error) {
            throw new Error(data.error || `HTTP ${response.status}`);
        }

        await fetchTodos();
    } catch (err) {
        console.error("更新失败:", err);
        showMessage("更新状态失败");
    }
}

/**
 * 清空所有（供 onclick="clearAll()" 调用）
 * 逐条调用删除接口；若后端未实现 DELETE，会提示失败。
 */
async function clearAll() {
    if (!confirm("确定清空所有任务吗？此操作会请求后端逐条删除。")) return;

    try {
        const response = await fetch(`${API_URL}/todo`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const todos = await response.json();
        if (!Array.isArray(todos) || todos.length === 0) {
            todoListEl.innerHTML = "";
            return;
        }

        for (const todo of todos) {
            await fetch(`${API_URL}/todo/${todo.id}`, { method: "DELETE" });
        }
        await fetchTodos();
    } catch (err) {
        console.error("清空失败:", err);
        showMessage("清空失败，请检查 DELETE 接口");
    }
}

// ---------------------------------------------------------------------------
// 渲染 DOM
// ---------------------------------------------------------------------------

/**
 * 渲染整个列表
 *
 * 知识点：
 * - innerHTML = "" 清空子节点
 * - 用 document.createElement 创建节点，比拼接 HTML 字符串更安全（防 XSS）
 */
function renderTodoList(todos) {
    todoListEl.innerHTML = "";

    if (todos.length === 0) {
        const empty = document.createElement("li");
        empty.className = "todo-empty";
        empty.textContent = "暂无任务，添加一条吧";
        todoListEl.appendChild(empty);
        return;
    }

    todos.forEach((todo) => {
        todoListEl.appendChild(createTodoItem(todo));
    });
}

/**
 * 创建单条 <li>
 *
 * 知识点：
 * - textContent 设置纯文本，自动转义，避免 XSS
 * - 事件用 addEventListener 绑定，而不是内联 onclick 拼接用户输入
 * - classList.toggle("done", condition) 根据状态切换样式（需在 CSS 中定义 .done）
 */
function createTodoItem(todo) {
    const li = document.createElement("li");
    li.className = "todo-item";
    if (todo.status === "done") {
        li.classList.add("done");
    }

    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = todo.title;
    span.title = "点击切换完成/未完成";
    span.addEventListener("click", () => toggleTodoStatus(todo));

    const meta = document.createElement("span");
    meta.className = "task-status";
    meta.textContent = todo.status === "done" ? "已完成" : "待办";

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "del-btn";
    delBtn.textContent = "删除";
    delBtn.addEventListener("click", () => deleteTodo(todo.id));

    li.appendChild(span);
    li.appendChild(meta);
    li.appendChild(delBtn);
    return li;
}

// ---------------------------------------------------------------------------
// 工具函数
// ---------------------------------------------------------------------------

/** 简单提示（可换成页面内的 toast 组件） */
function showMessage(msg) {
    alert(msg);
}

/**
 * 挂到 window，保证 index.html 里 onclick="addTodo()" / clearAll() 能访问
 * 知识点：非 module 的 <script> 里 function 声明在全局；显式挂 window 更清晰
 */
window.addTodo = addTodo;
window.clearAll = clearAll;
window.deleteTodo = deleteTodo;
