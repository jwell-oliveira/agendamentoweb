/*
  # Correção das políticas de permissão

  1. Alterações
    - Remoção das políticas existentes com CASCADE
    - Remoção da coluna user_id com CASCADE
    - Criação de novas políticas de acesso
  
  2. Segurança
    - Permitir inserções públicas para agendamentos
    - Restringir visualização apenas para administradores
*/

-- Remover políticas existentes usando CASCADE
DROP POLICY IF EXISTS "Usuários podem ver seus próprios agendamentos" ON appointments CASCADE;
DROP POLICY IF EXISTS "Usuários podem criar agendamentos" ON appointments CASCADE;
DROP POLICY IF EXISTS "Administradores podem ver todos os agendamentos" ON appointments CASCADE;

-- Remover a coluna user_id com CASCADE
ALTER TABLE appointments DROP COLUMN IF EXISTS user_id CASCADE;

-- Criar nova política para permitir inserções públicas
CREATE POLICY "Permitir inserções públicas"
ON appointments
FOR INSERT
TO public
WITH CHECK (true);

-- Criar política para administradores visualizarem todos os agendamentos
CREATE POLICY "Administradores podem ver e gerenciar agendamentos"
ON appointments
FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'email' LIKE '%@admin.com'
);