-- Cambiar el tipo de ejercicio 24 a 'multiple_choice' para que se renderice correctamente
UPDATE exercises 
SET type = 'multiple_choice'
WHERE id = 24;