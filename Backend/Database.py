from dotenv import load_dotenv
import os
import pyodbc
import logging

load_dotenv()

db_config = {
    "host": os.getenv("DB_HOST"),
    "database": os.getenv("DB_DATABASE"),
    "driver": os.getenv("DB_DRIVER", "ODBC Driver 17 for SQL Server")
}

def connect_to_sqlserver():
    try:
        connection_string = (
            f"DRIVER={{{db_config['driver']}}};"
            f"SERVER={db_config['host']};"
            f"DATABASE={db_config['database']};"
            "Trusted_Connection=yes;"
        )
        connection = pyodbc.connect(connection_string)
        logging.info("Conectado a SQL Server con Windows Authentication")
        return connection
    except Exception as e:
        logging.error(f"Error al conectar a SQL Server: {e}")
        return None

def disconnect_from_sqlserver(connection):
    try:
        if connection:
            connection.close()
            logging.info("Conexión cerrada")
    except Exception as e:
        logging.error(f"Error al cerrar conexión: {e}")

def execute_query(query, params=None):
    try:
        conn = connect_to_sqlserver() 
        cursor = conn.cursor()
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)

        rows = cursor.fetchall()
        conn.close()
        return rows
    except Exception as e:
        logging.error(f"Error al ejecutar query: {e}")
        return None