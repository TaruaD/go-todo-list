package db

import (
	"log"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// DB 是全局变量，供包内其他函数复用
var DB *gorm.DB

type Todo struct {
	ID        string `json:"id" gorm:"primaryKey"`
	Name      string `json:"name"`
	Completed bool   `json:"completed"`
}

// Init 初始化数据库连接
func Init() {
	var err error
	// 注意：这里使用的是全局变量 DB，而不是局部变量
	DB, err = gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
	if err != nil {
		log.Fatalf("连接数据库失败: %v", err)
	}

	// 自动迁移：创建或更新表结构
	err = DB.AutoMigrate(&Todo{})
	if err != nil {
		log.Fatalf("自动迁移失败: %v", err)
	}
}

func CreateTodo(todo Todo) error {
	result := DB.Create(&todo)
	return result.Error
}

func GetAllTodos() ([]Todo, error) {
	var todos []Todo
	result := DB.Find(&todos)
	return todos, result.Error
}
func DeleteTodo(id string) error {
	// 显式指定 ID 进行删除
	result := DB.Delete(&Todo{}, "id = ?", id)
	return result.Error
}
