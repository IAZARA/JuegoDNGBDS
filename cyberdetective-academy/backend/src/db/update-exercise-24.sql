-- Actualizar ejercicio 24 para formato de opción múltiple
UPDATE exercises 
SET 
    problem_data = '{
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
    }',
    solution_data = '{
        "correct_answer": "A",
        "explanation": "Después de limpiar los datos: 16 registros originales - 3 duplicados - 1 corrupto = 14 transacciones válidas. El monto total convertido a USD es $687,845.64. Las cuentas de alto riesgo son ACC-12345 (recibe múltiples transacciones), ACC-77777 (vinculada a entidades sospechosas) y ACC-11111 (involucrada en transacciones de criptomonedas).",
        "key_findings": {
            "valid_transactions": 14,
            "duplicates": 3,
            "corrupted": 1,
            "total_usd": 687845.64,
            "high_risk_accounts": ["ACC-12345", "ACC-77777", "ACC-11111"]
        }
    }'
WHERE id = 24;