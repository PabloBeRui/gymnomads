# 💻 GymNomads - Frontend

Este es el cliente frontend para el proyecto **GymNomads**, una Single Page Application (SPA) moderna y responsiva construida con **React**, **TypeScript** y **Vite**.

---

## 🛠️ Tecnologías Utilizadas

*   **Core:** React 18+, TypeScript, Vite
*   **Estilos:** SCSS (Módulos), Bootstrap 5, React-Bootstrap
*   **Animaciones:** Framer Motion
*   **Mapas:** Leaflet, React-Leaflet
*   **Códigos QR:** QR Code Styling (Generación y estilo de QRs para visitas)
*   **Notificaciones:** Sonner (Toasts)
*   **HTTP:** Axios
*   **Iconos:** React Icons (Bootstrap Icons, FontAwesome, etc.)
*   **Formularios y Email:** EmailJS
*   **Testing:** Vitest, React Testing Library

---

## 📋 Requisitos Previos

1.  Tener **Node.js** instalado.
2.  Tener la **Base de Datos MySQL** corriendo y con los datos cargados (ver carpeta `bbdd`).
3.  Tener el **Backend** ejecutándose y conectado a la base de datos (normalmente en el puerto 3000).

---

## ⚙️ Configuración e Instalación

1.  **Instalar dependencias:**
    Sitúate en la carpeta `frontend` y ejecuta:
    ```bash
    npm install
    ```

2.  **Configurar Variables de Entorno:**
    Copia el archivo `.env.example` a un nuevo archivo llamado `.env`:
    ```bash
    cp .env.example .env
    ```
    Edita el archivo `.env` para apuntar a tu backend:
    ```env
    # URL base para llamadas a la API
    VITE_API_BASE_URL=http://localhost:3000/api
    
    # URL base para cargar imágenes estáticas
    VITE_BACKEND_BASE_URL=http://localhost:3000

    # Configuración de EmailJS (opcional para desarrollo local si no usas emails)
    VITE_EMAILJS_SERVICE_ID="tu_service_id"
    VITE_EMAILJS_TEMPLATE_ID="tu_template_id"
    VITE_EMAILJS_PUBLIC_KEY="tu_public_key"
    ```

---

## ▶️ Ejecución

Para iniciar la aplicación en modo desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## 🧪 Tests

El proyecto cuenta con una suite de pruebas unitarias y de integración implementada con **Vitest** y **React Testing Library**.

Las pruebas cubren:
*   **Componentes:** Renderizado correcto e interacción básica.
*   **Hooks:** Lógica personalizada (ej. gestión de paginación, filtros).
*   **Páginas:** Integración de componentes en vistas principales.
*   **Utilidades:** Funciones auxiliares.

Para ejecutar los tests:

```bash
npm test
```

---

## 🌟 Funcionalidades Clave

*   **Mapa Interactivo:** Visualización de gimnasios en el mapa usando Leaflet.
*   **Gestión de Usuarios:** Registro, Login, Perfil y edición de datos.
*   **Roles:** Vistas diferenciadas para Usuarios, Managers y Administradores.
*   **Sistema de Visitas:** Generación de códigos QR personalizados para el acceso a los gimnasios.
*   **Gestión de Gimnasios:** ABM (Alta, Baja, Modificación) de gimnasios para administradores.

---
---

# 💻 GymNomads - Frontend

This is the frontend client for the **GymNomads** project, a modern and responsive Single Page Application (SPA) built with **React**, **TypeScript**, and **Vite**.

---

## 🛠️ Technologies Used

*   **Core:** React 18+, TypeScript, Vite
*   **Styles:** SCSS (Modules), Bootstrap 5, React-Bootstrap
*   **Animations:** Framer Motion
*   **Maps:** Leaflet, React-Leaflet
*   **QR Codes:** QR Code Styling (QR generation and styling for visits)
*   **Notifications:** Sonner (Toasts)
*   **HTTP:** Axios
*   **Icons:** React Icons (Bootstrap Icons, FontAwesome, etc.)
*   **Forms & Email:** EmailJS
*   **Testing:** Vitest, React Testing Library

---

## 📋 Prerequisites

1.  **Node.js** installed.
2.  **MySQL Database** running and populated with data (see `bbdd` folder).
3.  **Backend** running and connected to the database (usually on port 3000).

---

## ⚙️ Configuration & Installation

1.  **Install dependencies:**
    Navigate to the `frontend` folder and run:
    ```bash
    npm install
    ```

2.  **Configure Environment Variables:**
    Copy the `.env.example` file to a new file named `.env`:
    ```bash
    cp .env.example .env
    ```
    Edit the `.env` file to point to your backend:
    ```env
    # Base URL for API calls
    VITE_API_BASE_URL=http://localhost:3000/api
    
    # Base URL for loading static images
    VITE_BACKEND_BASE_URL=http://localhost:3000

    # EmailJS Configuration (optional for local dev if not using emails)
    VITE_EMAILJS_SERVICE_ID="your_service_id"
    VITE_EMAILJS_TEMPLATE_ID="your_template_id"
    VITE_EMAILJS_PUBLIC_KEY="your_public_key"
    ```

---

## ▶️ Execution

To start the application in development mode:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 🧪 Tests

The project features a unit and integration test suite implemented with **Vitest** and **React Testing Library**.

The tests cover:
*   **Components:** Correct rendering and basic interaction.
*   **Hooks:** Custom logic (e.g., pagination management, filters).
*   **Pages:** Component integration in main views.
*   **Utils:** Helper functions.

To run the tests:

```bash
npm test
```

---

## 🌟 Key Features

*   **Interactive Map:** Visualization of gyms on the map using Leaflet.
*   **User Management:** Registration, Login, Profile, and data editing.
*   **Roles:** Differentiated views for Users, Managers, and Administrators.
*   **Visit System:** Customized QR code generation for gym access.
*   **Gym Management:** CRUD (Create, Read, Update, Delete) of gyms for administrators.