-- Ejercicio 24: Limpieza de Datos Complejos de Investigación Criminal
INSERT INTO exercises (
    title,
    description,
    difficulty,
    points,
    category,
    type,
    time_limit,
    order_index,
    problem_data,
    solution_data,
    hints
) VALUES (
    'Limpieza de Base de Datos de Investigación Criminal',
    'Se ha recuperado una base de datos corrupta de una operación criminal internacional. Los datos contienen información sobre transacciones financieras sospechosas, pero están llenos de errores, duplicados y formatos inconsistentes. Tu misión es limpiar estos datos para identificar patrones criminales.',
    4, -- Difícil
    40,
    'data_cleaning',
    'data_cleaning_complex',
    600, -- 10 minutos
    24,
    '{
        "context": "Base de datos recuperada de servidores incautados en operación ''Hydra''. Contiene registros de transacciones financieras de los últimos 6 meses. Los datos están severamente corrompidos debido a intentos de destrucción de evidencia.",
        "dataset": [
            {"id": "TX001", "fecha": "2024-01-15", "monto": "$12,500.00", "origen": "John.Doe@email.com", "destino": "ACC-12345", "tipo": "TRANSFER", "estado": "completado"},
            {"id": "TX002", "fecha": "15/01/2024", "monto": "12500", "origen": "john.doe@email.com", "destino": "ACC-12345", "tipo": "TRANSF", "estado": "COMPLETED"},
            {"id": "TX003", "fecha": "2024-01-16", "monto": "€8,750.50", "origen": "jane_smith@corp.net", "destino": "ACC-67890", "tipo": "WIRE", "estado": "pending"},
            {"id": "TX004", "fecha": "16-01-24", "monto": "8750,5 EUR", "origen": "Jane.Smith@corp.net", "destino": "ACC67890", "tipo": "wire_transfer", "estado": "PENDIENTE"},
            {"id": "TX005", "fecha": "2024/01/17", "monto": "USD 25000", "origen": "crypto_wallet_1A2B3C", "destino": "ACC-11111", "tipo": "CRYPTO", "estado": "confirmed"},
            {"id": null, "fecha": "17.01.2024", "monto": "25,000.00", "origen": "1A2B3C", "destino": "ACC11111", "tipo": "cryptocurrency", "estado": "CONFIRMADO"},
            {"id": "TX007", "fecha": "2024-01-18T10:30:00", "monto": "GBP 15,000", "origen": "offshore_acc_99", "destino": "ACC-22222", "tipo": "SWIFT", "estado": "completed"},
            {"id": "TX007_DUP", "fecha": "18/01/2024 10:30", "monto": "£15000.00", "origen": "OFFSHORE99", "destino": "ACC22222", "tipo": "swift_transfer", "estado": "COMPLETADO"},
            {"id": "TX009", "fecha": "19-ENE-2024", "monto": "35000 dolares", "origen": "shell_company_xyz", "destino": "ACC-33333", "tipo": "TRANSFER", "estado": "failed"},
            {"id": "TX010", "fecha": "2024-01-20", "monto": "CHF 18500.75", "origen": "swiss_acc_007", "destino": "ACC-44444", "tipo": "INTERNATIONAL", "estado": "completado"},
            {"id": "CORRUPTED_011", "fecha": "ERROR_DATE", "monto": "ENCRYPTED", "origen": "unknown@[REDACTED]", "destino": "[DELETED]", "tipo": "UNKNOWN", "estado": "ERROR"},
            {"id": "TX012", "fecha": "2024-01-21", "monto": "¥1,250,000", "origen": "tokyo_branch@bank.jp", "destino": "ACC-55555", "tipo": "WIRE", "estado": "completed"},
            {"id": "TX013", "fecha": "22/01/2024", "monto": "BTC 0.75", "origen": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", "destino": "crypto_exchange_01", "tipo": "BLOCKCHAIN", "estado": "confirmed"},
            {"id": "TX-014", "fecha": "2024.01.23", "monto": "50000.00 USD", "origen": "phantom_llc@mail.com", "destino": "ACC-66666", "tipo": "transfer", "estado": "Completed"},
            {"id": "TX015", "fecha": "24-01-2024", "monto": "$75,000", "origen": "suspicious_entity_01", "destino": "ACC-77777", "tipo": "WIRE", "estado": "under_review"},
            {"id": "TX015_RETRY", "fecha": "2024-01-24", "monto": "75000 USD", "origen": "suspicious01@darkweb.onion", "destino": "ACC77777", "tipo": "wire_transfer", "estado": "UNDER INVESTIGATION"}
        ],
        "data_issues": [
            "Formatos de fecha inconsistentes",
            "Formatos de moneda y montos variables",
            "IDs duplicados y valores nulos",
            "Direcciones de email con diferentes formatos",
            "Números de cuenta con y sin guiones",
            "Estados en diferentes idiomas y formatos",
            "Tipos de transacción no estandarizados",
            "Registros completamente corruptos",
            "Duplicados con ligeras variaciones"
        ],
        "requirements": [
            "Identificar y consolidar transacciones duplicadas",
            "Estandarizar todos los formatos de fecha a ISO 8601",
            "Normalizar montos a formato numérico con moneda separada",
            "Limpiar y estandarizar direcciones de email",
            "Unificar formatos de números de cuenta",
            "Categorizar tipos de transacción en grupos estándar",
            "Identificar patrones sospechosos después de la limpieza",
            "Calcular el monto total involucrado en USD (usar tasas aproximadas)"
        ],
        "exchange_rates": {
            "EUR_USD": 1.08,
            "GBP_USD": 1.27,
            "CHF_USD": 1.13,
            "JPY_USD": 0.0067,
            "BTC_USD": 42000
        }
    }',
    '{
        "cleaned_data_count": 14,
        "duplicate_transactions_found": 3,
        "corrupted_records": 1,
        "total_amount_usd": 687845.64,
        "suspicious_patterns": [
            "Múltiples transacciones al mismo destino ACC-12345",
            "Transacciones desde cuentas offshore y entidades sospechosas",
            "Uso de criptomonedas para montos significativos",
            "Intentos de transacciones duplicadas con ligeras variaciones"
        ],
        "standardized_transaction_types": {
            "WIRE_TRANSFER": 7,
            "CRYPTOCURRENCY": 2,
            "STANDARD_TRANSFER": 4,
            "INTERNATIONAL": 1
        },
        "high_risk_accounts": ["ACC-12345", "ACC-77777", "ACC-11111"],
        "data_quality_score": 87.5
    }',
    '[
        "Comienza identificando los diferentes formatos de fecha y crea una función de normalización",
        "Para las monedas, busca patrones como símbolos ($, €, £), códigos (USD, EUR) y formatos numéricos",
        "Los duplicados pueden tener IDs similares (TX007 y TX007_DUP) o los mismos datos con formatos diferentes"
    ]'
);