package router

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func Router() *gin.Engine {
	r := gin.Default()
	r.Static("/static", "./static")
	r.LoadHTMLFiles("templates/index.html")
	r.GET("/index", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", nil)
	})
	fmt.Println("地址：http://localhost:8080/index")
	return r
}
