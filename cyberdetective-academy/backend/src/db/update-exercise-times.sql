-- Actualizar tiempos de ejercicios según dificultad
-- Dificultad 1 (Muy fácil) = 3 minutos (180 segundos)
-- Dificultad 2 (Fácil) = 3 minutos (180 segundos)
-- Dificultad 3 (Medio) = 4 minutos (240 segundos)
-- Dificultad 4 (Difícil) = 5 minutos (300 segundos)

-- Actualizar ejercicios de dificultad 1 (muy fácil) a 3 minutos
UPDATE exercises 
SET time_limit = 180 
WHERE difficulty = 1;

-- Actualizar ejercicios de dificultad 2 (fácil) a 3 minutos
UPDATE exercises 
SET time_limit = 180 
WHERE difficulty = 2;

-- Actualizar ejercicios de dificultad 3 (medio) a 4 minutos
UPDATE exercises 
SET time_limit = 240 
WHERE difficulty = 3;

-- Actualizar ejercicios de dificultad 4 (difícil) a 5 minutos
UPDATE exercises 
SET time_limit = 300 
WHERE difficulty = 4;

-- Verificar los cambios
SELECT 
    difficulty,
    COUNT(*) as cantidad_ejercicios,
    time_limit/60 as minutos
FROM exercises 
GROUP BY difficulty, time_limit 
ORDER BY difficulty;