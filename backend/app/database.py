from psycopg_pool import ConnectionPool
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

def init_db_pool():
	# Initialize and return a psycopg_pool.ConnectionPool or None on failure
	USER = os.getenv("DB_USER")
	PASSWORD = os.getenv("DB_PASS")
	HOST = os.getenv("DB_HOST")
	PORT = os.getenv("DB_PORT")
	DBNAME = os.getenv("DB_DATABASE")

	if not (USER and PASSWORD and HOST and PORT and DBNAME):
		print("Database environment variables are not fully set.")
		return None

	# Build a DSN accepted by psycopg
	conninfo = f"postgresql://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}"

	try:
		pool = ConnectionPool(conninfo, min_size=1, max_size=19)
		# quick smoke test
		cursor = create_cursor(pool)
		if cursor:
			cursor.execute("SELECT 1")
			_ = cursor.fetchone()
		print("Connection pool created and tested successfully.")
		return pool
	except Exception as e:
		print(f"Failed to create connection pool: {e}")
		return None

def create_cursor(pool):
	if not pool:
		return None
	try:
		return pool.connection().cursor()
	except Exception as e:
		print(f"Error creating cursor: {e}")
		return None

def close_database(pool):
	# Close the connection pool.
	if not pool:
		return
	try:
		pool.close()
	except Exception as e:
		print(f"Error closing pool: {e}")

# create connection pool after the function is defined
database_pool = init_db_pool()


# close_database(database_pool)


# Example usage (commented out for import-safety)
# if database_pool:
#     res = insert_user(database_pool, 'htest@example.com', 'hashed_pw_citra_456', 'Citra Lestari', '+6281345678901')
#     print(res)
#     close_database(database_pool)
