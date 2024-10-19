# Auth-API-Service

Microservicio para la autorización y gestión de accesos de otros microservicios de la API.

## Concepto

El objetivo de este servicio es que a través de una base de datos, permita relacionar usuarios con otros microservicios de la API, de forma que según el usuario y sus permisos, podrá autenticarse obteniendo un token JWT el cuál puede ser configurado para tener un tiempo de expiración desde que se realiza la autenticación, cada microservicio que requiera autenticación, deberá poseer la firma del token JWT y los medios para validar el token, de forma que solo permitirá el acceso si el token compartido es válido, coincide con el ID del microservicio y no ha expirado.

## Requisitos

- Tener los medios para ejecutar código de JS en backend.
- Motor de base de datos MySQL.
- La base de datos especificada en las variables de entorno, debe estar creada.

## Despliegue

Para compilar el proyecto, ejecutar el comando ``` npm run build ```, se creará un directorio llamado  ``` dist/ ``` el cual contendrá toda la implementación (excepto el archivo de variables de entorno, el cuál deberá se agregado manualmente).

## Headers

Todos los endpoints exceptuando el correspondiente a autenticación, requieren autorización por cabeceras y corresponderá al token definido en las variables de entorno de la siguiente forma:

```http
Authorization: Bearer <AUTH_SECRET_TOKEN>
```

## Endpoints

Este servicio cuenta con 5 características, gestión de usuarios, gestión de microservicios, gestión de permisos, autenticación y migración para generar todas las tablas que requiere el mismo.

### Migrar las tablas

Para crear las tablas requeridas por la implementación, realizar la siguiente petición:

```http
POST /migrate
```

### Autenticación

Para autenticarse en un servicio, se realizará la siguiente petición

```json
POST /

{
    "username": "username or email",
    "pwd": "user_password",
    "api_id" : "API_ID"
}
```

Esta petición retornará un token de JWT el cuál estará fimardo por la variable ```JWT_SECRET_KEY``` y cada API que pudeda ser autenticada con este servicio deberá verificar el token utilizando la misma clave.

### Gestión de usuarios.

Este módulo permite listar, crear, editar y eliminar los usuarios que pueden autenticarse a los servicios que cuenten con este sistema de autenticación, a continuación se listarán los endpoints disponibles:

Obtener todos los usuarios registrados en el servicio:
```http
GET /users
```
Registrar un usuario en el servicio para poder autenticarse:

```json
POST /users

{
    "full_name" : "Full Name",
    "username" : "username",
    "email" : "example@domain.com",
    "pwd" : "YOUR_PASSWORD"
}
```

Actualizar un usuario existente en el servicio, puede ser actualizado cualquier valor y no se requiere de la representación completa del objeto:

```json
PATCH /users/<ID>

{
    "full_name" : "New Name",
    "pwd" : "NEW_PASSWORD"
}
```

Eliminar un usuario del servicio, esto removerá todas las autorizaciones que tenía disponibles:

```http
DELETE /users/<ID>
```

### Gestión de APIs

En este módulo se podrán listar, registrar, editar o eliminar las APIs o Servicios que utilizarán este método de autenticación, a continuación, se listarán los endpoints correspondientes:

Para listar las APIs registradas:

```http
GET /apis
```

Registrar una API:

```json
POST /apis

{
    "api_name" : "Your api name",
    "api_id" : "YOUR_API_ID"
}
```

Editar una API registrada, no se requiere de la representación completa del objeto:

```json
PATCH /apis/<ID>

{
    "api_name" : "Your new api name",
    "api_id" : "YOUR_NEW_API_ID"
}
```

Eliminar una API registrada, se revocará de todos los usuarios:

```http
DELETE /apis/<ID>
```

### Autorización de usuarios a APIs

En esté módulo se podrán, listar, authorizar o revocar los permisos de los usuarios a las APIs o servicios disponibles, a continuación, se listarán los endpoints:

Para listar los permisos asignados:

```http
GET /authorize
```

Para autorizar un usuario a una API

```json
POST /authorize

{
    "username" : "Username or Email",
    "api_id" : "YOUR_API_ID"
}
```

Para revocar un usuario de una API:

```json
DELETE /authorize

{
    "username" : "Username or Email",
    "api_id" : "YOUR_API_ID"
}
```