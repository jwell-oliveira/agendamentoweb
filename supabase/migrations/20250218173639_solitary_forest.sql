/*
  # Criar tabela de agendamentos

  1. Nova Tabela
    - `appointments`
      - `id` (uuid, chave primária)
      - `service_id` (texto, referência ao serviço)
      - `date` (data do agendamento)
      - `time` (hora do agendamento)
      - `client_name` (nome do cliente)
      - `client_email` (email do cliente)
      - `client_phone` (telefone do cliente)
      - `status` (status do agendamento: confirmado, pendente, cancelado)
      - `created_at` (data de criação do registro)
      - `user_id` (uuid, referência ao usuário autenticado)

  2. Segurança
    - Habilitar RLS na tabela `appointments`
    - Adicionar políticas para:
      - Clientes visualizarem apenas seus próprios agendamentos
      - Administradores visualizarem todos os agendamentos
*/

CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id text NOT NULL,
  date date NOT NULL,
  time time NOT NULL,
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text NOT NULL,
  status text NOT NULL DEFAULT 'pendente',
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados verem seus próprios agendamentos
CREATE POLICY "Usuários podem ver seus próprios agendamentos"
ON appointments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Política para usuários autenticados criarem agendamentos
CREATE POLICY "Usuários podem criar agendamentos"
ON appointments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Política para administradores verem todos os agendamentos
CREATE POLICY "Administradores podem ver todos os agendamentos"
ON appointments
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email LIKE '%@admin.com'
  )
);