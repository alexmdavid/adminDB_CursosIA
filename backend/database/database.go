package database

import (
	"fmt"
	"log"

	"admin-backend/config"
	"admin-backend/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect() {
	cfg := config.AppConfig

	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBSSLMode,
	)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("Error conectando a la base de datos: %v", err)
	}

	// Auto-migrar el modelo Admin (crea la tabla si no existe)
	err = DB.AutoMigrate(&models.Admin{})
	if err != nil {
		log.Fatalf("Error migrando la base de datos: %v", err)
	}

	log.Println("✅ Conexión a PostgreSQL exitosa y modelo Admin migrado.")
}

func GetDB() *gorm.DB {
	return DB
}
