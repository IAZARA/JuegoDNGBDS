-- Migración para soportar múltiples intentos por ejercicio
-- Ejecutar este archivo para actualizar la base de datos

-- 1. Eliminar la restricción UNIQUE actual
ALTER TABLE exercise_attempts DROP CONSTRAINT exercise_attempts_user_id_exercise_id_key;

-- 2. Agregar columnas para el sistema de múltiples intentos
ALTER TABLE exercise_attempts ADD COLUMN IF NOT EXISTS attempt_number INTEGER DEFAULT 1;
ALTER TABLE exercise_attempts ADD COLUMN IF NOT EXISTS max_attempts INTEGER DEFAULT 3;

-- 3. Crear nueva restricción para limitar intentos por ejercicio
-- Esto previene que se excedan los intentos máximos
CREATE UNIQUE INDEX idx_user_exercise_attempt ON exercise_attempts(user_id, exercise_id, attempt_number);

-- 4. Actualizar intentos existentes para que tengan attempt_number = 1
UPDATE exercise_attempts SET attempt_number = 1 WHERE attempt_number IS NULL;

-- 5. Función para obtener el siguiente número de intento
CREATE OR REPLACE FUNCTION get_next_attempt_number(p_user_id INTEGER, p_exercise_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    next_attempt INTEGER;
BEGIN
    SELECT COALESCE(MAX(attempt_number), 0) + 1 
    INTO next_attempt
    FROM exercise_attempts 
    WHERE user_id = p_user_id AND exercise_id = p_exercise_id;
    
    RETURN next_attempt;
END;
$$ LANGUAGE plpgsql;

-- 6. Función para verificar si el usuario puede hacer más intentos
CREATE OR REPLACE FUNCTION can_attempt_exercise(p_user_id INTEGER, p_exercise_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    current_attempts INTEGER;
    max_attempts INTEGER;
    is_completed BOOLEAN;
BEGIN
    -- Verificar si ya completó correctamente el ejercicio
    SELECT COUNT(*) > 0 INTO is_completed
    FROM exercise_attempts 
    WHERE user_id = p_user_id AND exercise_id = p_exercise_id AND is_correct = true;
    
    IF is_completed THEN
        RETURN false;
    END IF;
    
    -- Contar intentos actuales
    SELECT COUNT(*) INTO current_attempts
    FROM exercise_attempts 
    WHERE user_id = p_user_id AND exercise_id = p_exercise_id;
    
    -- Obtener máximo de intentos permitidos (por defecto 3)
    max_attempts := 3;
    
    RETURN current_attempts < max_attempts;
END;
$$ LANGUAGE plpgsql;

-- 7. Función para calcular puntos basado en el número de intento
CREATE OR REPLACE FUNCTION calculate_attempt_points(base_points INTEGER, attempt_number INTEGER)
RETURNS INTEGER AS $$
BEGIN
    CASE attempt_number
        WHEN 1 THEN RETURN base_points; -- 100%
        WHEN 2 THEN RETURN ROUND(base_points * 0.75); -- 75%
        WHEN 3 THEN RETURN ROUND(base_points * 0.50); -- 50%
        ELSE RETURN 0; -- No points for attempts beyond 3
    END CASE;
END;
$$ LANGUAGE plpgsql;