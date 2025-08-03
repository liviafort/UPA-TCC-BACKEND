-- UPAs de Campina Grande
INSERT INTO "upas" ("id", "name", "address", "latitude", "longitude", "is_active", "operating_hours", "created_at", "updated_at") VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Dinamérica', 'Rua das Acácias, s/n - Dinamérica, Campina Grande - PB', -7.2177, -35.8811, true, '{"weekdays": "08:00-18:00", "weekends": "09:00-16:00"}', NOW(), NOW()),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Catole', 'Rua Floriano Peixoto, 785 - Catole, Campina Grande - PB', -7.2190, -35.8950, true, '{"weekdays": "08:00-18:00", "weekends": "09:00-16:00"}', NOW(), NOW()),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Ramadinha', 'Rua Pedro Américo, s/n - Ramadinha, Campina Grande - PB', -7.2350, -35.8790, true, '{"weekdays": "08:00-18:00", "weekends": "09:00-16:00"}', NOW(), NOW())
ON CONFLICT ("name") DO NOTHING;

-- Tokens de autenticação (CORRIGIDO)
INSERT INTO "auth_tokens" ("id", "token", "name", "institution", "is_active", "permissions", "created_at", "updated_at") VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'ifpb-upa-token-2025', 'Sistema IFPB', 'Instituto Federal da Paraíba - Campus Campina Grande', true, ARRAY['events:create', 'queue:read']::text[], NOW(), NOW()),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'secretaria-saude-cg-token', 'Secretaria Municipal', 'Secretaria Municipal de Saúde de Campina Grande', true, ARRAY['events:create', 'queue:read', 'admin:all']::text[], NOW(), NOW())
ON CONFLICT ("token") DO NOTHING;

-- Pacientes de exemplo (opcional)
INSERT INTO "patient_status" ("id", "patient_id", "upa_id", "bairro", "status", "classificacao", "entrada_timestamp", "created_at", "updated_at") VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'PAT001', 'Dinamérica', 'Centro', 'WAITING_TRIAGE', NULL, NOW() - INTERVAL '10 minutes', NOW(), NOW()),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'PAT002', 'Dinamérica', 'Catole', 'WAITING_CARE', 'VERDE', NOW() - INTERVAL '45 minutes', NOW(), NOW()),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'PAT003', 'Catole', 'Bodocongó', 'WAITING_CARE', 'VERMELHO', NOW() - INTERVAL '30 minutes', NOW(), NOW());

-- Eventos de exemplo (opcional)
INSERT INTO "patient_events" ("id", "patient_id", "upa_id", "event_type", "bairro", "classificacao", "timestamp", "received_at", "created_at") VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41', 'PAT001', 'Dinamérica', 'ENTRADA', 'Centro', NULL, NOW() - INTERVAL '10 minutes', NOW(), NOW()),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42', 'PAT002', 'Dinamérica', 'ENTRADA', 'Catole', NULL, NOW() - INTERVAL '50 minutes', NOW(), NOW()),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a43', 'PAT002', 'Dinamérica', 'TRIAGEM', NULL, 'VERDE', NOW() - INTERVAL '45 minutes', NOW(), NOW()),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'PAT003', 'Catole', 'ENTRADA', 'Bodocongó', NULL, NOW() - INTERVAL '35 minutes', NOW(), NOW()),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a45', 'PAT003', 'Catole', 'TRIAGEM', NULL, 'VERMELHO', NOW() - INTERVAL '30 minutes', NOW(), NOW());