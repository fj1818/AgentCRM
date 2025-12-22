# Guía de Componentes

## Componentes Comunes (`/components/common`)

### Button
Botón reutilizable con variantes y estados.

```tsx
<Button variant="primary" size="md" isLoading={false}>
  Guardar
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `isLoading`: boolean
- `leftIcon`, `rightIcon`: ReactNode

### Input
Campo de entrada con soporte para iconos y validación.

```tsx
<Input
  label="Email"
  error="Email inválido"
  leftIcon={<Mail />}
/>
```

### Card
Contenedor con secciones predefinidas.

```tsx
<Card padding="md" hover>
  <Card.Header>
    <Card.Title>Título</Card.Title>
  </Card.Header>
  <Card.Content>Contenido</Card.Content>
  <Card.Footer>Acciones</Card.Footer>
</Card>
```

### Avatar
Muestra imagen o iniciales.

```tsx
<Avatar name="Juan Pérez" size="md" />
```

### Badge
Etiqueta de estado.

```tsx
<Badge variant="success" dot>Activo</Badge>
```

## Componentes de Chat (`/components/chat`)

### ChatContainer
Orquestador principal del chat.

### ChatInput
Campo de entrada para mensajes.

### ChatMessage
Renderiza un mensaje individual.

### TypingIndicator
Indicador de escritura del asistente.

### WelcomeMessage
Mensaje inicial con sugerencias.

## Componentes de Tablas (`/components/tables`)

### DataTable
Tabla dinámica basada en datos.

```tsx
<DataTable
  data={{
    headers: ['Nombre', 'Email'],
    rows: [{ nombre: 'Juan', email: 'juan@mail.com' }]
  }}
  onRowClick={(row) => console.log(row)}
/>
```

### TablePagination
Control de paginación.

## Componentes de Gráficos (`/components/charts`)

### ChartContainer
Contenedor que selecciona el tipo de gráfico.

```tsx
<ChartContainer
  config={{ type: 'bar', title: 'Ventas' }}
  data={datos}
  series={[{ name: 'Ventas', dataKey: 'value' }]}
/>
```

## Componentes de Formularios (`/components/forms`)

### DynamicForm
Formulario generado dinámicamente.

```tsx
<DynamicForm
  fields={[
    { name: 'nombre', label: 'Nombre', type: 'text', required: true }
  ]}
  onSubmit={(values) => console.log(values)}
/>
```

