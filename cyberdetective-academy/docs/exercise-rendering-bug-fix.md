# Bug Común: Renderizado de Datos en Ejercicios

## Descripción del Problema

**Error frecuente:** Los ejercicios no muestran los datos necesarios para resolver las preguntas, apareciendo solo el texto de la pregunta y el contexto, pero sin los datos específicos (empresas, transacciones, archivos, etc.).

## Causa Raíz

El problema está en el componente `ExercisePlayer.jsx` en el método `renderProblemData()`. Los datos se renderizan condicionalmente según el `type` del ejercicio, pero hay inconsistencias entre los tipos definidos en la base de datos y los casos implementados en el código.

### Ubicación del Problema
- **Archivo:** `/frontend/src/components/exercises/ExercisePlayer.jsx`
- **Método:** `renderProblemData()`
- **Líneas:** Switch statement que maneja diferentes tipos de ejercicios

## Casos Problemáticos Identificados

### Ejercicio 46 - "Detector de Empresas Fantasma"
- **Tipo en DB:** `data_analysis`
- **Datos esperados:** Array de empresas con propiedades (name, employees, revenue, transactions, office, website)
- **Problema:** El código para renderizar `companies` solo existía en el caso `text_input`, no en `data_analysis`

## Solución Implementada

### Antes (Problemático)
```javascript
case 'data_analysis':
  return (
    <div className="data-display">
      {/* Solo código genérico, sin renderizado específico de companies */}
    </div>
  );

case 'text_input':
  return (
    <div className="data-display">
      {/* Código de companies estaba aquí incorrectamente */}
      {data.companies && (
        <div className="data-display">
          {/* ... renderizado de empresas ... */}
        </div>
      )}
    </div>
  );
```

### Después (Corregido)
```javascript
case 'data_analysis':
  return (
    <div className="data-display">
      {/* Agregado: Renderizado de empresas para data_analysis */}
      {data.companies && (
        <div className="data-display">
          <h5>🏢 Empresas:</h5>
          {data.companies.map((company, index) => (
            <div key={index} className="company-card">
              <h6>{company.name}</h6>
              <p><strong>Empleados:</strong> {company.employees}</p>
              <p><strong>Ingresos:</strong> {company.revenue}</p>
              <p><strong>Transacciones:</strong> {company.transactions}</p>
              <p><strong>Oficina:</strong> {company.office}</p>
              <p><strong>Website:</strong> {company.website}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
```

## Cómo Diagnosticar Este Error

### 1. Síntomas
- El ejercicio carga correctamente
- La pregunta y contexto aparecen
- Falta información específica para responder
- No hay errores en consola

### 2. Pasos de Diagnóstico
```bash
# 1. Verificar tipo de ejercicio en DB
node backend/src/db/debug-exercise-[ID].js

# 2. Revisar que el tipo coincida con el case en ExercisePlayer.jsx
grep -n "case '[TIPO]'" frontend/src/components/exercises/ExercisePlayer.jsx

# 3. Verificar que los datos se estén enviando desde el backend
# (revisar respuesta de API en Network tab del navegador)
```

### 3. Verificación en Frontend
```javascript
// En ExercisePlayer.jsx, agregar console.log temporal
console.log('Exercise type:', exercise.type);
console.log('Exercise data:', exercise.data);
```

## Patrón de Solución

### Para cada tipo de ejercicio, asegurar que:
1. **El tipo en DB coincida con el case en código**
2. **Los datos específicos se rendericen en el case correcto**
3. **Se manejen todos los tipos de datos esperados**

### Tipos Comunes y Sus Datos
```javascript
// Mapeo de tipos y datos esperados
const exerciseDataTypes = {
  'data_analysis': ['companies', 'transactions', 'reports'],
  'text_input': ['context', 'files'],
  'multiple_choice': ['options'],
  'image_analysis': ['images', 'metadata'],
  'code_review': ['code', 'files'],
  'network_analysis': ['connections', 'logs']
};
```

## Prevención

### 1. Checklist para Nuevos Ejercicios
- [ ] Definir tipo de ejercicio consistentemente
- [ ] Implementar case en `renderProblemData()`
- [ ] Probar renderizado de datos específicos
- [ ] Verificar en diferentes tipos de ejercicio

### 2. Testing
```javascript
// Test para verificar renderizado por tipo
describe('ExercisePlayer Data Rendering', () => {
  test('should render companies for data_analysis type', () => {
    const mockExercise = {
      type: 'data_analysis',
      data: { companies: [mockCompanyData] }
    };
    // Verificar que se rendericen las empresas
  });
});
```

## Archivos Relacionados

- **Frontend:** `/frontend/src/components/exercises/ExercisePlayer.jsx`
- **Backend:** `/backend/src/routes/exercises.js`
- **Database:** `/backend/src/db/seed-exercises.js`
- **Debug Scripts:** `/backend/src/db/debug-exercise-*.js`

## Contacto

Si encuentras este error en otros ejercicios, seguir el mismo patrón de solución y actualizar este documento con los nuevos casos encontrados.

## Casos Adicionales Solucionados

### Ejercicio 53 - "Red de Comunicación Sospechosa"
- **Tipo en DB:** `data_analysis`
- **Datos esperados:** `communication_network` con nodos y conexiones
- **Problema:** Faltaba renderizado para `communication_network`
- **Solución:** Agregado renderizado de nodos y conexiones de red

### Ejercicio 55 - "Predicción del Próximo Crimen"
- **Tipo en DB:** `data_analysis`
- **Datos esperados:** `crime_sequence` y `next_targets`
- **Problema:** Faltaba renderizado para secuencia de crímenes y próximos objetivos
- **Solución:** Agregado renderizado de timeline de crímenes y lista de objetivos

## Código de Solución Agregado

### Para communication_network (Ejercicio 53)
```javascript
{data.communication_network && (
  <div className="data-display">
    <h5>📡 Red de Comunicación:</h5>
    {data.communication_network.nodes && (
      <div className="network-nodes">
        <h6>Nodos de la Red:</h6>
        <div className="nodes-grid">
          {data.communication_network.nodes.map((node, index) => (
            <div key={index} className="node-card">
              <h6>{node.id}</h6>
              <p><strong>Tipo:</strong> {node.type}</p>
              <p><strong>Ubicación:</strong> {node.location}</p>
              <p><strong>Estado:</strong> {node.status}</p>
              {node.connections && <p><strong>Conexiones:</strong> {node.connections}</p>}
            </div>
          ))}
        </div>
      </div>
    )}
    {data.communication_network.connections && (
      <div className="network-connections">
        <h6>Conexiones:</h6>
        <div className="connections-list">
          {data.communication_network.connections.map((conn, index) => (
            <div key={index} className="connection-item">
              <p><strong>{conn.from}</strong> → <strong>{conn.to}</strong></p>
              <p>Frecuencia: {conn.frequency}</p>
              {conn.encrypted && <p className="encrypted">🔒 Encriptado</p>}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)}
```

### Para crime_sequence y next_targets (Ejercicio 55)
```javascript
{data.crime_sequence && (
  <div className="data-display">
    <h5>🔍 Secuencia del Crimen:</h5>
    <div className="crime-timeline">
      {data.crime_sequence.map((event, index) => (
        <div key={index} className="crime-event">
          <div className="event-number">{index + 1}</div>
          <div className="event-details">
            {event.time && <p><strong>Hora:</strong> {event.time}</p>}
            {event.location && <p><strong>Ubicación:</strong> {event.location}</p>}
            {event.action && <p><strong>Acción:</strong> {event.action}</p>}
            {event.description && <p><strong>Descripción:</strong> {event.description}</p>}
            {event.evidence && <p><strong>Evidencia:</strong> {event.evidence}</p>}
          </div>
        </div>
      ))}
    </div>
  </div>
)}

{data.next_targets && (
  <div className="data-display">
    <h5>🎯 Próximos Objetivos:</h5>
    <div className="targets-list">
      {data.next_targets.map((target, index) => (
        <div key={index} className="target-card">
          <h6>{target.name || target.id}</h6>
          {target.location && <p><strong>Ubicación:</strong> {target.location}</p>}
          {target.value && <p><strong>Valor:</strong> {target.value}</p>}
          {target.security && <p><strong>Seguridad:</strong> {target.security}</p>}
          {target.risk && <p><strong>Riesgo:</strong> {target.risk}</p>}
          {target.probability && <p><strong>Probabilidad:</strong> {target.probability}</p>}
        </div>
      ))}
    </div>
  </div>
)}
```

---
*Última actualización: 2025-07-23*
*Ejercicios afectados conocidos: 46, 53, 55*