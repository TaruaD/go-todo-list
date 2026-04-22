package db

type Todo struct {
	ID        string `json:id`
	Name      string `json:name`
	Completed bool   `json:completed`
	//Name->Description
}

var Todos []Todo
