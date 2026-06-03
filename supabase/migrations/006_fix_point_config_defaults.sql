-- Migración 006: Corregir valores por defecto de point_config
-- EJECUTAR en Supabase SQL Editor
--
-- Problema: los valores por defecto son correct_exact=10, correct_winner=5, correct_diff=2
-- Pero correct_diff significa "acertó el ganador Y la diferencia de goles" —
-- debería valer MÁS que solo acertar el ganador (correct_winner).
-- Con los defaults actuales, acertar más da MENOS puntos (2 vs 5).
--
-- Corrección: correct_diff=7 (entre exact=10 y winner=5)
-- Escala lógica: exacto(10) > ganador+diferencia(7) > solo ganador(5)

update point_config
set correct_diff = 7
where correct_diff = 2 and correct_winner = 5 and correct_exact = 10;
