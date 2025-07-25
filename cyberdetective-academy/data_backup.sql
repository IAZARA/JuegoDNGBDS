--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Homebrew)
-- Dumped by pg_dump version 14.18 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: cyberdetective
--

INSERT INTO public.admins VALUES (1, 'ivan.zarate', '$2b$10$Obf5frqljR3QrVtxM4eFpetxrOsw6aM.FAPsZt/4ACJb6sLsl8Mee', 'Ivan Zarate', 'ivan.zarate@admin.com', true, '2025-07-24 13:11:29.51766', '2025-07-24 13:11:29.51766');


--
-- Data for Name: badges; Type: TABLE DATA; Schema: public; Owner: cyberdetective
--

INSERT INTO public.badges VALUES (1, 'Data Cleaner', 'Completa 3 ejercicios de limpieza de datos', '/badges/data-cleaner.svg', '{"type": "exercise_category", "category": "data_cleaning", "count": 3}', 0, '2025-07-23 17:07:41.337555');
INSERT INTO public.badges VALUES (2, 'Pattern Hunter', 'Encuentra 5 patrones criminales', '/badges/pattern-hunter.svg', '{"type": "exercise_category", "category": "pattern_detection", "count": 5}', 0, '2025-07-23 17:07:41.337555');
INSERT INTO public.badges VALUES (3, 'AI Detective', 'Resuelve un caso usando IA', '/badges/ai-detective.svg', '{"type": "exercise_type", "type": "ai_analysis", "count": 1}', 0, '2025-07-23 17:07:41.337555');
INSERT INTO public.badges VALUES (4, 'Speed Demon', 'Completa 10 ejercicios en menos de 2 minutos cada uno', '/badges/speed-demon.svg', '{"type": "speed", "exercises": 10, "max_time": 120}', 0, '2025-07-23 17:07:41.337555');
INSERT INTO public.badges VALUES (5, 'Perfect Score', 'Obtén puntuación perfecta en 5 ejercicios', '/badges/perfect-score.svg', '{"type": "perfect", "count": 5}', 0, '2025-07-23 17:07:41.337555');


--
-- Data for Name: exercises; Type: TABLE DATA; Schema: public; Owner: cyberdetective
--

INSERT INTO public.exercises VALUES (1, 'Detective de Limpieza de Datos: Problema de Formato', 'Identifica el campo con formato o valor inválido en este registro de transacciones sospechosas.', 1, 8, 'data_cleaning', 'multiple_choice', '{"transaction": {"ID_Transaccion": "T001", "Monto": "-500", "Fecha": "2023-13-25", "Origen": "cuenta_x", "Destino": "cuenta_y"}, "options": ["ID_Transaccion", "Monto", "Fecha", "Origen", "Destino"], "question": "¿Qué campo presenta un problema de formato o valor inválido evidente?"}', '{"correct_answer": "Fecha", "explanation": "La fecha tiene un mes inválido (13). Los meses válidos van del 01 al 12.", "valid_answers": ["fecha", "Fecha"]}', '["Revisa el formato estándar de fechas", "¿Los meses pueden ser mayor a 12?", "El formato correcto es YYYY-MM-DD"]', 180, 1, '2025-07-23 17:07:41.337555');
INSERT INTO public.exercises VALUES (3, 'Validador de Identidades Digitales', 'Detecta cuál de estos documentos digitales es falso basándote en los metadatos.', 2, 12, 'fraud_detection', 'metadata_analysis', '{"documents": [{"id": "DOC001", "created": "2023-06-15T10:30:00Z", "modified": "2023-06-15T10:30:00Z", "size": "2.1MB", "hash": "a7b9c3d4"}, {"id": "DOC002", "created": "2023-06-20T14:15:00Z", "modified": "2023-06-19T09:00:00Z", "size": "1.8MB", "hash": "e5f2a8b1"}, {"id": "DOC003", "created": "2023-06-18T11:45:00Z", "modified": "2023-06-18T11:45:00Z", "size": "2.3MB", "hash": "c9d7e6f5"}], "question": "¿Cuál documento es falso?"}', '{"correct_answer": "DOC002", "explanation": "DOC002 tiene fecha de modificación anterior a su fecha de creación, lo cual es imposible.", "valid_answers": ["DOC002", "doc002"]}', '["Revisa las fechas cuidadosamente", "¿Puede un archivo ser modificado antes de ser creado?", "Compara created vs modified"]', 180, 3, '2025-07-23 17:07:41.337555');
INSERT INTO public.exercises VALUES (4, 'Identificador de Anomalías Financieras', 'Encuentra la transacción anómala en este conjunto de movimientos bancarios.', 2, 15, 'pattern_detection', 'data_analysis', '{"transactions": [{"id": "T101", "amount": 150.00, "time": "09:15"}, {"id": "T102", "amount": 85.50, "time": "10:30"}, {"id": "T103", "amount": 15000.00, "time": "10:31"}, {"id": "T104", "amount": 200.00, "time": "11:45"}, {"id": "T105", "amount": 120.75, "time": "14:20"}], "question": "¿Cuál transacción es sospechosa y por qué?"}', '{"correct_answer": "T103", "explanation": "La transacción T103 es 100 veces mayor que el promedio y ocurre 1 minuto después de otra transacción, patrón típico de lavado de dinero.", "valid_answers": ["T103", "t103"]}', '["Compara los montos entre sí", "Observa los patrones temporales", "¿Hay algún monto significativamente diferente?"]', 180, 4, '2025-07-23 17:07:41.337555');
INSERT INTO public.exercises VALUES (6, 'Detección de Lavado con Algoritmos', 'Usa técnicas de análisis predictivo para identificar transacciones sospechosas que podrían indicar lavado de dinero.', 3, 22, 'pattern_detection', 'text_input', '{"transactions": [{"id": "T001", "amount": "$9,500", "time": "14:30"}, {"id": "T002", "amount": "$9,800", "time": "14:35"}, {"id": "T003", "amount": "$9,900", "time": "14:40"}, {"id": "T004", "amount": "$15,000", "time": "09:00"}, {"id": "T005", "amount": "$2,000", "time": "16:00"}], "question": "¿Cuál es el patrón más indicativo de lavado de dinero en estas transacciones?", "context": "Analiza montos, frecuencia, horarios y cuentas involucradas. Importante: Los bancos deben generar reportes de operaciones sospechosas (ROS) para transacciones iguales o superiores a $10,000.", "input_placeholder": "XXX, XXX, XXX evitan el límite de $10,000", "input_hint": "💡 Pista: Reemplaza las XXX con los IDs de las transacciones sospechosas (ejemplo: T001). Busca transacciones que parezcan diseñadas para evitar el reporte automático."}', '{"correct_answer": "Estructuración: T001, T002, T003 evitan el límite de $10,000", "explanation": "Las transacciones T001, T002 y T003 muestran un patrón clásico de estructuración o smurfing: múltiples transferencias justo por debajo del límite de $10,000 en un corto período (5 minutos). Esto es una técnica común para evitar reportes automáticos de transacciones grandes.", "valid_answers": ["T001, T002, T003", "T001,T002,T003", "T001 T002 T003"]}', '["Busca transacciones justo debajo de $10,000", "Observa el tiempo entre transacciones", "¿Hay un patrón de montos similares?"]', 240, 8, '2025-07-23 17:07:41.337555');
INSERT INTO public.exercises VALUES (7, 'Seguimiento de Criptomonedas Básico', 'Rastrea esta cadena de transacciones Bitcoin y encuentra la billetera final.', 3, 22, 'blockchain_analysis', 'text_input', '{"blockchain": {"transactions": [{"from": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", "to": "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2", "amount": 0.5}, {"from": "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2", "to": "1F1tAaz5x1HUXrCNLbtMDqcw6o5GNn4xqX", "amount": 0.3}, {"from": "1F1tAaz5x1HUXrCNLbtMDqcw6o5GNn4xqX", "to": "1Cdid9KFAaatwczBwBttQcwXYCpvK8h7FK", "amount": 0.25}]}, "question": "¿Cuál es la dirección de la billetera final?"}', '{"correct_answer": "1Cdid9KFAaatwczBwBttQcwXYCpvK8h7FK", "explanation": "Siguiendo la cadena de transacciones, el dinero termina en la billetera 1Cdid9KFAaatwczBwBttQcwXYCpvK8h7FK."}', '["Sigue la cadena de transacciones", "Observa el campo to de cada transacción", "La última billetera no tiene transacciones salientes"]', 240, 6, '2025-07-23 17:07:41.337555');
INSERT INTO public.exercises VALUES (5, 'Rastreador de IPs Sospechosas', 'Analiza este log de conexiones y encuentra la IP que está realizando un ataque de fuerza bruta.', 2, 18, 'network_analysis', 'data_analysis', '{"connections": [{"ip": "192.168.1.100", "attempts": 3, "success": 1, "time_span": "5min"}, {"ip": "10.0.0.15", "attempts": 45, "success": 0, "time_span": "2min"}, {"ip": "172.16.0.5", "attempts": 2, "success": 2, "time_span": "1h"}, {"ip": "203.0.113.0", "attempts": 1, "success": 1, "time_span": "30s"}], "question": "¿Qué IP está realizando un ataque de fuerza bruta?"}', '{"correct_answer": "10.0.0.15", "explanation": "La IP 10.0.0.15 realizó 45 intentos fallidos en solo 2 minutos, patrón típico de ataque de fuerza bruta.", "valid_answers": ["10.0.0.15"]}', '["Busca IPs con muchos intentos fallidos", "Observa la relación intentos/éxito", "El tiempo corto entre intentos es sospechoso"]', 180, 5, '2025-07-23 17:07:41.337555');
INSERT INTO public.exercises VALUES (8, 'Análisis de Red Criminal', 'Identifica al líder de esta red criminal basándote en las conexiones y patrones de actividad.', 4, 30, 'network_analysis', 'data_analysis', '{"network": {"nodes": [{"id": "A", "connections": 5, "transactions": 50000}, {"id": "B", "connections": 12, "transactions": 200000}, {"id": "C", "connections": 3, "transactions": 15000}, {"id": "D", "connections": 8, "transactions": 80000}], "edges": [{"from": "A", "to": "B"}, {"from": "B", "to": "C"}, {"from": "B", "to": "D"}, {"from": "A", "to": "D"}]}, "question": "¿Quién es el líder de la red y por qué?"}', '{"correct_answer": "B", "explanation": "El nodo B tiene más conexiones (12) y mayor volumen de transacciones (200,000), indicando su rol central en la red. Es el hub principal que conecta con la mayoría de otros nodos.", "valid_answers": ["B", "b"]}', '["Observa quién tiene más conexiones", "Considera el volumen de transacciones", "El líder suele estar en el centro de la red"]', 300, 7, '2025-07-23 17:07:41.337555');
INSERT INTO public.exercises VALUES (9, 'Análisis de Smart Contracts Sospechosos', 'Identifica el smart contract que podría ser un esquema Ponzi analizando sus funciones.', 4, 28, 'blockchain_analysis', 'text_input', '{"contracts": [{"address": "0xA1B2", "functions": ["deposit()", "withdraw()", "getBalance()"], "description": "Sistema de ahorro con interés fijo del 5% anual"}, {"address": "0xC3D4", "functions": ["invest()", "referBonus()", "withdrawProfits()", "getDownline()"], "description": "Plataforma de inversión con retornos del 20% mensual"}, {"address": "0xE5F6", "functions": ["stake()", "unstake()", "claimRewards()"], "description": "Pool de liquidez para trading"}], "question": "¿Qué contrato es probablemente un esquema Ponzi?", "context": "Los esquemas Ponzi en blockchain suelen prometer retornos irrealmente altos y tienen funciones relacionadas con referidos y líneas descendentes.", "input_placeholder": "Plataforma XXXXX", "input_hint": "💡 Pista: Reemplaza XXXXX con la dirección del contrato sospechoso"}', '{"correct_answer": "Plataforma 0xC3D4", "explanation": "El contrato 0xC3D4 muestra señales claras de esquema Ponzi: promete retornos del 20% mensual (irrealmente altos), tiene función de bonos por referidos y sistema de downline, características típicas de esquemas piramidales.", "valid_answers": ["0xC3D4", "C3D4", "Plataforma 0xC3D4"]}', '["20% mensual es insostenible", "Busca funciones de referidos", "Los Ponzi dependen de nuevos inversores"]', 300, 9, '2025-07-23 17:07:41.337555');
INSERT INTO public.exercises VALUES (16, 'Detector de Registros Duplicados en Base Criminal', 'Encuentra personas registradas múltiples veces con variaciones menores en sus datos.', 3, 18, 'data_cleaning', 'text_input', '{"suspects": [{"id": "S001", "name": "Carlos Rodriguez", "dni": "12345678", "phone": "+54-11-1234-5678", "address": "Av. Corrientes 1234"}, {"id": "S002", "name": "Maria Gonzalez", "dni": "87654321", "phone": "+54-11-8765-4321", "address": "Calle Florida 567"}, {"id": "S003", "name": "Carlos Rodríguez", "dni": "12345678", "phone": "+541112345678", "address": "Av Corrientes 1234"}, {"id": "S004", "name": "Juan Perez", "dni": "11223344", "phone": "+54-11-2233-4455", "address": "San Martin 890"}, {"id": "S005", "name": "MARIA GONZALEZ", "dni": "87654321", "phone": "11-8765-4321", "address": "Florida 567"}], "question": "¿Qué registros representan a las mismas personas?", "context": "Los duplicados pueden tener variaciones en formato de nombres, teléfonos o direcciones, pero mantienen datos clave idénticos. Importante: El DNI es único por persona en Argentina.", "input_placeholder": "XXXX-XXXX y XXXX-XXXX son duplicados", "input_hint": "💡 Pista: Busca DNIs idénticos y variaciones menores en formato de nombres/direcciones"}', '{"correct_answer": "S001-S003 y S002-S005 son duplicados", "explanation": "S001 y S003 son la misma persona (Carlos Rodriguez, DNI 12345678) con variaciones en acentos y formato de teléfono/dirección. S002 y S005 son la misma persona (Maria Gonzalez, DNI 87654321) con variaciones en mayúsculas y formato de teléfono/dirección.", "valid_answers": ["S001-S003 y S002-S005", "S003-S001 y S005-S002", "S001,S003 y S002,S005"]}', '["El DNI es único por persona", "Ignora diferencias de formato", "Mayúsculas vs minúsculas son iguales"]', 240, 16, '2025-07-23 17:07:41.337555');
INSERT INTO public.exercises VALUES (14, 'Detector de Empresas Fantasma', 'Identifica la empresa fantasma usada para lavado de dinero.', 4, 26, 'fraud_detection', 'data_analysis', '{"companies": [{"name": "Tech Solutions SA", "employees": 45, "revenue": "$2.5M", "transactions": "150/mes", "office": "Edificio corporativo, piso 5", "website": "techsolutions.com"}, {"name": "Global Trading LLC", "employees": 2, "revenue": "$50M", "transactions": "2000/mes", "office": "Casilla postal", "website": "ninguno"}, {"name": "Marketing Pro", "employees": 12, "revenue": "$800K", "transactions": "80/mes", "office": "Coworking space", "website": "marketingpro.net"}, {"name": "Innovation Labs", "employees": 28, "revenue": "$1.8M", "transactions": "120/mes", "office": "Parque tecnológico", "website": "innovationlabs.io"}], "question": "¿Cuál empresa es probablemente fantasma para lavar dinero?", "context": "Las empresas fantasma tienen ingresos desproporcionados vs empleados/infraestructura, alta actividad transaccional, y mínima presencia física.", "input_placeholder": "XXXXX es empresa fantasma", "input_hint": "💡 Pista: Compara ingresos vs empleados e infraestructura"}', '{"correct_answer": "Global Trading LLC es empresa fantasma", "explanation": "Global Trading LLC muestra todas las señales: $50M de ingresos con solo 2 empleados ($25M por empleado es irreal), 2000 transacciones mensuales (volumen sospechoso), solo casilla postal sin oficina real, y sin presencia web. Clásica empresa fantasma para mover dinero.", "valid_answers": ["Global Trading LLC", "Global Trading", "Global Trading LLC es empresa fantasma"]}', '["$50M ÷ 2 empleados = irreal", "Casilla postal = sin presencia física", "Alto volumen transaccional sospechoso"]', 300, 14, '2025-07-23 17:07:41.337555');
INSERT INTO public.exercises VALUES (18, 'Identificador de Valores Atípicos en Transacciones', 'Detecta transacciones que se desvían significativamente de los patrones normales.', 3, 20, 'data_cleaning', 'data_analysis', '{"transaction_data": [{"id": "T001", "amount": 2500, "time": "14:30", "location": "Banco Centro", "type": "withdrawal"}, {"id": "T002", "amount": 150, "time": "10:15", "location": "ATM Plaza", "type": "withdrawal"}, {"id": "T003", "amount": -50000, "time": "02:00", "location": "Online Transfer", "type": "transfer"}, {"id": "T004", "amount": 800, "time": "16:45", "location": "Banco Norte", "type": "deposit"}, {"id": "T005", "amount": 95000, "time": "23:59", "location": "ATM Aeropuerto", "type": "withdrawal"}, {"id": "T006", "amount": 320, "time": "12:20", "location": "Banco Sur", "type": "withdrawal"}], "question": "¿Qué transacciones son valores atípicos que requieren limpieza?", "context": "Los valores atípicos pueden ser: montos negativos incorrectos, cantidades excesivamente altas para el tipo de operación, o transacciones en horarios inusuales. Importante: Los ATMs tienen límites diarios de retiro (~$30,000) y no operan después de medianoche.", "input_placeholder": "XXXX y XXXX son valores atípicos", "input_hint": "💡 Pista: Busca montos negativos incorrectos y retiros que excedan límites físicos o temporales"}', '{"correct_answer": "T003 y T005 son valores atípicos", "explanation": "T003: monto negativo (-$50,000) en transferencia (debería ser positivo), además en horario inusual. T005: retiro de $95,000 en ATM es imposible (límite ~$30,000) y a las 23:59 cuando los ATMs suelen cerrar a las 23:00.", "valid_answers": ["T003 y T005", "T005 y T003", "T003, T005"]}', '["Montos negativos son sospechosos", "ATMs tienen límites de retiro", "Horarios nocturnos son inusuales"]', 240, 18, '2025-07-23 17:07:41.337555');
INSERT INTO public.exercises VALUES (19, 'Validador de Evidencia Digital Forense', 'Identifica evidencia digital corrompida o manipulada que no puede ser usada en juicio.', 3, 22, 'data_cleaning', 'text_input', '{"digital_evidence": [{"id": "EV001", "type": "Video", "hash": "abc123def456", "timestamp": "2023-06-15 14:30:22", "size": "2.1GB", "chain_custody": "Completa"}, {"id": "EV002", "type": "Documento", "hash": "corrupted", "timestamp": "2023-06-16 10:15:00", "size": "1.2MB", "chain_custody": "Incompleta"}, {"id": "EV003", "type": "Audio", "hash": "789ghi012jkl", "timestamp": "1990-01-01 00:00:00", "size": "500MB", "chain_custody": "Completa"}, {"id": "EV004", "type": "Imagen", "hash": "mno345pqr678", "timestamp": "2023-06-17 16:45:30", "size": "5MB", "chain_custody": "Completa"}, {"id": "EV005", "type": "Video", "hash": "stu901vwx234", "timestamp": "2023-06-18 09:20:15", "size": "0MB", "chain_custody": "Completa"}], "question": "¿Qué evidencias son inadmisibles por problemas de integridad?", "context": "La evidencia digital debe tener: hash válido (no corrupted), timestamp realista, tamaño coherente con el tipo de archivo, y cadena de custodia completa. Importante: Evidencia corrupta o con timestamps imposibles no es válida en juicio.", "input_placeholder": "XXXX, XXXX, XXXX son inadmisibles", "input_hint": "💡 Pista: Busca hashes corruptos, fechas imposibles, tamaños incorrectos y cadenas de custodia rotas"}', '{"correct_answer": "EV002, EV003, EV005 son inadmisibles", "explanation": "EV002: hash corrupted indica manipulación, cadena de custodia incompleta. EV003: timestamp de 1990 es imposible para evidencia de 2023. EV005: tamaño 0MB para un video indica archivo dañado o vacío.", "valid_answers": ["EV002, EV003, EV005", "EV003, EV002, EV005", "EV005, EV003, EV002"]}', '["Hash corrupted = evidencia manipulada", "Timestamps de 1990 son imposibles", "Videos de 0MB están vacíos"]', 240, 19, '2025-07-23 17:07:41.337555');
INSERT INTO public.exercises VALUES (2, 'Detector de Phishing Básico', 'Identifica cuál de estos emails es un intento de phishing.', 1, 10, 'cybersecurity', 'multiple_choice', '{"emails": [{"from": "banco@santander.com.ar", "subject": "Estado de cuenta", "url": "https://www.santander.com.ar/login"}, {"from": "seguridad@bancosantader.com", "subject": "Urgente: Verificar cuenta", "url": "http://santander-verificacion.tk/login"}, {"from": "noreply@mercadolibre.com.ar", "subject": "Compra confirmada", "url": "https://www.mercadolibre.com.ar/"}], "question": "¿Cuál email es phishing?", "options": ["Email 1", "Email 2", "Email 3"]}', '{"correct_answer": "Email 2", "explanation": "El Email 2 tiene dominio mal escrito (santader en lugar de santander), URL sospechosa (.tk) y HTTP en lugar de HTTPS.", "valid_answers": ["Email 2", "email 2", "2"]}', '["Revisa cuidadosamente los dominios", "Observa si usan HTTPS", "¿Hay errores de ortografía?"]', 180, 2, '2025-07-23 17:07:41.337555');
INSERT INTO public.exercises VALUES (21, 'Detector de Células Terroristas en Redes', 'Identifica la estructura y miembros clave de células terroristas mediante análisis de comunicaciones.', 4, 30, 'network_analysis', 'data_analysis', '{"communication_network": {"nodes": [{"id": "A", "role": "unknown", "contacts": 8, "encrypted_msgs": 45, "international_calls": 12}, {"id": "B", "role": "unknown", "contacts": 15, "encrypted_msgs": 120, "international_calls": 0}, {"id": "C", "role": "unknown", "contacts": 3, "encrypted_msgs": 8, "international_calls": 25}, {"id": "D", "role": "unknown", "contacts": 12, "encrypted_msgs": 80, "international_calls": 5}, {"id": "E", "role": "unknown", "contacts": 6, "encrypted_msgs": 30, "international_calls": 18}], "connections": [{"from": "A", "to": "C", "frequency": "daily"}, {"from": "A", "to": "E", "frequency": "weekly"}, {"from": "B", "to": "D", "frequency": "daily"}, {"from": "B", "to": "A", "frequency": "rare"}, {"from": "C", "to": "E", "frequency": "daily"}]}, "question": "¿Quién es el líder de la célula y cuáles son los operativos?", "context": "En células terroristas: el líder coordina internamente (muchos contactos locales, pocos internacionales), los operativos se comunican frecuentemente con el extranjero, y usan mucho cifrado. Importante: Llamadas internacionales frecuentes indican coordinación con otras células.", "input_placeholder": "Líder: X, Operativos: X, X", "input_hint": "💡 Pista: El líder tiene muchos contactos locales pero evita comunicación internacional. Los operativos tienen más llamadas al extranjero"}', '{"correct_answer": "Líder: B, Operativos: C, E", "explanation": "B es el líder: máximo número de contactos (15) y mensajes cifrados (120) pero cero llamadas internacionales para evitar detección. C y E son operativos: altas llamadas internacionales (25 y 18) para coordinación externa, comunicación diaria entre ellos.", "valid_answers": ["Líder: B, Operativos: C, E", "B líder, C y E operativos", "Leader B, ops C E"]}', '["Líder = muchos contactos locales, pocas internacionales", "Operativos = muchas llamadas al extranjero", "Comunicación diaria = coordinación activa"]', 300, 21, '2025-07-23 17:07:41.337555');
INSERT INTO public.exercises VALUES (13, 'Identificador de Cuentas Bot en Redes Sociales', 'Identifica las cuentas bot analizando patrones de comportamiento.', 2, 15, 'pattern_detection', 'text_input', '{"accounts": [{"username": "@maria_lopez23", "followers": 523, "following": 489, "posts": 145, "created": "2019-03-15", "activity": "Variable, 2-5 posts/semana"}, {"username": "@crypto_master_9827", "followers": 50000, "following": 2, "posts": 5000, "created": "2024-01-01", "activity": "100 posts/día, 24/7"}, {"username": "@juan_tech", "followers": 1200, "following": 890, "posts": 320, "created": "2020-06-10", "activity": "Regular, horario laboral"}, {"username": "@sexy_girl_4295", "followers": 25000, "following": 0, "posts": 3000, "created": "2024-01-15", "activity": "50 posts/día, idénticos"}, {"username": "@carlos_photo", "followers": 2100, "following": 1900, "posts": 567, "created": "2018-11-20", "activity": "Fines de semana principalmente"}], "question": "¿Qué cuentas son bots?", "context": "Los bots suelen tener actividad 24/7, nombres genéricos con números, ratio anormal de followers/following, y contenido repetitivo.", "input_placeholder": "XXXXXXX y XXXXXXX son bots", "input_hint": "💡 Pista: Busca actividad no humana y ratios sospechosos"}', '{"correct_answer": "@crypto_master_9827 y @sexy_girl_4295 son bots", "explanation": "Ambas cuentas muestran patrones de bot claros: actividad 24/7 imposible para humanos, nombres genéricos con números aleatorios, ratios anormales (50k followers/2 following), creación reciente pero miles de posts, y contenido repetitivo.", "valid_answers": ["@crypto_master_9827 y @sexy_girl_4295", "crypto_master_9827 y sexy_girl_4295", "@crypto_master_9827, @sexy_girl_4295"]}', '["100 posts/día es inhumano", "Nombres con números aleatorios", "Pocos following, muchos followers = bot"]', 180, 13, '2025-07-23 17:07:41.337555');
INSERT INTO public.exercises VALUES (15, 'Validador de Integridad de Datos Temporales', 'Identifica registros con fechas inconsistentes o imposibles en esta base de datos criminal.', 2, 12, 'data_cleaning', 'text_input', '{"criminal_records": [{"id": "CR001", "arrest_date": "2023-03-15", "birth_date": "1985-07-22", "crime_date": "2023-03-10", "sentence_date": "2023-04-20"}, {"id": "CR002", "arrest_date": "2023-06-08", "birth_date": "2005-11-30", "crime_date": "2023-06-01", "sentence_date": "2023-02-15"}, {"id": "CR003", "arrest_date": "2023-01-20", "birth_date": "1990-05-18", "crime_date": "2023-01-18", "sentence_date": "2023-03-05"}, {"id": "CR004", "arrest_date": "2023-09-12", "birth_date": "1988-12-03", "crime_date": "2025-09-10", "sentence_date": "2023-11-30"}], "question": "¿Qué registros tienen fechas inconsistentes o imposibles?", "context": "Analiza la secuencia lógica: fecha de nacimiento < fecha del crimen < fecha de arresto < fecha de sentencia. Importante: Los menores de 18 años no pueden ser procesados como adultos sin casos especiales.", "input_placeholder": "XXXX y XXXX tienen fechas inconsistentes", "input_hint": "💡 Pista: Verifica que las fechas sigan un orden lógico y que no haya fechas futuras o menores procesados incorrectamente"}', '{"correct_answer": "CR002 y CR004 tienen fechas inconsistentes", "explanation": "CR002: fecha de sentencia (feb 2023) es anterior al arresto (jun 2023), y el sospechoso tenía 17 años al momento del crimen. CR004: fecha del crimen (sep 2025) es en el futuro, lo cual es imposible.", "valid_answers": ["CR002 y CR004", "CR002, CR004", "CR004 y CR002"]}', '["Verifica el orden cronológico", "¿Puede sentenciarse antes del arresto?", "¿Las fechas futuras son posibles?"]', 180, 15, '2025-07-23 17:07:41.337555');
INSERT INTO public.exercises VALUES (17, 'Normalizador de Datos de Comunicación', 'Identifica y estandariza formatos incorrectos en datos de contacto de sospechosos.', 2, 15, 'data_cleaning', 'text_input', '{"contacts": [{"id": "C001", "email": "juan.perez@gmail.com", "phone": "+54-11-1234-5678", "name": "Juan Pérez"}, {"id": "C002", "email": "MARIA.GONZALEZ@HOTMAIL.COM", "phone": "11-8765-4321", "name": "maria gonzalez"}, {"id": "C003", "email": "carlos@company", "phone": "541156781234", "name": "Carlos R."}, {"id": "C004", "email": "ana.lopez@yahoo.com.ar", "phone": "+54 9 11 2233-4455", "name": "Ana López"}, {"id": "C005", "email": "pedro123", "phone": "15-6677-8899", "name": "PEDRO MARTINEZ"}], "question": "¿Qué registros requieren normalización de formato?", "context": "Formato estándar: emails en minúsculas con dominio completo, teléfonos con código de país +54, nombres con capitalización correcta. Importante: Emails sin dominio completo y nombres mal capitalizados son errores comunes.", "input_placeholder": "XXXX, XXXX, XXXX necesitan normalización", "input_hint": "💡 Pista: Busca emails sin dominio, teléfonos sin +54, y nombres mal capitalizados"}', '{"correct_answer": "C002, C003, C005 necesitan normalización", "explanation": "C002: email en mayúsculas, teléfono sin +54, nombre en minúsculas. C003: email sin dominio completo (.com/.org), teléfono sin formato estándar. C005: email sin @ ni dominio, teléfono sin +54, nombre en mayúsculas.", "valid_answers": ["C002, C003, C005", "C003, C002, C005", "C005, C003, C002"]}', '["Emails deben tener dominio completo", "Teléfonos argentinos usan +54", "Nombres usan capitalización correcta"]', 180, 17, '2025-07-23 17:07:41.337555');
INSERT INTO public.exercises VALUES (20, 'Corrector de Formatos de Base de Datos Criminal', 'Estandariza datos inconsistentes de arrestos para generar reportes uniformes.', 2, 16, 'data_cleaning', 'text_input', '{"arrest_records": [{"id": "AR001", "name": "JUAN CARLOS PEREZ", "age": "25 años", "crime": "robo", "date": "15/03/2023", "location": "CABA"}, {"id": "AR002", "name": "maria rodriguez", "age": "thirty-two", "crime": "FRAUDE", "date": "2023-03-20", "location": "Buenos Aires"}, {"id": "AR003", "name": "Carlos López", "age": "28", "crime": "Estafa", "date": "03/22/2023", "location": "Córdoba"}, {"id": "AR004", "name": "ANA MARTINEZ", "age": "cuarenta y cinco", "crime": "lavado de dinero", "date": "2023/03/25", "location": "rosario"}, {"id": "AR005", "name": "Pedro Gonzalez", "age": "35", "crime": "Robo", "date": "28-03-2023", "location": "Mendoza"}], "question": "¿Qué registros necesitan corrección de formato?", "context": "Formato estándar: nombres con capitalización correcta (Primera Letra), edad en números, crímenes en minúsculas, fechas YYYY-MM-DD, ubicaciones con primera letra mayúscula. Importante: Los reportes oficiales requieren formatos uniformes.", "input_placeholder": "XXXX, XXXX, XXXX requieren corrección", "input_hint": "💡 Pista: Busca nombres mal capitalizados, edades en texto, crímenes en mayúsculas y fechas en formato incorrecto"}', '{"correct_answer": "AR001, AR002, AR004 requieren corrección", "explanation": "AR001: nombre en mayúsculas, edad con palabra años, crimen en minúsculas correcto, fecha formato incorrecto. AR002: nombre en minúsculas, edad en texto, crimen en mayúsculas. AR004: nombre en mayúsculas, edad en texto, ubicación en minúsculas.", "valid_answers": ["AR001, AR002, AR004", "AR002, AR001, AR004", "AR004, AR002, AR001"]}', '["Nombres: Primera Letra mayúscula", "Edades: solo números", "Fechas: YYYY-MM-DD"]', 180, 20, '2025-07-23 17:07:41.337555');
INSERT INTO public.exercises VALUES (10, 'Detector de Comportamiento Anómalo en Cajeros', 'Analiza los retiros de cajero automático y detecta comportamiento sospechoso.', 3, 20, 'fraud_detection', 'text_input', '{"atm_withdrawals": [{"card": "****1234", "time": "02:15", "amount": "$200", "location": "ATM Centro"}, {"card": "****1234", "time": "02:18", "amount": "$200", "location": "ATM Plaza Norte (15km)"}, {"card": "****5678", "time": "14:00", "amount": "$100", "location": "ATM Banco Sur"}, {"card": "****1234", "time": "02:22", "amount": "$200", "location": "ATM Aeropuerto (25km)"}, {"card": "****9012", "time": "10:30", "amount": "$50", "location": "ATM Mall"}], "question": "¿Qué tarjeta muestra comportamiento fraudulento?", "context": "Considera tiempo, distancia y patrones de retiro. Un cajero promedio permite caminar 1km en 15 minutos.", "input_placeholder": "Tarjeta ****XXXX clonada", "input_hint": "💡 Pista: Busca retiros imposibles por tiempo/distancia"}', '{"correct_answer": "Tarjeta ****1234 clonada", "explanation": "La tarjeta ****1234 realizó 3 retiros en 7 minutos en ubicaciones separadas por 15-25km, lo cual es físicamente imposible. Esto indica que la tarjeta fue clonada y usada simultáneamente.", "valid_answers": ["****1234", "1234", "Tarjeta ****1234"]}', '["Calcula tiempo entre retiros", "¿Es posible viajar tan rápido?", "Múltiples retiros rápidos = señal de alerta"]', 240, 10, '2025-07-23 17:07:41.337555');
INSERT INTO public.exercises VALUES (12, 'Análisis de Patrones de Compras Fraudulentas', 'Detecta el patrón de fraude en estas transacciones de e-commerce.', 3, 18, 'fraud_detection', 'data_analysis', '{"purchases": [{"order": "ORD-001", "items": "iPhone 14", "shipping": "Dirección A", "billing": "Dirección A", "amount": "$999"}, {"order": "ORD-002", "items": "10x Gift Cards $100", "shipping": "Email", "billing": "Dirección B", "amount": "$1000"}, {"order": "ORD-003", "items": "Laptop Dell", "shipping": "Dirección C", "billing": "Dirección C", "amount": "$1200"}, {"order": "ORD-004", "items": "5x Gift Cards $200", "shipping": "Email", "billing": "Dirección D", "amount": "$1000"}, {"order": "ORD-005", "items": "Samsung TV", "shipping": "Dirección E", "billing": "Dirección E", "amount": "$800"}], "question": "¿Qué órdenes son probablemente fraudulentas?", "context": "Los fraudsters prefieren items fáciles de revender y evitan envíos físicos rastreables.", "input_placeholder": "XXX-XXX y XXX-XXX fraudulentas", "input_hint": "💡 Pista: Gift cards + envío digital = señal de alerta"}', '{"correct_answer": "ORD-002 y ORD-004 fraudulentas", "explanation": "ORD-002 y ORD-004 compran exclusivamente gift cards (fáciles de monetizar) con envío por email (no rastreable) y direcciones de facturación diferentes. Este es un patrón clásico de fraude con tarjetas robadas.", "valid_answers": ["ORD-002 y ORD-004", "ORD-002, ORD-004", "002 y 004"]}', '["Gift cards = dinero casi efectivo", "Email shipping = no rastreable", "Direcciones diferentes = señal de alerta"]', 240, 12, '2025-07-23 17:07:41.337555');
INSERT INTO public.exercises VALUES (22, 'Identificador de Modus Operandi Criminal', 'Analiza patrones de crímenes para identificar si fueron cometidos por el mismo delincuente.', 3, 25, 'pattern_detection', 'data_analysis', '{"crime_scenes": [{"id": "CS001", "crime": "Robo a casa", "method": "Ventana forzada", "time": "03:00", "items": "Joyas, efectivo", "evidence": "Guantes latex, herramientas"}, {"id": "CS002", "crime": "Robo a oficina", "method": "Puerta principal", "time": "14:30", "items": "Computadoras", "evidence": "Huellas dactilares, cámara"}, {"id": "CS003", "crime": "Robo a casa", "method": "Ventana forzada", "time": "02:45", "items": "Joyas, efectivo, medicamentos", "evidence": "Guantes latex, herramientas idénticas"}, {"id": "CS004", "crime": "Robo vehicular", "method": "Forzar cerradura", "time": "04:15", "items": "Auto completo", "evidence": "Sin guantes, huellas"}, {"id": "CS005", "crime": "Robo a casa", "method": "Ventana forzada", "time": "03:30", "items": "Joyas, efectivo", "evidence": "Guantes latex, mismas herramientas"}], "question": "¿Qué crímenes fueron cometidos por el mismo delincuente?", "context": "El modus operandi incluye: método de entrada, horario preferido, tipo de objetos robados, y evidencia dejada. Los criminales seriales mantienen patrones consistentes. Importante: Mismas herramientas y métodos indican el mismo perpetrador.", "input_placeholder": "XXXX, XXXX, XXXX mismo delincuente", "input_hint": "💡 Pista: Busca patrones en método, horario, objetivos y evidencia. Los profesionales mantienen rutinas"}', '{"correct_answer": "CS001, CS003, CS005 mismo delincuente", "explanation": "Los tres crímenes muestran el mismo modus operandi: robo a casas por ventana forzada, horario nocturno (02:45-03:30), objetivo joyas y efectivo, uso de guantes latex y las mismas herramientas. CS002 y CS004 tienen métodos y evidencia diferentes.", "valid_answers": ["CS001, CS003, CS005", "CS003, CS001, CS005", "CS005, CS003, CS001"]}', '["Mismo método = mismo criminal", "Horarios similares = patrón", "Mismas herramientas = misma persona"]', 240, 22, '2025-07-23 17:07:41.337555');
INSERT INTO public.exercises VALUES (11, 'Rastreador de NFTs Robados', 'Sigue el rastro de un NFT robado a través de múltiples transferencias.', 4, 25, 'blockchain_analysis', 'text_input', '{"nft_transfers": [{"from": "CoolApe.eth", "to": "0x7B9A", "timestamp": "2024-01-15 10:00", "note": "Wallet hackeada reportada"}, {"from": "0x7B9A", "to": "0x3E4F", "timestamp": "2024-01-15 10:30", "price": "0.1 ETH"}, {"from": "0x3E4F", "to": "AnonBuyer.eth", "timestamp": "2024-01-15 11:00", "price": "2.5 ETH"}, {"from": "0x7B9A", "to": "0x9C2D", "timestamp": "2024-01-15 10:45", "note": "Otro NFT robado"}], "question": "¿Dónde terminó el NFT robado de CoolApe.eth?", "context": "Los ladrones suelen vender NFTs robados rápidamente a precios muy bajos para deshacerse de ellos.", "input_placeholder": "NFT en wallet XXXXXXXXX", "input_hint": "💡 Pista: Sigue las transferencias desde la wallet hackeada"}', '{"correct_answer": "NFT en wallet AnonBuyer.eth", "explanation": "El NFT fue transferido de CoolApe.eth (hackeada) → 0x7B9A (ladrón) → 0x3E4F (intermediario) → AnonBuyer.eth. El precio sospechosamente bajo (0.1 ETH) en la primera venta indica lavado del NFT robado.", "valid_answers": ["AnonBuyer.eth", "AnonBuyer", "wallet AnonBuyer.eth"]}', '["Sigue la cadena de transferencias", "El precio bajo indica venta rápida", "El comprador final puede no saber que es robado"]', 300, 11, '2025-07-23 17:07:41.337555');
INSERT INTO public.exercises VALUES (23, 'Analizador de Secuencias de Crímenes Organizados', 'Identifica la progresión lógica en crímenes de organizaciones para predecir el próximo movimiento.', 4, 28, 'pattern_detection', 'data_analysis', '{"crime_sequence": [{"order": 1, "date": "2023-01-15", "crime": "Robo de identidades", "target": "Base de datos civil", "purpose": "Obtener documentos falsos"}, {"order": 2, "date": "2023-02-20", "crime": "Lavado de dinero", "target": "Casas de cambio", "purpose": "Limpiar fondos iniciales"}, {"order": 3, "date": "2023-03-10", "crime": "Tráfico de armas", "target": "Puerto comercial", "purpose": "Armamento para operaciones"}, {"order": 4, "date": "2023-04-05", "crime": "Secuestro express", "target": "Empresarios locales", "purpose": "Obtener fondos rápidos"}, {"order": 5, "date": "2023-05-01", "crime": "Hackeo bancario", "target": "Bancos regionales", "purpose": "Acceso a cuentas grandes"}], "next_targets": ["Aeropuerto internacional", "Centro gubernamental", "Banco central", "Puerto petrolero"], "question": "¿Cuál será el próximo objetivo lógico de la organización?", "context": "Las organizaciones criminales siguen escalas progresivas: primero obtienen recursos (identidades, dinero, armas), luego ejecutan crímenes mayores, finalmente apuntan a objetivos de alto valor. Importante: Cada crimen prepara el siguiente en complejidad y valor.", "input_placeholder": "Próximo objetivo: XXXXXXX", "input_hint": "💡 Pista: Han escalado de robos simples a hackeos. ¿Qué objetivo requiere toda la preparación anterior y representa el máximo valor?"}', '{"correct_answer": "Próximo objetivo: Banco central", "explanation": "La secuencia muestra escalamiento progresivo: identidades falsas → dinero lavado → armas → fondos rápidos → acceso bancario. El banco central es la progresión lógica: requiere todas las capacidades anteriores (documentos, financiamiento, armamento, experiencia bancaria) y representa el objetivo de máximo valor.", "valid_answers": ["Banco central", "banco central", "Próximo objetivo: Banco central"]}', '["Cada crimen prepara el siguiente", "Escalamiento progresivo de valor", "Banco central = objetivo final lógico"]', 300, 23, '2025-07-23 17:07:41.337555');
INSERT INTO public.exercises VALUES (24, 'Limpieza de Base de Datos de Investigación Criminal', 'Se ha recuperado una base de datos corrupta de una operación criminal internacional. Los datos contienen información sobre transacciones financieras sospechosas, pero están llenos de errores, duplicados y formatos inconsistentes. Tu misión es limpiar estos datos para identificar patrones criminales.', 4, 40, 'data_cleaning', 'multiple_choice', '{
        "context": "Se ha recuperado una base de datos corrupta de una operación criminal internacional. Los datos contienen información sobre transacciones financieras sospechosas. Después de aplicar técnicas de limpieza de datos, necesitas identificar el patrón correcto.",
        "dataset_sample": [
            {"id": "TX001", "fecha": "2024-01-15", "monto": "$12,500.00", "origen": "John.Doe@email.com", "destino": "ACC-12345"},
            {"id": "TX002", "fecha": "15/01/2024", "monto": "12500", "origen": "john.doe@email.com", "destino": "ACC-12345"},
            {"id": "TX007", "fecha": "2024-01-18T10:30:00", "monto": "GBP 15,000", "origen": "offshore_acc_99", "destino": "ACC-22222"},
            {"id": "TX007_DUP", "fecha": "18/01/2024 10:30", "monto": "£15000.00", "origen": "OFFSHORE99", "destino": "ACC22222"},
            {"id": "TX015", "fecha": "24-01-2024", "monto": "$75,000", "origen": "suspicious_entity_01", "destino": "ACC-77777"},
            {"id": "TX015_RETRY", "fecha": "2024-01-24", "monto": "75000 USD", "origen": "suspicious01@darkweb.onion", "destino": "ACC77777"}
        ],
        "question": "Después de limpiar y analizar la base de datos completa de 16 registros, ¿cuál es el resumen correcto de los hallazgos?",
        "options": [
            {
                "id": "A",
                "text": "14 transacciones válidas, 3 duplicados, monto total: $687,845.64 USD, cuentas sospechosas: ACC-12345, ACC-77777, ACC-11111"
            },
            {
                "id": "B", 
                "text": "15 transacciones válidas, 2 duplicados, monto total: $543,210.50 USD, cuentas sospechosas: ACC-12345, ACC-67890"
            },
            {
                "id": "C",
                "text": "13 transacciones válidas, 4 duplicados, monto total: $725,000.00 USD, cuentas sospechosas: ACC-22222, ACC-33333, ACC-44444"
            },
            {
                "id": "D",
                "text": "16 transacciones válidas, 0 duplicados, monto total: $812,500.75 USD, todas las cuentas son legítimas"
            },
            {
                "id": "E",
                "text": "12 transacciones válidas, 5 duplicados, monto total: $498,765.32 USD, cuentas sospechosas: ACC-11111, ACC-55555"
            },
            {
                "id": "F",
                "text": "14 transacciones válidas, 3 duplicados, monto total: $580,000.00 USD, cuentas sospechosas: ACC-66666, ACC-77777"
            }
        ],
        "data_hints": [
            "TX001 y TX002 son la misma transacción con diferentes formatos",
            "TX007 y TX007_DUP son duplicados evidentes", 
            "TX015 y TX015_RETRY son intentos de la misma transacción",
            "Hay 1 registro completamente corrupto (CORRUPTED_011)",
            "Las cuentas que reciben múltiples transacciones o desde fuentes sospechosas son de alto riesgo"
        ]
    }', '{
        "correct_answer": "A",
        "explanation": "Después de limpiar los datos: 16 registros originales - 3 duplicados - 1 corrupto = 14 transacciones válidas. El monto total convertido a USD es $687,845.64. Las cuentas de alto riesgo son ACC-12345 (recibe múltiples transacciones), ACC-77777 (vinculada a entidades sospechosas) y ACC-11111 (involucrada en transacciones de criptomonedas).",
        "key_findings": {
            "valid_transactions": 14,
            "duplicates": 3,
            "corrupted": 1,
            "total_usd": 687845.64,
            "high_risk_accounts": ["ACC-12345", "ACC-77777", "ACC-11111"]
        }
    }', '[
        "Comienza identificando los diferentes formatos de fecha y crea una función de normalización",
        "Para las monedas, busca patrones como símbolos ($, €, £), códigos (USD, EUR) y formatos numéricos",
        "Los duplicados pueden tener IDs similares (TX007 y TX007_DUP) o los mismos datos con formatos diferentes"
    ]', 300, 24, '2025-07-24 12:55:32.592469');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: cyberdetective
--

INSERT INTO public.users VALUES (1, 'testuser', 'ivan.agustin.95@gmail.com', '$2b$10$2F7fKZqIHGU3vqHtK48wvuYcPUBMAbTjR7EY63ky1LuhCTFY13Skm', 'Usuario de Prueba', NULL, 57, 1, '2025-07-23 17:19:27.409639', '2025-07-24 13:07:01.603434');
INSERT INTO public.users VALUES (2, 'Ivan Zarate', 'zarate.ivan.agustin@gmail.com', '$2b$10$8Y9MAklKl3pRuZXmc4SscuRRb.3C/EBpCmSWc2EHCaHjeEUo3yvGi', 'Ivan Agustin Zarate', NULL, 0, 1, '2025-07-24 13:27:39.574924', '2025-07-24 13:27:39.574924');


--
-- Data for Name: exercise_attempts; Type: TABLE DATA; Schema: public; Owner: cyberdetective
--

INSERT INTO public.exercise_attempts VALUES (1, 1, 24, '2025-07-24 13:05:46.350941', '2025-07-24 13:05:46.350941', true, 48, 17, 0, 'A');
INSERT INTO public.exercise_attempts VALUES (2, 1, 1, '2025-07-24 13:07:01.595527', '2025-07-24 13:07:01.595527', true, 9, 6, 0, 'Fecha');


--
-- Data for Name: game_reset_tokens; Type: TABLE DATA; Schema: public; Owner: cyberdetective
--



--
-- Data for Name: game_state; Type: TABLE DATA; Schema: public; Owner: cyberdetective
--

INSERT INTO public.game_state VALUES (1, 0, NULL, NULL, '2025-07-24 13:11:10.396734', '2025-07-24 13:22:22.611654', false);


--
-- Data for Name: leaderboard; Type: TABLE DATA; Schema: public; Owner: cyberdetective
--

INSERT INTO public.leaderboard VALUES (1, 1, 57, 2, 12, 1, '2025-07-24 13:27:46.944275');
INSERT INTO public.leaderboard VALUES (4, 2, 0, 0, NULL, 2, '2025-07-24 13:27:46.944275');


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: cyberdetective
--



--
-- Data for Name: team_exercise_attempts; Type: TABLE DATA; Schema: public; Owner: cyberdetective
--



--
-- Data for Name: team_invitations; Type: TABLE DATA; Schema: public; Owner: cyberdetective
--



--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: cyberdetective
--



--
-- Data for Name: user_badges; Type: TABLE DATA; Schema: public; Owner: cyberdetective
--



--
-- Name: admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cyberdetective
--

SELECT pg_catalog.setval('public.admins_id_seq', 1, true);


--
-- Name: badges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cyberdetective
--

SELECT pg_catalog.setval('public.badges_id_seq', 5, true);


--
-- Name: exercise_attempts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cyberdetective
--

SELECT pg_catalog.setval('public.exercise_attempts_id_seq', 2, true);


--
-- Name: exercises_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cyberdetective
--

SELECT pg_catalog.setval('public.exercises_id_seq', 24, true);


--
-- Name: game_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cyberdetective
--

SELECT pg_catalog.setval('public.game_reset_tokens_id_seq', 1, false);


--
-- Name: game_state_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cyberdetective
--

SELECT pg_catalog.setval('public.game_state_id_seq', 1, true);


--
-- Name: leaderboard_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cyberdetective
--

SELECT pg_catalog.setval('public.leaderboard_id_seq', 4, true);


--
-- Name: team_exercise_attempts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cyberdetective
--

SELECT pg_catalog.setval('public.team_exercise_attempts_id_seq', 1, false);


--
-- Name: team_invitations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cyberdetective
--

SELECT pg_catalog.setval('public.team_invitations_id_seq', 1, false);


--
-- Name: team_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cyberdetective
--

SELECT pg_catalog.setval('public.team_members_id_seq', 1, false);


--
-- Name: teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cyberdetective
--

SELECT pg_catalog.setval('public.teams_id_seq', 1, false);


--
-- Name: user_badges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cyberdetective
--

SELECT pg_catalog.setval('public.user_badges_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cyberdetective
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- PostgreSQL database dump complete
--

