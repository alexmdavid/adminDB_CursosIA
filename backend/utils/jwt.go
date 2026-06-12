package utils

import (
	"fmt"
	"strconv"
	"time"

	"admin-backend/config"

	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	AdminID  uint   `json:"admin_id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

// GenerateToken crea un JWT firmado para el admin
func GenerateToken(adminID uint, username string) (string, error) {
	expiryHours, _ := strconv.Atoi(config.AppConfig.JWTExpiryHours)
	if expiryHours <= 0 {
		expiryHours = 24
	}

	claims := Claims{
		AdminID:  adminID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(expiryHours) * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "playdiom-admin",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.AppConfig.JWTSecret))
}

// ValidateToken valida y decodifica un JWT
func ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("método de firma inesperado: %v", token.Header["alg"])
		}
		return []byte(config.AppConfig.JWTSecret), nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("token inválido")
	}

	return claims, nil
}
