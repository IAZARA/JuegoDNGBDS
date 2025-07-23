-- Migración para cambiar de level a difficulty y reorganizar ejercicios

-- Agregar nueva columna difficulty
ALTER TABLE exercises ADD COLUMN difficulty INTEGER;

-- Migrar datos de level a difficulty reorganizando por dificultad real
-- Asignar difficulty basándose en puntos, tiempo límite y complejidad
UPDATE exercises SET difficulty = CASE
    WHEN points <= 10 AND time_limit >= 180 THEN 1  -- Muy fácil
    WHEN points <= 15 AND time_limit >= 150 THEN 2  -- Fácil
    WHEN points <= 25 AND time_limit >= 120 THEN 3  -- Medio
    WHEN points <= 35 AND time_limit >= 90 THEN 4   -- Difícil
    ELSE 5  -- Muy difícil
END;

-- Actualizar order_index para ordenar por dificultad
WITH ranked_exercises AS (
    SELECT id, 
           ROW_NUMBER() OVER (ORDER BY difficulty ASC, points ASC, time_limit DESC) as new_order
    FROM exercises
)
UPDATE exercises 
SET order_index = ranked_exercises.new_order
FROM ranked_exercises 
WHERE exercises.id = ranked_exercises.id;

-- Agregar constraint a la nueva columna
ALTER TABLE exercises ADD CONSTRAINT check_difficulty CHECK (difficulty >= 1 AND difficulty <= 5);

-- Eliminar la columna level anterior
ALTER TABLE exercises DROP COLUMN level;

-- Renombrar difficulty a level si es necesario para mantener compatibilidad
-- ALTER TABLE exercises RENAME COLUMN difficulty TO level;