#!/usr/bin/env bash
set -e

if [ -n "$POSTGRES_HOST" ]; then
  echo "Esperando a Postgres en $POSTGRES_HOST:$POSTGRES_PORT ..."
  until python - <<'END'
import sys, psycopg, os
host=os.getenv("POSTGRES_HOST","localhost")
port=int(os.getenv("POSTGRES_PORT","5432"))
user=os.getenv("POSTGRES_USER","postgres")
pwd=os.getenv("POSTGRES_PASSWORD","")
db=os.getenv("POSTGRES_DB","postgres")
try:
    psycopg.connect(host=host, port=port, user=user, password=pwd, dbname=db).close()
except Exception:
    sys.exit(1)
END
  do
    echo "Postgres no está listo, reintentando..."
    sleep 2
  done
fi

python manage.py migrate --noinput
python manage.py runserver 0.0.0.0:8000
