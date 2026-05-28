const API_URL = "/v1"
const DEFAULT_STATUS = "pending"
const Input = document.getElementById("todo-input");
const ListEL = document.getElementById("todo-list");
const clearBtn = document.querySelector(".clear-btn");

Input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        addTodo()
    }
})

async function fetchTodos() {
    try {

        const resp = await fetch(`${API_URL}/todo`)
        const todos = await resp.json()
        ListEL.innerHTML = ''
        clearBtn.style.display = (Array.isArray(todos) && todos.length > 0) ? 'inline-block' : 'none'
        todos.forEach(todo=>{
                const li = createTodo(todo)
                ListEL.appendChild(li)
            }
        )
    } catch (error) {
        console.log("加载失败", error)
    }
}
async function addTodo() {
    const title = Input.value.trim()
    if (title === "") {return}
    try {
        const resp = await fetch(`${API_URL}/todo`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: title,
                status: DEFAULT_STATUS
            }),
        })
        const data = await resp.json()
        Input.value = ''
        Input.focus()
        await fetchTodos()
    } catch (error) {
        console.log("错误", error)
    }
}
async function deleteTodo(id){
    try {
        const resp=await fetch(`${API_URL}/todo/${id}`,{
            method: "DELETE"
        })
        if (resp.ok) {
            await fetchTodos()
        }

    }catch(err){
        console.log(err)
    }
}
function createTodo(todo) {
    const span = document.createElement("span")
    const meta = document.createElement("small");
    span.textContent=todo.title
    meta.className = "todo-meta";
    const li=document.createElement("li");
    li.className="todo-item"
    if (todo.status === "done") {
        li.classList.add("done")
    }
    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "del-btn";
    delBtn.textContent = "删除";
    delBtn.addEventListener("click", ()=>
        deleteTodo(todo.id))
    li.appendChild(meta);
    li.appendChild(span);
    li.appendChild(delBtn);
    return li;

}
async function deleteAll() {
    if (!confirm("确定要清空所有任务吗？")) return
    clearBtn.disabled = true
    try {
        const resp = await fetch(`${API_URL}/todos`, {
            method: "DELETE",
            headers: {"Content-Type": "application/json"},
        })
        const data = await resp.json().catch(() => ({}))
        if (resp.ok) {
            await fetchTodos()
        } else {
            alert(data?.error ? `删除失败：${data.error}` : "删除失败")
        }
    } catch (err) {
        console.log(err)
        alert("删除失败：网络或服务器错误")
    } finally {
        clearBtn.disabled = false
    }
}
fetchTodos()