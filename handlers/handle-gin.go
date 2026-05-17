package handlers

import (
	"tod/models"

	"github.com/gin-gonic/gin"
)

func GetTodo(c *gin.Context) {
	c.JSON(200, gin.H{
		"status": "ok",
		"data":   "todos",
	})
}
func CreateTodo(c *gin.Context) {
	var newTodo models.Todo
	if err := c.ShouldBindJSON(&newTodo); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, newTodo)
}
