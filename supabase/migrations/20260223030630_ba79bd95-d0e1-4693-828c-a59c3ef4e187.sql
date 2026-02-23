-- Add 'financeiro' to alert_type enum
ALTER TYPE public.alert_type ADD VALUE IF NOT EXISTS 'financeiro';
