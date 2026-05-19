package main

import (
	"fmt"
	"log"
	"tod/router"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// Todo Model
type Todo struct {
	ID     int    `json:"id"`
	Title  string `json:"title"`
	Status string `json:"status"`
}

func main() {
	//数据库
	db, err := gorm.Open(sqlite.Open("db/test.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("连接失败:", err)
	}
	db.AutoMigrate(&Todo{})
	fmt.Println("连接数据库成功")
	rMain := router.Router()
	rMain.Run(":8080")
	V1Group := rMain.Group("/v1")
	{
		//添加
		V1Group.POST("/todo", func(c *gin.Context) {})
		//查看所有
		V1Group.GET("/todo", func(c *gin.Context) {

		})
		//查看某个
		V1Group.GET("todo/:id", func(c *gin.Context) {

		})
		//修改
		V1Group.PUT("todo/:id", func(c *gin.Context) {

		})
		//删除
		V1Group.DELETE("todo/id", func(c *gin.Context) {

		})
	}
}
