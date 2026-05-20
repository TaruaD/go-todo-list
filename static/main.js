const API_URL = "/v1"
const DEFAULT_STATUS = "pending"
const Input = document.getElementById("todo-input");
const ListEL = document.getElementById("todo-list");
const clearBtn = document.querySelector(".clear-btn");
clearBtn.style.display='none'

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
    const li=document.createElement("li");
    li.className="todo-item"
    if (todo.status === "done") {
        li.classList.add("done")
    }
   const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = todo.title;
    span.title = "点击切换完成/未完成";
    span.addEventListener("click", () => toggleTodoStatus(todo));

    const meta = document.createElement("span");
    meta.className = "task-status";

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
fetchTodos()