-- Script para actualizar los modos de validación de ejercicios
-- Esto permitirá respuestas más flexibles y mejor experiencia de usuario

-- 1. Ejercicio "Detector de Empresas Fantasma" (ID: 14)
-- Ahora aceptará solo el nombre de la empresa sin requerir "es empresa fantasma"
UPDATE exercises
SET solution_data = json_build_object(
    'correct_answer', solution_data->>'correct_answer',
    'explanation', solution_data->>'explanation',
    'valid_answers', json_build_array('Global Trading LLC', 'Global Trading', 'global trading llc', 'Global Trading LLC es empresa fantasma'),
    'validation_mode', 'name_only'
)
WHERE id = 14;

-- 2. Ejercicio "Detector de Células Terroristas en Redes" (ID: 21)
-- Aceptará diferentes formatos de lista (B, C, E / B C E / líder B operativos C E, etc.)
UPDATE exercises
SET solution_data = json_build_object(
    'correct_answer', solution_data->>'correct_answer',
    'explanation', solution_data->>'explanation',
    'valid_answers', json_build_array('Líder: B, Operativos: C, E', 'B C E', 'B, C, E', 'líder B operativos C E', 'B líder, C y E operativos', 'Leader B, ops C E'),
    'validation_mode', 'flexible_list'
)
WHERE id = 21;

-- 3. Ejercicio "Detector de Registros Duplicados en Base Criminal" (ID: 16)
-- Aceptará solo los códigos sin requerir "son duplicados"
UPDATE exercises
SET solution_data = json_build_object(
    'correct_answer', solution_data->>'correct_answer',
    'explanation', solution_data->>'explanation',
    'valid_answers', json_build_array('S001-S003 y S002-S005', 'S001 S003 S002 S005', 'S001-S003 S002-S005', 'S001 S002 S003 S005'),
    'validation_mode', 'name_only'
)
WHERE id = 16;

-- 4. Ejercicio "Identificador de Valores Atípicos en Transacciones" (ID: 18)
-- Aceptará solo los códigos de transacción
UPDATE exercises
SET solution_data = json_build_object(
    'correct_answer', solution_data->>'correct_answer',
    'explanation', solution_data->>'explanation',
    'valid_answers', json_build_array('T003 y T005', 'T003 T005', 'T003, T005', 'T005 T003', 'T005, T003'),
    'validation_mode', 'name_only'
)
WHERE id = 18;

-- 5. Ejercicio "Validador de Evidencia Digital Forense" (ID: 19)
-- Aceptará solo los códigos de evidencia
UPDATE exercises
SET solution_data = json_build_object(
    'correct_answer', solution_data->>'correct_answer',
    'explanation', solution_data->>'explanation',
    'valid_answers', json_build_array('EV002, EV003, EV005', 'EV002 EV003 EV005', 'EV002,EV003,EV005', 'EV002 EV003 EV005 son inadmisibles'),
    'validation_mode', 'name_only'
)
WHERE id = 19;

-- 6. Para otros ejercicios de tipo text_input que puedan beneficiarse
-- Ejercicio "Detección de Lavado con Algoritmos" (ID: 6)
UPDATE exercises
SET solution_data = json_build_object(
    'correct_answer', solution_data->>'correct_answer',
    'explanation', solution_data->>'explanation',
    'valid_answers', json_build_array('Estructuración: T001, T002, T003', 'T001 T002 T003', 'T001, T002, T003', 'Estructuración T001 T002 T003'),
    'validation_mode', 'name_only'
)
WHERE id = 6;

-- 7. Ejercicio "Análisis de Smart Contracts Sospechosos" (ID: 9)
UPDATE exercises
SET solution_data = json_build_object(
    'correct_answer', solution_data->>'correct_answer',
    'explanation', solution_data->>'explanation',
    'valid_answers', json_build_array('Plataforma 0xC3D4', '0xC3D4', 'Plataforma 0xC3D4 es sospechosa', '0xC3D4 plataforma'),
    'validation_mode', 'name_only'
)
WHERE id = 9;

-- Verificar los cambios
SELECT 
    id, 
    title, 
    type,
    solution_data->>'validation_mode' as validation_mode,
    solution_data->>'correct_answer' as correct_answer,
    solution_data->'valid_answers' as valid_answers
FROM exercises 
WHERE id IN (14, 21, 16, 18, 19, 6, 9)
ORDER BY id;