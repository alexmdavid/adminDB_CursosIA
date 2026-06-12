package models

import (
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// Admin es el modelo mapeado a la tabla "admins" en PostgreSQL
type Admin struct {
	ID        uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	Username  string         `gorm:"type:varchar(100);uniqueIndex;not null" json:"username"`
	Email     string         `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	Password  string         `gorm:"type:varchar(255);not null" json:"-"`
	IsActive  bool           `gorm:"default:true;not null" json:"is_active"`
	LastLogin *time.Time     `json:"last_login,omitempty"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// HashPassword hashea una contraseña usando bcrypt con costo 12
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	return string(bytes), err
}

// CheckPassword verifica una contraseña contra su hash
func (a *Admin) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(a.Password), []byte(password))
	return err == nil
}

// TableName sobrescribe el nombre de la tabla
func (Admin) TableName() string {
	return "admins"
}
