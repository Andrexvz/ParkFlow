# 🚗 ParkFlow - Conexión con XAMPP (PHP + MySQL)

Este documento detalla la integración de **ParkFlow** con **XAMPP**, utilizando **PHP** como lenguaje de backend y **MySQL** como motor de base de datos relacional.

---

## 📊 Estado Actual de la Integración

✅ **Base de Datos MySQL Creada y Poblada:**
- **Nombre:** `parkflow_db`
- **Host:** `127.0.0.1` (Puerto `3306`)
- **Usuario:** `root` (Sin contraseña por defecto en XAMPP)
- **Tablas Creadas:**
  - `users`: Operadores y Administradores (3 registros iniciales)
  - `parking_spaces`: 41 celdas distribuidas en Zona A, Zona B, Zona C y Zona D
  - `rates`: Tarifas para Automóvil, Motocicleta, Camioneta y Bicicleta
  - `movements`: Tickets activos e historial de cobros del día

✅ **Backend REST API en PHP:**
- **Ubicación en el proyecto:** `ParkFlow/backend/`
- **Ubicación desplegada en XAMPP:** `C:\xampp\htdocs\parkflow-api\`
- **URL Base:** `http://localhost/parkflow-api/api/`

---

## 🛠️ Endpoints Disponibles en PHP

| Endpoint | Método | Descripción |
| :--- | :---: | :--- |
| `api/health.php` | `GET` | Verifica el estado del servidor Apache y la conexión a MySQL |
| `api/setup.php` | `GET/POST`| Inicializa y siembra la base de datos MySQL con 1 clic |
| `api/spaces.php` | `GET, POST, PUT, DELETE` | Gestión completa de celdas de parqueadero |
| `api/movements.php` | `GET, POST, PUT` | Registro de entradas (tickets), salidas, cobros y cancelaciones |
| `api/rates.php` | `GET, PUT` | Consulta y actualización de tarifas por vehículo |
| `api/users.php` | `GET, POST, PUT` | Gestión de operadores y administradores |
| `api/stats.php` | `GET` | Métricas en tiempo real (ingresos, ocupación, tiempos promedio) |

---

## 🚀 Cómo Usar y Gestionar

### 1. Iniciar XAMPP
Asegúrate de que en el **XAMPP Control Panel** estén en verde:
- **Apache** (Puerto 80)
- **MySQL** (Puerto 3306)

### 2. Ver la Base de Datos en phpMyAdmin
Abre tu navegador web y entra a:
👉 [http://localhost/phpmyadmin](http://localhost/phpmyadmin)
Selecciona la base de datos **`parkflow_db`** en el menú de la izquierda para ver todas las tablas y registros en tiempo real.

### 3. Scripts de Utilidad Incluidos en ParkFlow
- **`setup-database.bat`**: Ejecuta e importa nuevamente el script `database/parkflow.sql` a MySQL.
- **`deploy-to-xampp.bat`**: Copia cualquier cambio realizado en la carpeta `backend/` hacia `C:\xampp\htdocs\parkflow-api\`.

### 4. Indicador de Conexión en ParkFlow
En la barra superior de ParkFlow encontrarás la etiqueta **`MySQL Conectado`**. Al hacer clic sobre ella se abrirá un panel que te permitirá:
- Ver el estado de Apache y MySQL en tiempo real.
- Ver la cantidad de registros guardados en cada tabla.
- Probar la conexión o restaurar la base de datos con un clic.
