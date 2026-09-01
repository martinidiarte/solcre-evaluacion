"""Genera votantes, candidatos y votos masivos para pruebas locales de rendimiento."""

import argparse
import random
import sys
import time
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import insert, select

from db.connection import engine
from db.models import Vote, Voter

# Evita imprimir cada lote completo; con cientos de miles de filas afectaría la prueba.
engine.echo = False


NAMES = ("Ana", "Bruno", "Carla", "Diego", "Elena", "Fabian", "Gabriela", "Hugo")
LAST_NAMES = ("Acosta", "Benitez", "Cabrera", "Diaz", "Estevez", "Ferreira", "Gomez", "Herrera")
SEXES = ("Masculino", "Femenino", "Otro")


def parse_args():
    parser = argparse.ArgumentParser(
        description="Agrega datos masivos a la base configurada en el archivo .env."
    )
    parser.add_argument("--voters", type=int, default=100_000, help="Cantidad total de votantes a crear")
    parser.add_argument("--candidates", type=int, default=500, help="Cantidad de los nuevos votantes que serán candidatos")
    parser.add_argument("--votes", type=int, default=80_000, help="Cantidad de votos a crear")
    parser.add_argument("--batch-size", type=int, default=5_000, help="Filas insertadas por lote")
    parser.add_argument("--seed", type=int, default=2026, help="Semilla para una distribución reproducible")
    parser.add_argument("--yes", action="store_true", help="Confirma la inserción sin solicitar respuesta interactiva")
    return parser.parse_args()


def validate_args(args):
    if args.voters <= 0:
        raise SystemExit("--voters debe ser mayor que cero")
    if args.candidates <= 0 or args.candidates > args.voters:
        raise SystemExit("--candidates debe estar entre 1 y la cantidad total de votantes")
    regular_voters = args.voters - args.candidates
    if args.votes < 0 or args.votes > regular_voters:
        raise SystemExit("--votes no puede superar la cantidad de votantes no candidatos")
    if args.batch_size <= 0:
        raise SystemExit("--batch-size debe ser mayor que cero")


def voter_row(index, token, is_candidate, rng):
    # 18 caracteres: respeta el VARCHAR(20) y evita colisiones entre ejecuciones.
    document = f"S{token}{index:09d}"
    dob = date(1950, 1, 1) + timedelta(days=rng.randrange(18_000))
    return {
        "name": rng.choice(NAMES),
        "last_name": rng.choice(LAST_NAMES),
        "document": document,
        "dob": dob,
        "is_candidate": is_candidate,
        "address": f"Calle de prueba {index}",
        "telephone_number": f"09{index % 100_000_000:08d}",
        "sex": rng.choice(SEXES),
    }


def insert_voters(start_index, end_index, token, is_candidate, batch_size, rng, label):
    total = end_index - start_index
    inserted = 0
    for start in range(start_index, end_index, batch_size):
        batch = [
            voter_row(index, token, is_candidate, rng)
            for index in range(start, min(start + batch_size, end_index))
        ]
        with engine.begin() as connection:
            connection.execute(insert(Voter), batch)
        inserted += len(batch)
        print(f"{label}: {inserted:,}/{total:,}")


def insert_votes(voter_ids, candidate_ids, batch_size, rng):
    total = len(voter_ids)
    for start in range(0, total, batch_size):
        batch = [
            {"voter_id": voter_id, "candidate_id": rng.choice(candidate_ids)}
            for voter_id in voter_ids[start:start + batch_size]
        ]
        with engine.begin() as connection:
            connection.execute(insert(Vote), batch)
        print(f"Votos: {min(start + len(batch), total):,}/{total:,}")


def main():
    args = parse_args()
    validate_args(args)

    print(
        f"Se agregarán {args.voters:,} votantes "
        f"({args.candidates:,} candidatos) y {args.votes:,} votos."
    )
    print("El proceso es aditivo: no elimina los datos existentes.")
    if not args.yes and input("Escriba SI para continuar: ").strip().upper() != "SI":
        print("Operación cancelada.")
        return

    started_at = time.perf_counter()
    rng = random.Random(args.seed)
    token = f"{time.time_ns():x}"[-8:]
    document_prefix = f"S{token}"

    insert_voters(0, args.candidates, token, True, args.batch_size, rng, "Candidatos")
    insert_voters(args.candidates, args.voters, token, False, args.batch_size, rng, "Votantes")

    with engine.connect() as connection:
        candidate_ids = list(connection.scalars(
            select(Voter.id)
            .where(Voter.document.like(f"{document_prefix}%"), Voter.is_candidate.is_(True))
            .order_by(Voter.id)
        ))
        voter_ids = list(connection.scalars(
            select(Voter.id)
            .where(Voter.document.like(f"{document_prefix}%"), Voter.is_candidate.is_(False))
            .order_by(Voter.id)
            .limit(args.votes)
        ))

    insert_votes(voter_ids, candidate_ids, args.batch_size, rng)

    elapsed = time.perf_counter() - started_at
    print(f"Carga finalizada en {elapsed:.2f} segundos. Prefijo de esta ejecución: {document_prefix}")


if __name__ == "__main__":
    main()
