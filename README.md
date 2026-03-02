# Celuma CRM (Local - Professional Edition)

CRM local profesional para gestionar **proveedores**, **clientes**, **tareas** y **comunicaciones** desde el navegador.

- Tecnología: `Next.js 16` + `React 19` + `Prisma` + `SQLite`
- Base de datos local: `prisma/dev.db`
- Seguridad: autenticación JWT, roles de usuario, auditoría de cambios
- Compliance RGPD: anonimización de datos, soft-delete, consentimiento GDPR
- Diseño: paleta y logo de Celuma integrados

## 1) Requisitos

- Tener instalado `Node.js` (recomendado versión 20 o superior)
- Estar dentro de la carpeta del proyecto: `celuma-crm`

## 2) Puesta en marcha (paso a paso)

1. Instalar dependencias:

```bash
npm install
```

2. Crear/actualizar base de datos:

```bash
npm run db:migrate -- --name professional_phase1
```

3. Cargar datos de ejemplo e inicializar admin:

```bash
npm run db:seed
```

4. Iniciar la app:

```bash
npm run dev
```

5. Abrir en navegador:

`http://localhost:3000`

## 3) Credenciales de acceso

**Admin inicial:**
- Email: `administracion@celuma.es`
- Contraseña: `Celuma2026!` (por defecto; personalizar con env var)

_Para cambiar la contraseña, exportar en tu `.env`_:
```
ADMIN_PASSWORD=Tu_Nueva_Contraseña
```

## 4) Cómo se utiliza

### 4.1) Pestaña Proveedores

- **Crear/editar**: formulario lateral con 40+ campos
- **Búsqueda**: por nombre, email, zona, servicios, notas
- **Filtro**: por tipo de proveedor (dinámico)
- **Importar CSV**: desde archivo `.csv` con separador `;`
- **Deduplicación**: solo nombres/teléfono/email activos permiten duplicados
- **Anonimización**: al borrar, enmascara datos personales (**RGPD**)
- **Comunicaciones**: timeline de llamadas, emails, mensajes

### 4.2) Pestaña Clientes

- **Crear/editar**: con eventos, presupuestos, estado, source
- **Búsqueda**: por nombre, contacto, evento
- **Filtro**: por estado (Lead, Propuesta, Contratado, etc.)
- **GDPR**: tracking de consentimiento y opt-in marketing
- **Anonimización**: al borrar, soft-delete + enmascaramiento
- **Comunicaciones**: timeline de conversaciones

### 4.3) Pestaña Tareas

- **Crear tareas**: con título, descripción, fecha límite, prioridad
- **Asignación**: por defecto al usuario actual
- **Estados**: Pendiente → En curso → Hecha / Cancelada
- **Auditoría**: registro de creación y cambios de estado

### 4.4) Comunicaciones & Notas (soportadas)

- **Timeline**: registrar conversaciones por proveedor o cliente
- **Canal**: email, llamada, WhatsApp, etc.
- **Auditoria**: quién y cuándo escribió cada nota
- **Acceso**: visible solo viendo el proveedor/cliente seleccionado

### 4.5) Admin: Backup y auditoría

- **Backup manual**: botón en header (solo admin)
  - Copia la DB a `/backups/backup-<timestamp>.db`
- **Auditoría**: registro automático de:
  - Creación/actualización/anonimización de proveedores & clientes
  - Importes de CSV
  - Cambios en tareas, notas
  - Acciones de backup

## 5) Importación CSV de proveedores

Desde la pestaña **Proveedores**, en "Importar proveedores desde CSV":

1. Selecciona tu archivo `.csv`
2. Pulsa **Importar CSV**
3. Se mostrará un mensaje con números de importados y saltados (deduplicación)

**Notas:**
- Separador: `;`
- Campos soportados: tipo, nombre comercial, contacto, teléfono, email, web, Instagram, zona, servicios, precios, fechas, ratings, etc.
- Deduplicación: evita importar registros duplicados por name/phone/mail

## 6) Seguridad y privacidad

- **Autenticación**: JWT con cookies httpOnly, 7 días sesión
- **Roles**: ADMIN vs AGENT (backup solo admins)
- **Contraseñas**: scrypt-hashed con salt aleatorio
- **Anonimización**: Borrar = soft-delete con datos enmascarados
- **Auditoría**: Cada cambio registra: quién, qué, cuándo, antes/después
- **GDPR**: Consentimiento tracking, opt-in marketing, retención de datos

## 7) Scripts útiles

- Ejecutar en desarrollo: `npm run dev`
- Compilar producción: `npm run build`
- Lint: `npm run lint`
- Migraciones Prisma: `npm run db:migrate`
- Prisma Studio (ver datos): `npm run db:studio`
- Seed datos de ejemplo: `npm run db:seed`

## 8) Estructura principal

```
src/
  app/
    api/
      auth/
        login/              # POST: email + password → JWT cookie
        logout/             # POST: limpia sesión
        me/                 # GET: user actual autenticado
      providers/            # CRUD, tipos, importar CSV (autenticado)
      clients/              # CRUD búsqueda (autenticado)
      tasks/                # CRUD tareas con auditoría (autenticado)
      notes/                # Timeline comunicaciones (autenticado)
      admin/
        backup/             # POST: copia DB (admin only)
    login/                  # Página login: form email+password
    page.tsx                # Dashboard principal (server-protegido)
    layout.tsx              # Layout raíz con suppressHydrationWarning
    globals.css             # Estilos Celuma theme + Tailwind
  components/
    crm-dashboard.tsx       # UI: provider/client/tasks/notes/comunicaciones
  lib/
    auth.ts                 # JWT: createToken, verifyToken, session helpers
    security.ts             # scrypt: hashPassword, verifyPassword
    audit.ts                # logActivity: registra acciones en ActivityLog
    prisma.ts               # PrismaClient singleton
    crm.ts                  # Helpers: parse, formateo, constantes
prisma/
  schema.prisma             # Modelos: User, Provider, Client, Task, Note, ActivityLog, BackupLog
  migrations/               # Historial migraciones SQL
  seed.ts                   # Datos iniciales: admin, ejemplos
```

## 9) Modelos de datos principales

### User
- email (único)
- passwordHash (scrypt)
- role: ADMIN | AGENT
- active: boolean

### Provider
- providerType, businessName
- contactName, phone, email
- Precios: minPrice, avgPrice, maxPrice
- Dates: firstContactDate
- Ratings: professionalism, communication, etc.
- **GDPR**: gdprConsentForMedia, gdprConsentAt
- **Soft-delete**: deletedAt (NULL = activo)

### Client
- fullName, phone, email
- eventType, eventDate, eventLocation
- guestCount, budgetMin, budgetMax
- status, source, assignedProviderType
- **GDPR**: gdprConsent, marketingOptIn
- **Soft-delete**: deletedAt

### Task
- title, description, dueDate
- status: PENDING | IN_PROGRESS | DONE | CANCELLED
- priority (1-3)
- createdBy, assignedTo (User refs)
- entityType, entityId (optional: link PROVIDER/CLIENT)

### Note
- entityType: PROVIDER | CLIENT
- entityId: ID de provider/client
- content, channel (email, call, whatsapp, etc.)
- createdBy: User ref
- contactAt (cuando ocurrió la comunicación)

### ActivityLog
- userId, action (e.g. "PROVIDER_CREATED")
- entityType, entityId
- summary, beforeJson, afterJson

### BackupLog
- filePath (ruta al backup)
- createdById: User ref

## 10) Notas de desarrollo

- Framework: Next.js 16 App Router (server-side rendering por defecto)
- ORM: Prisma 6.16.2 con SQLite (file-based)
- Estilos: Tailwind CSS v4 con PostCSS
- Deps de seguridad: jose (JWT), Node crypto (scrypt)
- CSV parsing: papaparse + iconv-lite (Latin1 encoding)
- TypeScript stricto, linting con ESLint Next.js
- React 19: client-side state management sencillo

## 11) Troubleshooting

**Error EPERM al generar Prisma:**
- Detener procesos `node` en uso: terminar `npm run dev`
- Intentar: `npm run db:generate`

**Login no funciona:**
- Verificar admin creado: `npm run db:seed`
- Revisar credenciales en `.env` si personalizaste password
- Revisar consola del navegador > Network tab

**Comunicaciones/tareas no se cargan:**
- Verificar migraciones aplicadas: `npm run db:migrate`
- Revisar consola del navegador (DevTools > Network)
- Usar Prisma Studio: `npm run db:studio`

**Datos de proveedores/clientes no aparecen:**
- Verificar eres admin (solo accs con role ADMIN ven todos)
- Revisar si hay datos soft-deleted (deletedAt != NULL se ocultan)

---

**© 2025 Celuma CRM** | Edición Local Profesional | v1.0.0

