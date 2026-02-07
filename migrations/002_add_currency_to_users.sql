-- Migration: Add currency column to users

ALTER TABLE users
ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD';
