package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-contrib/cors"
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
	filePath := "db/test.db"
	dir := filepath.Dir(filePath)
	if err := os.MkdirAll(dir, os.ModePerm); err != nil {
		log.Fatal("创建目录失败", err)
	}
	db, err := gorm.Open(sqlite.Open(filePath), &gorm.Config{})
	if err != nil {
		log.Fatal("连接失败:", err)
	}
	err = db.AutoMigrate(&Todo{})
	if err != nil {
		log.Fatal("自动迁移失败", err)
	}
	fmt.Println("连接数据库成功")
	r := gin.Default()
	r.Use(cors.Default())
	r.LoadHTMLGlob("templates/*")
	r.Static("/static", "./static")
	r.GET("/index", func(ctx *gin.Context) {
		ctx.HTML(http.StatusOK, "index.html", nil)
	})
	V1Group := r.Group("/v1")
	V1Group.Use(cors.Default())
	{
		//添加
		V1Group.POST("/todo", func(c *gin.Context) {
			//前端填写，发送请求到这儿；步骤1.拿数据，
			var todo Todo
			c.BindJSON(&todo)
			//2.存入数据库 3.返回响应
			if err = db.Create(&todo).Error; err != nil {
				c.JSON(http.StatusOK, gin.H{"error": err})
			} else {
				c.JSON(http.StatusOK, todo)
			}
		})
		//查看所有
		V1Group.GET("/todo", func(c *gin.Context) {
			var todoList []Todo
			if err = db.Find(&todoList).Error; err != nil {
				c.JSON(http.StatusOK, gin.H{"error": err})
			} else {
				c.JSON(http.StatusOK, todoList)
			}
		})
		//查看某个
		V1Group.GET("/todo/:id", func(c *gin.Context) {

		})
		//修改
		V1Group.PUT("/todo/:id", func(c *gin.Context) {
			id := c.Param("id")
			var todo Todo
			if err = db.Where("id=?", id).First(&todo).Error; err != nil {
				c.JSON(http.StatusOK, gin.H{"error": err})
				return
			}
			c.BindJSON(&todo)
			if err = db.Save(&todo).Error; err != nil {
				c.JSON(http.StatusOK, gin.H{"error": err})
				return
			} else {
				c.JSON(http.StatusOK, todo)
			}
		})
		//删除
		V1Group.DELETE("/todo/:id", func(c *gin.Context) {
			id := c.Param("id")
			if err = db.Where("id=?", id).Delete(&Todo{}).Error; err != nil {
				c.JSON(http.StatusOK, gin.H{"error": err})
				return
			} else {
				c.JSON(http.StatusOK, gin.H{"status": "deleted"})
			}
		})
		// 一键删除：删除全部
		V1Group.DELETE("/todos", func(c *gin.Context) {
			if err = db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&Todo{}).Error; err != nil {
				c.JSON(http.StatusOK, gin.H{"error": err})
				return
			}
			c.JSON(http.StatusOK, gin.H{"status": "deleted_all"})
		})
	}
	r.Run(":8081")

}
