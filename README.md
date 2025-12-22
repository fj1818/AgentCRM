# AgentCRM 🤖

Asistente inteligente tipo ChatGPT para gestión de CRM. Permite consultar datos, generar gráficos, actualizar registros y más, todo a través de una interfaz conversacional.

## ✨ Características

- 💬 **Chat Inteligente**: Interfaz conversacional para interactuar con el CRM
- 📊 **Visualización de Datos**: Tablas dinámicas y gráficos interactivos
- ✏️ **Gestión de Registros**: Crear, actualizar y consultar entidades del CRM
- 🔗 **Integración n8n**: Conexión con agente de IA a través de webhook
- 🎨 **UI Moderna**: Diseño oscuro elegante con animaciones suaves

## 🏗️ Arquitectura

El proyecto está diseñado con una arquitectura altamente modular:

```
src/
├── components/    # Componentes UI por dominio
├── config/        # Configuración centralizada
├── hooks/         # Custom hooks
├── services/      # Servicios y API
├── stores/        # Estado global (Zustand)
├── types/         # Definiciones TypeScript
└── utils/         # Utilidades
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- npm o pnpm
- Instancia de n8n (para el agente)

### Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd agent-crm

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL de tu webhook

# Iniciar en desarrollo
npm run dev
```

### Configurar n8n

Ver [docs/N8N_SETUP.md](docs/N8N_SETUP.md) para instrucciones detalladas.

## 📁 Estructura de Carpetas

| Carpeta | Descripción |
|---------|-------------|
| `components/common` | Componentes UI reutilizables |
| `components/chat` | Sistema de chat |
| `components/charts` | Gráficos con Recharts |
| `components/tables` | Tablas de datos |
| `components/forms` | Formularios dinámicos |
| `components/layout` | Layout y navegación |
| `config/` | Configuración de app, API y tablas |
| `hooks/` | Custom hooks de React |
| `services/` | Servicios HTTP y webhook |
| `stores/` | Estado global con Zustand |
| `types/` | Interfaces TypeScript |
| `utils/` | Funciones utilitarias |

## 🛠️ Scripts

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Preview del build
npm run lint     # Linter
```

## 📚 Documentación

- [Arquitectura](docs/ARCHITECTURE.md)
- [Componentes](docs/COMPONENTS.md)
- [Configuración n8n](docs/N8N_SETUP.md)

## 🔧 Tecnologías

- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **TailwindCSS** - Estilos
- **Zustand** - Estado Global
- **Recharts** - Gráficos
- **Lucide** - Íconos
- **n8n + OpenAI** - Backend AI

## 📝 Próximos Pasos

1. [ ] Conectar webhook de n8n
2. [ ] Implementar renderizado de respuestas estructuradas
3. [ ] Agregar datos de prueba
4. [ ] Implementar CRUD de entidades
5. [ ] Agregar autenticación

## 📄 Licencia

MIT

