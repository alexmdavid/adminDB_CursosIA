package main

import (
	"log"

	"admin-backend/config"
	"admin-backend/database"
	"admin-backend/handlers"
	"admin-backend/middleware"
	"admin-backend/models"

	"github.com/gin-gonic/gin"
)

func main() {
	// Cargar configuración
	config.Load()

	// Conectar a la base de datos y migrar
	database.Connect()

	// Seed del admin inicial
	seedAdmin()

	// Configurar Gin
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	// CORS
	r.Use(middleware.CORSMiddleware())

	// Rutas públicas
	r.POST("/api/auth/login", handlers.Login)
	r.GET("/api/auth/verify", handlers.VerifyToken)

	// Rutas protegidas (requieren JWT)
	protected := r.Group("/api/auth")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.POST("/change-password", handlers.ChangePassword)
	}

	// Ruta de health check
	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "admin-backend"})
	})

	// Iniciar servidor
	port := config.AppConfig.ServerPort
	log.Printf("🚀 Servidor backend iniciado en el puerto %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Error iniciando el servidor: %v", err)
	}
}

// seedAdmin crea el admin inicial si no existe
func seedAdmin() {
	cfg := config.AppConfig

	var count int64
	database.GetDB().Model(&models.Admin{}).Count(&count)

	if count > 0 {
		log.Println("ℹ️  Ya existe un admin en la base de datos. Seed omitido.")
		return
	}

	hashedPass, err := models.HashPassword(cfg.SeedAdminPass)
	if err != nil {
		log.Fatalf("Error hasheando la contraseña del admin: %v", err)
	}

	admin := models.Admin{
		Username: cfg.SeedAdminUser,
		Email:    cfg.SeedAdminEmail,
		Password: hashedPass,
		IsActive: true,
	}

	if err := database.GetDB().Create(&admin).Error; err != nil {
		log.Fatalf("Error creando el admin inicial: %v", err)
	}

	log.Printf("✅ Admin inicial creado: %s (email: %s)", admin.Username, admin.Email)
}
