-- Inserir UPAs
INSERT INTO upas (id, name, address, latitude, longitude, is_active, operating_hours, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Dinamerica', 'Av. Dinamérica Alves Correia, nº 1289', -7.245232, -35.9114377, true, '{"weekdays": "24 horas", "weekends": "24 horas"}', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440001', 'Alto Branco', 'Avenida Manoel Tavares - Alto Branco S.N', -7.1998982, -35.8773173, true, '{"weekdays": "06:00-22:00", "weekends": "08:00-20:00"}', NOW(), NOW());

-- Inserir tokens de autenticação
INSERT INTO auth_tokens (id, token, name, institution, is_active, permissions, created_at, updated_at)
VALUES
  ('660e8400-e29b-41d4-a716-446655440000', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluaXN0cmFkb3IiLCJpYXQiOjE1MTYyMzkwMjJ9.4Adcj3UFYzPUVaY9D0-8qj7k6nI0biY0QkLqJDK9ZQ', 'Token Admin', 'Secretaria de Saúde', true, '{"READ", "WRITE", "ADMIN"}', NOW(), NOW()),
  ('660e8400-e29b-41d4-a716-446655440001', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik1vbml0b3IiLCJpYXQiOjE1MTYyMzkwMjJ9.4Adcj3UFYzPUVaY9D0-8qj7k6nI0biY0QkLqJDK9ZR', 'Token Monitor', 'UPA Dinamerica', true, '{"READ"}', NOW(), NOW());

-- Pacientes na UPA Dinamerica (alguns completos, outros em triagem, outros em atendimento)
INSERT INTO patient_status (id, patient_id, upa_id, bairro, status, classificacao, entrada_timestamp, triagem_timestamp, atendimento_timestamp, created_at, updated_at)
VALUES
  -- Completos
  ('770e8400-e29b-41d4-a716-446655440000', 'P001', '550e8400-e29b-41d4-a716-446655440000', 'Centro', 'COMPLETED', 'VERDE', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours 50 minutes', NOW() - INTERVAL '1 hour', NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440001', 'P002', '550e8400-e29b-41d4-a716-446655440000', 'Jardim Tavares', 'COMPLETED', 'VERMELHO', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 45 minutes', NOW() - INTERVAL '30 minutes', NOW(), NOW()),
  
  -- Aguardando atendimento
  ('770e8400-e29b-41d4-a716-446655440002', 'P003', '550e8400-e29b-41d4-a716-446655440000', 'Bancários', 'WAITING_CARE', 'AMARELO', NOW() - INTERVAL '1 hour 30 minutes', NOW() - INTERVAL '1 hour 15 minutes', NULL, NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440003', 'P004', '550e8400-e29b-41d4-a716-446655440000', 'Centro', 'WAITING_CARE', 'VERMELHO', NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '30 minutes', NULL, NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440004', 'P005', '550e8400-e29b-41d4-a716-446655440000', 'Bancários', 'WAITING_CARE', 'AZUL', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '50 minutes', NULL, NOW(), NOW()),
  
  -- Aguardando triagem
  ('770e8400-e29b-41d4-a716-446655440005', 'P006', '550e8400-e29b-41d4-a716-446655440000', 'Jardim Tavares', 'WAITING_TRIAGE', NULL, NOW() - INTERVAL '20 minutes', NULL, NULL, NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440006', 'P007', '550e8400-e29b-41d4-a716-446655440000', 'Centro', 'WAITING_TRIAGE', NULL, NOW() - INTERVAL '15 minutes', NULL, NULL, NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440007', 'P008', '550e8400-e29b-41d4-a716-446655440000', 'Bancários', 'WAITING_TRIAGE', NULL, NOW() - INTERVAL '5 minutes', NULL, NULL, NOW(), NOW());

-- Pacientes na UPA Alto Branco
INSERT INTO patient_status (id, patient_id, upa_id, bairro, status, classificacao, entrada_timestamp, triagem_timestamp, atendimento_timestamp, created_at, updated_at)
VALUES
  -- Completos
  ('770e8400-e29b-41d4-a716-446655440008', 'P009', '550e8400-e29b-41d4-a716-446655440001', 'Alto Branco', 'COMPLETED', 'VERDE', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours 30 minutes', NOW() - INTERVAL '2 hours', NOW(), NOW()),
  
  -- Aguardando atendimento
  ('770e8400-e29b-41d4-a716-446655440009', 'P010', '550e8400-e29b-41d4-a716-446655440001', 'Alto Branco', 'WAITING_CARE', 'AMARELO', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 45 minutes', NULL, NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440010', 'P011', '550e8400-e29b-41d4-a716-446655440001', 'Jardim Continental', 'WAITING_CARE', 'VERDE', NOW() - INTERVAL '1 hour 15 minutes', NOW() - INTERVAL '1 hour', NULL, NOW(), NOW()),
  
  -- Aguardando triagem
  ('770e8400-e29b-41d4-a716-446655440011', 'P012', '550e8400-e29b-41d4-a716-446655440001', 'Alto Branco', 'WAITING_TRIAGE', NULL, NOW() - INTERVAL '30 minutes', NULL, NULL, NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440012', 'P013', '550e8400-e29b-41d4-a716-446655440001', 'Jardim Continental', 'WAITING_TRIAGE', NULL, NOW() - INTERVAL '10 minutes', NULL, NULL, NOW(), NOW());

-- Eventos para os pacientes da UPA Dinamerica
INSERT INTO patient_events (id, patient_id, upa_id, event_type, bairro, classificacao, timestamp, received_at, created_at)
VALUES
  -- Paciente P001 (completo)
  ('880e8400-e29b-41d4-a716-446655440000', 'P001', '550e8400-e29b-41d4-a716-446655440000', 'ENTRADA', 'Centro', NULL, NOW() - INTERVAL '3 hours', NOW(), NOW()),
  ('880e8400-e29b-41d4-a716-446655440001', 'P001', '550e8400-e29b-41d4-a716-446655440000', 'TRIAGEM', NULL, 'VERDE', NOW() - INTERVAL '2 hours 50 minutes', NOW(), NOW()),
  ('880e8400-e29b-41d4-a716-446655440002', 'P001', '550e8400-e29b-41d4-a716-446655440000', 'ATENDIMENTO', NULL, NULL, NOW() - INTERVAL '1 hour', NOW(), NOW()),
  
  -- Paciente P002 (completo)
  ('880e8400-e29b-41d4-a716-446655440003', 'P002', '550e8400-e29b-41d4-a716-446655440000', 'ENTRADA', 'Jardim Tavares', NULL, NOW() - INTERVAL '2 hours', NOW(), NOW()),
  ('880e8400-e29b-41d4-a716-446655440004', 'P002', '550e8400-e29b-41d4-a716-446655440000', 'TRIAGEM', NULL, 'VERMELHO', NOW() - INTERVAL '1 hour 45 minutes', NOW(), NOW()),
  ('880e8400-e29b-41d4-a716-446655440005', 'P002', '550e8400-e29b-41d4-a716-446655440000', 'ATENDIMENTO', NULL, NULL, NOW() - INTERVAL '30 minutes', NOW(), NOW()),
  
  -- Paciente P003 (aguardando atendimento)
  ('880e8400-e29b-41d4-a716-446655440006', 'P003', '550e8400-e29b-41d4-a716-446655440000', 'ENTRADA', 'Bancários', NULL, NOW() - INTERVAL '1 hour 30 minutes', NOW(), NOW()),
  ('880e8400-e29b-41d4-a716-446655440007', 'P003', '550e8400-e29b-41d4-a716-446655440000', 'TRIAGEM', NULL, 'AMARELO', NOW() - INTERVAL '1 hour 15 minutes', NOW(), NOW()),
  
  -- Paciente P004 (aguardando atendimento)
  ('880e8400-e29b-41d4-a716-446655440008', 'P004', '550e8400-e29b-41d4-a716-446655440000', 'ENTRADA', 'Centro', NULL, NOW() - INTERVAL '45 minutes', NOW(), NOW()),
  ('880e8400-e29b-41d4-a716-446655440009', 'P004', '550e8400-e29b-41d4-a716-446655440000', 'TRIAGEM', NULL, 'VERMELHO', NOW() - INTERVAL '30 minutes', NOW(), NOW()),
  
  -- Paciente P005 (aguardando atendimento)
  ('880e8400-e29b-41d4-a716-446655440010', 'P005', '550e8400-e29b-41d4-a716-446655440000', 'ENTRADA', 'Bancários', NULL, NOW() - INTERVAL '1 hour', NOW(), NOW()),
  ('880e8400-e29b-41d4-a716-446655440011', 'P005', '550e8400-e29b-41d4-a716-446655440000', 'TRIAGEM', NULL, 'AZUL', NOW() - INTERVAL '50 minutes', NOW(), NOW()),
  
  -- Paciente P006 (aguardando triagem)
  ('880e8400-e29b-41d4-a716-446655440012', 'P006', '550e8400-e29b-41d4-a716-446655440000', 'ENTRADA', 'Jardim Tavares', NULL, NOW() - INTERVAL '20 minutes', NOW(), NOW()),
  
  -- Paciente P007 (aguardando triagem)
  ('880e8400-e29b-41d4-a716-446655440013', 'P007', '550e8400-e29b-41d4-a716-446655440000', 'ENTRADA', 'Centro', NULL, NOW() - INTERVAL '15 minutes', NOW(), NOW()),
  
  -- Paciente P008 (aguardando triagem)
  ('880e8400-e29b-41d4-a716-446655440014', 'P008', '550e8400-e29b-41d4-a716-446655440000', 'ENTRADA', 'Bancários', NULL, NOW() - INTERVAL '5 minutes', NOW(), NOW());

-- Eventos para os pacientes da UPA Alto Branco
INSERT INTO patient_events (id, patient_id, upa_id, event_type, bairro, classificacao, timestamp, received_at, created_at)
VALUES
  -- Paciente P009 (completo)
  ('880e8400-e29b-41d4-a716-446655440015', 'P009', '550e8400-e29b-41d4-a716-446655440001', 'ENTRADA', 'Alto Branco', NULL, NOW() - INTERVAL '4 hours', NOW(), NOW()),
  ('880e8400-e29b-41d4-a716-446655440016', 'P009', '550e8400-e29b-41d4-a716-446655440001', 'TRIAGEM', NULL, 'VERDE', NOW() - INTERVAL '3 hours 30 minutes', NOW(), NOW()),
  ('880e8400-e29b-41d4-a716-446655440017', 'P009', '550e8400-e29b-41d4-a716-446655440001', 'ATENDIMENTO', NULL, NULL, NOW() - INTERVAL '2 hours', NOW(), NOW()),
  
  -- Paciente P010 (aguardando atendimento)
  ('880e8400-e29b-41d4-a716-446655440018', 'P010', '550e8400-e29b-41d4-a716-446655440001', 'ENTRADA', 'Alto Branco', NULL, NOW() - INTERVAL '2 hours', NOW(), NOW()),
  ('880e8400-e29b-41d4-a716-446655440019', 'P010', '550e8400-e29b-41d4-a716-446655440001', 'TRIAGEM', NULL, 'AMARELO', NOW() - INTERVAL '1 hour 45 minutes', NOW(), NOW()),
  
  -- Paciente P011 (aguardando atendimento)
  ('880e8400-e29b-41d4-a716-446655440020', 'P011', '550e8400-e29b-41d4-a716-446655440001', 'ENTRADA', 'Jardim Continental', NULL, NOW() - INTERVAL '1 hour 15 minutes', NOW(), NOW()),
  ('880e8400-e29b-41d4-a716-446655440021', 'P011', '550e8400-e29b-41d4-a716-446655440001', 'TRIAGEM', NULL, 'VERDE', NOW() - INTERVAL '1 hour', NOW(), NOW()),
  
  -- Paciente P012 (aguardando triagem)
  ('880e8400-e29b-41d4-a716-446655440022', 'P012', '550e8400-e29b-41d4-a716-446655440001', 'ENTRADA', 'Alto Branco', NULL, NOW() - INTERVAL '30 minutes', NOW(), NOW()),
  
  -- Paciente P013 (aguardando triagem)
  ('880e8400-e29b-41d4-a716-446655440023', 'P013', '550e8400-e29b-41d4-a716-446655440001', 'ENTRADA', 'Jardim Continental', NULL, NOW() - INTERVAL '10 minutes', NOW(), NOW());

-- Adicionar alguns eventos históricos para estatísticas
-- UPA Dinamerica - eventos antigos
INSERT INTO patient_events (id, patient_id, upa_id, event_type, bairro, classificacao, timestamp, received_at, created_at)
VALUES
  ('880e8400-e29b-41d4-a716-446655440024', 'P101', '550e8400-e29b-41d4-a716-446655440000', 'ENTRADA', 'Centro', NULL, NOW() - INTERVAL '2 days', NOW(), NOW()),
  ('880e8400-e29b-41d4-a716-446655440025', 'P101', '550e8400-e29b-41d4-a716-446655440000', 'TRIAGEM', NULL, 'VERMELHO', NOW() - INTERVAL '2 days' + INTERVAL '10 minutes', NOW(), NOW()),
  ('880e8400-e29b-41d4-a716-446655440026', 'P101', '550e8400-e29b-41d4-a716-446655440000', 'ATENDIMENTO', NULL, NULL, NOW() - INTERVAL '2 days' + INTERVAL '1 hour', NOW(), NOW()),
  
  ('880e8400-e29b-41d4-a716-446655440027', 'P102', '550e8400-e29b-41d4-a716-446655440000', 'ENTRADA', 'Bancários', NULL, NOW() - INTERVAL '1 day', NOW(), NOW()),
  ('880e8400-e29b-41d4-a716-446655440028', 'P102', '550e8400-e29b-41d4-a716-446655440000', 'TRIAGEM', NULL, 'AMARELO', NOW() - INTERVAL '1 day' + INTERVAL '15 minutes', NOW(), NOW()),
  ('880e8400-e29b-41d4-a716-446655440029', 'P102', '550e8400-e29b-41d4-a716-446655440000', 'ATENDIMENTO', NULL, NULL, NOW() - INTERVAL '1 day' + INTERVAL '1 hour 30 minutes', NOW(), NOW());

-- UPA Alto Branco - eventos antigos
INSERT INTO patient_events (id, patient_id, upa_id, event_type, bairro, classificacao, timestamp, received_at, created_at)
VALUES
  ('880e8400-e29b-41d4-a716-446655440030', 'P201', '550e8400-e29b-41d4-a716-446655440001', 'ENTRADA', 'Alto Branco', NULL, NOW() - INTERVAL '3 days', NOW(), NOW()),
  ('880e8400-e29b-41d4-a716-446655440031', 'P201', '550e8400-e29b-41d4-a716-446655440001', 'TRIAGEM', NULL, 'AZUL', NOW() - INTERVAL '3 days' + INTERVAL '20 minutes', NOW(), NOW()),
  ('880e8400-e29b-41d4-a716-446655440032', 'P201', '550e8400-e29b-41d4-a716-446655440001', 'ATENDIMENTO', NULL, NULL, NOW() - INTERVAL '3 days' + INTERVAL '45 minutes', NOW(), NOW()),
  
  ('880e8400-e29b-41d4-a716-446655440033', 'P202', '550e8400-e29b-41d4-a716-446655440001', 'ENTRADA', 'Jardim Continental', NULL, NOW() - INTERVAL '2 days', NOW(), NOW()),
  ('880e8400-e29b-41d4-a716-446655440034', 'P202', '550e8400-e29b-41d4-a716-446655440001', 'TRIAGEM', NULL, 'VERDE', NOW() - INTERVAL '2 days' + INTERVAL '25 minutes', NOW(), NOW()),
  ('880e8400-e29b-41d4-a716-446655440035', 'P202', '550e8400-e29b-41d4-a716-446655440001', 'ATENDIMENTO', NULL, NULL, NOW() - INTERVAL '2 days' + INTERVAL '1 hour 15 minutes', NOW(), NOW());