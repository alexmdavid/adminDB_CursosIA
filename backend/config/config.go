package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost         string
	DBPort         string
	DBUser         string
	DBPassword     string
	DBName         string
	DBSSLMode      string
	JWTSecret      string
	JWTExpiryHours string
	SeedAdminUser  string
	SeedAdminPass  string
	SeedAdminEmail string
	ServerPort     string
}

var AppConfig Config

func Load() {
	_ = godotenv.Load("backend/.env")
	_ = godotenv.Load(".env")

	AppConfig = Config{
		DBHost:         getEnv("DB_HOST", "localhost"),
		DBPort:         getEnv("DB_PORT", "5432"),
		DBUser:         getEnv("DB_USER", "postgres"),
		DBPassword:     getEnv("DB_PASSWORD", ""),
		DBName:         getEnv("DB_NAME", "neondb"),
		DBSSLMode:      getEnv("DB_SSLMODE", "require"),
		JWTSecret:      getEnv("JWT_SECRET", "fallback-secret-change-me"),
		JWTExpiryHours: getEnv("JWT_EXPIRY_HOURS", "24"),
		SeedAdminUser:  getEnv("SEED_ADMIN_USER", "admin"),
		SeedAdminPass:  getEnv("SEED_ADMIN_PASS", "admin123"),
		SeedAdminEmail: getEnv("SEED_ADMIN_EMAIL", "admin@playdiom.com"),
		ServerPort:     getEnv("SERVER_PORT", "8080"),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
