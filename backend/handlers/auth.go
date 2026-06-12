package handlers

import (
	"net/http"
	"time"

	"admin-backend/database"
	"admin-backend/models"
	"admin-backend/utils"

	"github.com/gin-gonic/gin"
)

// LoginRequest estructura de la petición de login
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// LoginResponse estructura de la respuesta de login
type LoginResponse struct {
	Token    string `json:"token"`
	Username string `json:"username"`
	Message  string `json:"message"`
}

// ErrorResponse estructura de error
type ErrorResponse struct {
	Error string `json:"error"`
}

// Login autentica al admin y retorna un JWT
func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Usuario y contraseña son requeridos"})
		return
	}

	// Buscar admin por username
	var admin models.Admin
	if err := database.GetDB().Where("username = ? AND is_active = ?", req.Username, true).First(&admin).Error; err != nil {
		// Respuesta genérica para no revelar si el usuario existe
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Credenciales incorrectas"})
		return
	}

	// Verificar contraseña con bcrypt
	if !admin.CheckPassword(req.Password) {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Credenciales incorrectas"})
		return
	}

	// Actualizar último login
	now := time.Now()
	database.GetDB().Model(&admin).Update("last_login", &now)

	// Generar JWT
	token, err := utils.GenerateToken(admin.ID, admin.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Error generando token de sesión"})
		return
	}

	c.JSON(http.StatusOK, LoginResponse{
		Token:    token,
		Username: admin.Username,
		Message:  "Autenticación exitosa",
	})
}

// VerifyToken verifica si un token JWT es válido
func VerifyToken(c *gin.Context) {
	tokenString := c.GetHeader("Authorization")
	if tokenString == "" {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Token no proporcionado"})
		return
	}

	// Remover prefijo "Bearer " si existe
	if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
		tokenString = tokenString[7:]
	}

	claims, err := utils.ValidateToken(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Token inválido o expirado"})
		return
	}

	// Verificar que el admin sigue activo
	var admin models.Admin
	if err := database.GetDB().First(&admin, claims.AdminID).Error; err != nil || !admin.IsActive {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Sesión inválida"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"valid":    true,
		"username": claims.Username,
		"admin_id": claims.AdminID,
	})
}

// ChangePassword cambia la contraseña del admin autenticado
func ChangePassword(c *gin.Context) {
	tokenString := c.GetHeader("Authorization")
	if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
		tokenString = tokenString[7:]
	}

	claims, err := utils.ValidateToken(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "Sesión inválida"})
		return
	}

	var req struct {
		CurrentPassword string `json:"current_password" binding:"required"`
		NewPassword     string `json:"new_password" binding:"required,min=8"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "Contraseña actual y nueva contraseña (mín. 8 caracteres) son requeridas"})
		return
	}

	var admin models.Admin
	if err := database.GetDB().First(&admin, claims.AdminID).Error; err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{Error: "Admin no encontrado"})
		return
	}

	if !admin.CheckPassword(req.CurrentPassword) {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "La contraseña actual es incorrecta"})
		return
	}

	hashedPass, err := models.HashPassword(req.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: "Error procesando la nueva contraseña"})
		return
	}

	database.GetDB().Model(&admin).Update("password", hashedPass)

	c.JSON(http.StatusOK, gin.H{"message": "Contraseña actualizada correctamente"})
}
