-- =====================================================================
--  Habilitar a los 5 técnicos como administradores del panel
--  Se puede ejecutar varias veces sin problema.
--  Las cuentas que aún no se han registrado simplemente no se afectan;
--  cuando se registren, vuelve a ejecutar este script.
-- =====================================================================
USE soporte_tickets;

-- 1) Dar rol de técnico/administrador (busca por la parte antes del @,
--    así no importa si el dominio se escribió con algún error de tipeo)
UPDATE usuarios
SET rol = 'tecnico'
WHERE correo LIKE 'alan.sastre@%'
   OR correo LIKE 'fabian.trillos@%'
   OR correo LIKE 'maria.mateus@%'
   OR correo LIKE 'andres.matiz@%'
   OR correo LIKE 'ivan.serrato@%'
   OR correo LIKE 'iavn.serrato@%';

-- 2) Verificar el resultado (deben salir los 5 con rol = tecnico)
SELECT id, nombre, correo, rol FROM usuarios ORDER BY rol, nombre;
