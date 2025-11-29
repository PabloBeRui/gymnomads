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
