# 🚀 GymNomads - Backend

Este es el servidor backend para el proyecto **GymNomads**, desarrollado con **Node.js** y **Express**. Se encarga de gestionar la lógica de negocio, la autenticación de usuarios, la conexión con la base de datos MySQL y el servicio de archivos estáticos (imágenes).

---

## 🛠️ Tecnologías Utilizadas

*   **Entorno:** Node.js
*   **Framework:** Express.js
*   **Base de Datos:** MySQL (con `mysql2`)
*   **Autenticación:** JWT (JSON Web Tokens) y Bcrypt (hashing de contraseñas)
*   **Gestión de Archivos:** Multer (subida de imágenes)
*   **Variables de Entorno:** Dotenv
*   **Testing:** Jest, Supertest

---

## 📋 Requisitos Previos

1.  Tener instalado **Node.js** (v16 o superior).
2.  Tener una instancia de **MySQL** corriendo con la base de datos configurada (ver `bbdd/README.md`).

---

## ⚙️ Configuración e Instalación

1.  **Instalar dependencias:**
    Sitúate en la carpeta `backend` y ejecuta:
    ```bash
    npm install
    ```

2.  **Configurar Variables de Entorno:**
    Copia el archivo de ejemplo `.env.example` a un nuevo archivo llamado `.env`:
    ```bash
    cp .env.example .env
    ```
    Edita el archivo `.env` con tus credenciales locales:
    ```env
    DB_HOST=localhost
    DB_PORT=3306
    DB_USER=root
    DB_PASSWORD=tu_contraseña
    DB_NAME=gymnomads
    JWT_SECRET=tu_secreto_super_seguro
    BASE_URL=http://localhost:3000
    ```

3.  **Carpeta de Cargas (Uploads):**
    Asegúrate de que existe la carpeta `uploads` en la raíz del backend con sus subcarpetas (`gym_images`, `gym_logos`, `profile_pictures`) y que contiene las imágenes referenciadas en la base de datos.

---

## ▶️ Ejecución

Para iniciar el servidor en modo desarrollo (con recarga automática):

```bash
npm run dev
```

El servidor se iniciará por defecto en `http://localhost:3000`.

---

## 📂 Estructura del Proyecto

*   `src/controllers`: Lógica de control de las peticiones.
*   `src/routes`: Definición de endpoints de la API.
*   `src/middleware`: Middlewares de autenticación y subida de archivos.
*   `src/config`: Configuración de la base de datos.
*   `uploads/`: Almacenamiento local de imágenes.
*   `tests/`: Tests de integración y utilidades para el entorno de pruebas.

---

## 🧪 Testing (Pruebas Automatizadas)

El proyecto incluye una robusta suite de tests de integración para asegurar la funcionalidad y estabilidad del backend. Se utiliza **Jest** como framework de pruebas y **Supertest** para simular peticiones HTTP a la API.

Para garantizar la seguridad y evitar la corrupción de la base de datos de desarrollo/producción, los tests se ejecutan contra una **base de datos de test completamente aislada (`gymnomads_test`)**.

### ⚙️ Configuración del Entorno de Test

1.  **Crear Base de Datos de Test:**
    Antes de ejecutar los tests por primera vez, debes crear la base de datos `gymnomads_test` en tu servidor MySQL. Utiliza el siguiente comando:
    ```bash
    npm run db:test:create
    ```
    Este comando ejecuta el script `bbdd/create_test_db.sql`, que borra y recrea la BBDD `gymnomads_test` con la misma estructura que la principal.

2.  **Variables de Entorno:**
    Asegúrate de que tu archivo `.env` en la raíz del backend contenga las credenciales correctas para acceder a tu servidor MySQL. Los tests usarán estas credenciales para conectarse a `gymnomads_test`.

### ▶️ Ejecución de Tests

*   **Ejecutar todos los tests:**
    ```bash
    npm test
    ```
    Este comando ejecuta todos los tests (`.test.js`) de forma secuencial (`--runInBand`) para evitar conflictos de base de datos y genera un informe de cobertura de código.

*   **Ejecutar tests en modo vigilancia (watch mode):**
    ```bash
    npm run test:watch
    ```
    Ideal para el desarrollo. Ejecuta los tests y los vuelve a correr automáticamente cada vez que detecta cambios en el código.

*   **Generar solo informe de cobertura:**
    ```bash
    npm run test:coverage
    ```
    Útil si solo quieres ver la cobertura sin ejecutar todos los tests cada vez.

### 📊 Cobertura de Código

Después de ejecutar `npm test`, verás un informe detallado de la cobertura de código. Esto indica qué porcentaje de tu código está siendo ejecutado por las pruebas. Un mayor porcentaje implica mayor seguridad y menos errores potenciales.

---
---

# 🚀 GymNomads - Backend

This is the backend server for the **GymNomads** project, developed with **Node.js** and **Express**. It handles business logic, user authentication, MySQL database connection, and static file serving (images).

---

## 🛠️ Technologies Used

*   **Environment:** Node.js
*   **Framework:** Express.js
*   **Database:** MySQL (using `mysql2`)
*   **Authentication:** JWT (JSON Web Tokens) and Bcrypt (password hashing)
*   **File Management:** Multer (image uploads)
*   **Environment Variables:** Dotenv
*   **Testing:** Jest, Supertest

---

## 📋 Prerequisites

1.  **Node.js** installed (v16 or higher).
2.  A running **MySQL** instance with the database configured (see `bbdd/README.md`).

---

## ⚙️ Configuration & Installation

1.  **Install dependencies:**
    Navigate to the `backend` folder and run:
    ```bash
    npm install
    ```

2.  **Configure Environment Variables:**
    Copy the example file `.env.example` to a new file named `.env`:
    ```bash
    cp .env.example .env
    ```
    Edit the `.env` file with your local credentials:
    ```env
    DB_HOST=localhost
    DB_PORT=3306
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=gymnomads
    JWT_SECRET=your_super_secure_secret
    BASE_URL=http://localhost:3000
    ```

3.  **Uploads Folder:**
    Ensure the `uploads` folder exists in the backend root with its subfolders (`gym_images`, `gym_logos`, `profile_pictures`) and contains the images referenced in the database.

---

## ▶️ Execution

To start the server in development mode (with auto-reload):

```bash
npm run dev
```

The server will start by default at `http://localhost:3000`.

---

## 📂 Project Structure

*   `src/controllers`: Request control logic.
*   `src/routes`: API endpoint definitions.
*   `src/middleware`: Authentication and file upload middlewares.
*   `src/config`: Database configuration.
*   `uploads/`: Local image storage.
*   `tests/`: Integration tests and utilities for the testing environment.

---

## 🧪 Testing (Automated Tests)

The project includes a robust suite of integration tests to ensure the functionality and stability of the backend. **Jest** is used as the testing framework and **Supertest** to simulate HTTP requests to the API.

To guarantee security and prevent corruption of the development/production database, tests are executed against a **completely isolated test database (`gymnomads_test`)**.

### ⚙️ Test Environment Setup

1.  **Create Test Database:**
    Before running tests for the first time, you must create the `gymnomads_test` database on your MySQL server. Use the following command:
    ```bash
    npm run db:test:create
    ```
    This command executes the `bbdd/create_test_db.sql` script, which drops and recreates the `gymnomads_test` DB with the same structure as the main one.

2.  **Environment Variables:**
    Ensure your `.env` file in the backend root contains the correct credentials to access your MySQL server. Tests will use these credentials to connect to `gymnomads_test`.

### ▶️ Running Tests

*   **Run all tests:**
    ```bash
    npm test
    ```
    This command runs all (`.test.js`) tests sequentially (`--runInBand`) to prevent database conflicts and generates a code coverage report.

*   **Run tests in watch mode:**
    ```bash
    npm run test:watch
    ```
    Ideal for development. Executes tests and automatically re-runs them whenever code changes are detected.

*   **Generate coverage report only:**
    ```bash
    npm run test:coverage
    ```
    Useful if you only want to view coverage without running all tests every time.

### 📊 Code Coverage

After running `npm test`, you will see a detailed code coverage report. This indicates what percentage of your code is being executed by the tests. A higher percentage implies greater security and fewer potential errors.
---
---

# 🚀 GymNomads - Backend

This is the backend server for the **GymNomads** project, developed with **Node.js** and **Express**. It handles business logic, user authentication, MySQL database connection, and static file serving (images).

---

## 🛠️ Technologies Used

*   **Environment:** Node.js
*   **Framework:** Express.js
*   **Database:** MySQL (using `mysql2`)
*   **Authentication:** JWT (JSON Web Tokens) and Bcrypt (password hashing)
*   **File Management:** Multer (image uploads)
*   **Testing:** Jest, Supertest

---

## 📋 Prerequisites

1.  **Node.js** installed (v16 or higher).
2.  A running **MySQL** instance with the database configured (see `bbdd/README.md`).

---

## ⚙️ Configuration & Installation

1.  **Install dependencies:**
    Navigate to the `backend` folder and run:
    ```bash
    npm install
    ```

2.  **Configure Environment Variables:**
    Copy the example file `.env.example` to a new file named `.env`:
    ```bash
    cp .env.example .env
    ```
    Edit the `.env` file with your local credentials:
    ```env
    DB_HOST=localhost
    DB_PORT=3306
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=gymnomads
    JWT_SECRET=your_super_secure_secret
    BASE_URL=http://localhost:3000
    ```

3.  **Uploads Folder:**
    Ensure the `uploads` folder exists in the backend root with its subfolders (`gym_images`, `gym_logos`, `profile_pictures`) and contains the images referenced in the database.

---

## ▶️ Execution

To start the server in development mode (with auto-reload):

```bash
npm run dev
```

The server will start by default at `http://localhost:3000`.

---

## 📂 Project Structure

*   `src/controllers`: Request control logic.
*   `src/routes`: API endpoint definitions.
*   `src/middleware`: Authentication and file upload middlewares.
*   `src/config`: Database configuration.
*   `uploads/`: Local image storage.
