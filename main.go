package main

import (
	"encoding/json"
	"log"
	"net/http"
	"tod/db"

	"github.com/google/uuid"
)

func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	}
}
func main() {
	//createHandler
	http.HandleFunc("/create", enableCORS(createHandler))
	//deleteHandler
	http.HandleFunc("/Delete", enableCORS(deleteHandler))
	//getallHandler
	http.HandleFunc("/GetAll", enableCORS(getAllHandler))
	addr := ":8080"
	log.Printf("Server is running on %s", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatal(err)
	}

}
func createHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "仅支持 POST 请求", http.StatusMethodNotAllowed)
		return
	}
	params := map[string]string{}
	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		log.Println("Error decoding request body:", err)
		http.Error(w, "无效的请求体", http.StatusBadRequest)
		return
	}
	name := params["name"]
	id := uuid.New().String()
	var newTodo db.Todo = db.Todo{
		ID:        id,
		Name:      name,
		Completed: false,
	}
	db.Todos = append(db.Todos, newTodo)
	log.Println("todos:", db.Todos)
	w.WriteHeader(http.StatusOK)
}
func getAllHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(db.Todos)
	log.Println("handlegetall:", db.Todos)
}
func deleteHandler(w http.ResponseWriter, r *http.Request) {
	params := map[string]string{}
	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		log.Println("Error decoding request body:", err)
		http.Error(w, "无效的请求体", http.StatusBadRequest)
		return
	}
	id := params["id"]
	for i, todo := range db.Todos {
		if todo.ID == id {
			db.Todos = append(db.Todos[:i], db.Todos[i+1:]...)
			break
		}
	}
	w.WriteHeader(http.StatusOK)
}
