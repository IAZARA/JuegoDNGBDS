-- Insertar usuario administrador
INSERT INTO admins (username, password_hash, name, email, is_super_admin)
VALUES (
    'ivan.zarate',
    '$2b$10$Obf5frqljR3QrVtxM4eFpetxrOsw6aM.FAPsZt/4ACJb6sLsl8Mee',
    'Ivan Zarate',
    'ivan.zarate@admin.com',
    true
);