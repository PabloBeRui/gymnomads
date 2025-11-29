# 📂 Base de Datos GymNomads

Este directorio contiene todos los archivos SQL necesarios para configurar, estructurar y poblar la base de datos de **GymNomads**.

A continuación se detalla el contenido, el orden de ejecución estricto para evitar errores y dónde alojar los archivos multimedia.

---

## 📄 Descripción de Archivos

| Archivo | Descripción |
| :--- | :--- |
| **`gymnomads_schema.sql`** | **Estructura Base.** Contiene la definición de la base de datos (`CREATE DATABASE`), las tablas (`gyms`, `users`, `visits`) y sus relaciones (Foreign Keys). También gestiona el borrado lógico (`is_deleted`). |
| **`gymnomads_data.sql`** | **Datos Esenciales.** Inserta los datos mínimos requeridos para que la aplicación funcione: el **Usuario Admin** principal y el **Gimnasio Admin** (placeholder del sistema). |
| **`seed_development_data.sql`** | **Datos de Prueba (Seed).** Puebla la base de datos con gimnasios ficticios, managers, usuarios estándar e historiales de visitas para pruebas en entorno de desarrollo. |
| **`reset_database.sql`** | **Utilidad.** Script opcional para borrar y reiniciar la base de datos rápidamente (útil durante el desarrollo intensivo). |
| **`users_info.txt`** | Archivo de texto con información auxiliar sobre los usuarios (credenciales de prueba, roles, etc.). |

---

## ⚙️ Orden de Instalación

Para configurar la base de datos correctamente, ejecuta los scripts en el siguiente orden exacto. Puedes usar una herramienta como Workbench, DBeaver o la línea de comandos de MySQL.

1.  **`gymnomads_schema.sql`**
    *   *Acción:* Crea la BBDD y las tablas vacías.
    *   *Comando:* `source bbdd/gymnomads_schema.sql`

2.  **`gymnomads_data.sql`**
    *   *Acción:* Crea el administrador del sistema. **Crucial para poder hacer login.**
    *   *Comando:* `source bbdd/gymnomads_data.sql`

3.  **`seed_development_data.sql`** (Opcional pero recomendado en DEV)
    *   *Acción:* Rellena la aplicación con datos de muestra (gimnasios en varias ciudades, usuarios con visitas, etc.).
    *   *Comando:* `source bbdd/seed_development_data.sql`

---

## 🖼️ Imágenes y Archivos Multimedia

El script de "seed" (`seed_development_data.sql`) hace referencia a imágenes ubicadas en la carpeta `backend/uploads`.

Para que las imágenes de perfil y logos de gimnasios se vean correctamente en la aplicación, debes asegurarte de que la carpeta `uploads` dentro del **backend** tenga la siguiente estructura y contenga los archivos correspondientes (logos de gimnasios, fotos de perfil, etc.):

```text
gymnomads/
└── backend/
    └── uploads/
        ├── gym_images/       # Fotos principales de los gimnasios
        ├── gym_logos/        # Logos de los gimnasios
        └── profile_pictures/ # Avatares de los usuarios
```

> **Nota:** Si has descargado el proyecto completo, estas carpetas ya deberían estar dentro del directorio `backend`. Si estás configurando el entorno desde cero, asegúrate de copiar las imágenes de prueba en estas rutas.

---
---

# 📂 GymNomads Database

This directory contains all the SQL files necessary to configure, structure, and populate the **GymNomads** database.

Below are the file details, the strict execution order to avoid errors, and where to host media files.

---

## 📄 File Description

| File | Description |
| :--- | :--- |
| **`gymnomads_schema.sql`** | **Core Structure.** Contains the database definition (`CREATE DATABASE`), tables (`gyms`, `users`, `visits`), and their relationships (Foreign Keys). It also handles logical deletion (`is_deleted`). |
| **`gymnomads_data.sql`** | **Essential Data.** Inserts the minimum data required for the app to function: the main **Admin User** and the **Admin Gym** (system placeholder). |
| **`seed_development_data.sql`** | **Test Data (Seed).** Populates the database with dummy gyms, managers, standard users, and visit histories for development testing. |
| **`reset_database.sql`** | **Utility.** Optional script to quickly wipe and reset the database (useful during intensive development). |
| **`users_info.txt`** | Text file with auxiliary information about users (test credentials, roles, etc.). |

---

## ⚙️ Installation Order

To configure the database correctly, run the scripts in the following exact order. You can use a tool like Workbench, DBeaver, or the MySQL command line.

1.  **`gymnomads_schema.sql`**
    *   *Action:* Creates the DB and empty tables.
    *   *Command:* `source bbdd/gymnomads_schema.sql`

2.  **`gymnomads_data.sql`**
    *   *Action:* Creates the system administrator. **Crucial for logging in.**
    *   *Command:* `source bbdd/gymnomads_data.sql`

3.  **`seed_development_data.sql`** (Optional but recommended in DEV)
    *   *Action:* Fills the app with sample data (gyms in various cities, users with visits, etc.).
    *   *Command:* `source bbdd/seed_development_data.sql`

---

## 🖼️ Images and Media Files

The seed script (`seed_development_data.sql`) references images located in the `backend/uploads` folder.

For profile pictures and gym logos to display correctly in the application, you must ensure that the `uploads` folder inside the **backend** has the following structure and contains the corresponding files (gym logos, profile photos, etc.):

```text
gymnomads/
└── backend/
    └── uploads/
        ├── gym_images/       # Main photos of the gyms
        ├── gym_logos/        # Gym logos
        └── profile_pictures/ # User avatars
```

> **Note:** If you have downloaded the full project, these folders should already be inside the `backend` directory. If you are setting up the environment from scratch, make sure to copy the test images into these paths.
