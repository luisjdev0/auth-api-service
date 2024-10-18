# Auth-API-Service

Microservicio para la autorización y gestión de accesos de otros microservicios de la API.

## Concepto

El objetivo de este servicio es que a través de una base de datos, permita relacionar usuarios con otros microservicios de la API, de forma que según el usuario y sus permisos, podrá autenticarse obteniendo un token JWT el cuál puede ser configurado para tener un tiempo de expiración desde que se realiza la autenticación, cada microservicio que requiera autenticación, deberá poseer la firma del token JWT y los medios para validar el token, de forma que solo permitirá el acceso si el token compartido es válido, coincide con el ID del microservicio y no ha expirado.

## Requisitos

- Tener los medios para ejecutar código de JS en backend.
- Motor de base de datos MySQL.
- La base de datos especificada en las variables de entorno, debe estar creada.

## Endpoints

Este servicio cuenta con 5 características, gestión de usuarios, gestión de microservicios, gestión de permisos, autenticación y migración para generar todas las tablas que requiere el mismo.

## Payload

Todos los endpoints exceptuando el correspondiente a autenticación, requieren autorización por cabeceras y corresponderá al token definido en las variables de entorno de la siguiente forma:

```http
Authorization: Bearer AUTH_SECRET_TOKEN
```

### Gestión de usuarios.

```http
GET /users
```
Ontiene todos los usuarios