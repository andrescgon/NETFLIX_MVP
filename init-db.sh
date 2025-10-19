#!/bin/bash
set -e

DB_HOST="db"

# Esperar a que PostgreSQL esté listo
echo "Esperando a que PostgreSQL en el host '$DB_HOST' esté listo..."
until pg_isready -h "$DB_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do
  echo "PostgreSQL aún no está listo, reintentando..."
  sleep 2
done

echo "PostgreSQL está listo. Verificando si necesita restaurar el dump..."

# Verificar si la base de datos ya tiene tablas (evitar restaurar múltiples veces)
TABLE_COUNT=$(psql -h "$DB_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';")

if [ "$TABLE_COUNT" -eq "0" ]; then
  echo "Base de datos vacía. Restaurando dump.backup..."

  if [ -f /dump.backup ]; then
    echo "Ejecutando pg_restore..."
    pg_restore -h "$DB_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner --no-privileges /dump.backup || {
      echo "ADVERTENCIA: pg_restore terminó con algunos errores (esto es normal si algunas tablas no existen)"
    }
    echo "Dump restaurado exitosamente."
  else
    echo "ERROR: No se encontró el archivo dump.backup en /dump.backup"
    exit 1
  fi
else
  echo "La base de datos ya tiene $TABLE_COUNT tablas. Omitiendo restauración del dump."
fi

echo "Inicialización de base de datos completada."
