# Celuma CRM (Local)

CRM web local para gestionar **proveedores** y **clientes** desde el navegador.

- Tecnología: `Next.js` + `Prisma` + `SQLite`
- Base de datos local: `prisma/dev.db`
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
npm run db:migrate -- --name init
```

3. (Opcional) Cargar datos de ejemplo:

```bash
npm run db:seed
```

4. Iniciar la app:

```bash
npm run dev
```

5. Abrir en navegador:

`http://localhost:3000`

## 3) Cómo se utiliza

Al entrar verás 2 áreas:

- **Proveedores**
	- Crear, editar y borrar proveedores
	- Buscar por texto (nombre, email, zona, servicios, notas)
	- Filtrar por tipo de proveedor
	- Importar proveedores desde CSV (separador `;`)

- **Clientes**
	- Crear, editar y borrar clientes
	- Buscar por texto
	- Filtrar por estado del cliente

## 4) Importación CSV de proveedores

Desde la pestaña **Proveedores**, en “Importar proveedores desde CSV”:

1. Selecciona tu archivo `.csv`
2. Pulsa **Importar CSV**
3. Se mostrará un mensaje con el número de registros importados

Notas:

- El importador lee con separador `;`
- Está preparado para campos como los del CSV de proveedores que compartiste

## 5) Scripts útiles

- Ejecutar en desarrollo: `npm run dev`
- Compilar producción: `npm run build`
- Lint: `npm run lint`
- Migraciones Prisma: `npm run db:migrate`
- Prisma Studio (ver datos): `npm run db:studio`

## 6) Estructura principal

- UI principal: `src/components/crm-dashboard.tsx`
- API proveedores: `src/app/api/providers`
- API clientes: `src/app/api/clients`
- Modelo DB: `prisma/schema.prisma`

