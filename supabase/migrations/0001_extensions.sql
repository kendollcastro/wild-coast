-- 0001: extensions
-- btree_gist habilita el constraint EXCLUDE sobre daterange (anti solapamiento),
-- que es la garantía a nivel de base de datos contra doble reserva.
create extension if not exists pgcrypto;
create extension if not exists btree_gist;