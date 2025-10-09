import pyodbc
import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

def connect_to_sqlserver():
    try:
        driver = os.getenv("DB_DRIVER")
        host = os.getenv("DB_HOST")
        database = os.getenv("DB_DATABASE")

        connection_string = (
            f"DRIVER={{{driver}}};"
            f"SERVER={host};"
            f"DATABASE={database};"
            "Trusted_Connection=yes;"
        )

        connection = pyodbc.connect(connection_string, autocommit=True)
        print("✅ Conexión a SQL Server exitosa.")
        return connection
    except Exception as e:
        print("❌ Error conectando a SQL Server:", e)
        raise


def execute_query(connection, query, params=()):
    cursor = connection.cursor()
    try:
        cursor.execute(query, params)
        connection.commit()
    except Exception as e:
        print("❌ Error ejecutando query:", e)
        raise
    finally:
        cursor.close()
        
def fetch_one(connection, query, params=()):
    cursor = connection.cursor()
    cursor.execute(query, params)
    row = cursor.fetchone()
    cursor.close()
    return row
