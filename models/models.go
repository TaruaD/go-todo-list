package models

type Todo struct {
	ID        string `json:"id" gorm:"primaryKey"`
	Name      string `json:"name"`
	Completed bool   `json:"completed"`
}
