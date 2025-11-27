from psycopg_pool import ConnectionPool
from contextlib import contextmanager
from dotenv import load_dotenv
import os

load_dotenv()  # Load environment variables from .env file
database_pool: ConnectionPool | None = None

def init_db_pool():
	"""
	Create the global connection pool if it doesn't exist yet.
	Safe to call multiple times; will only create once.
	"""

	global database_pool

	if database_pool is not None:
		return database_pool

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
		database_pool = ConnectionPool(
			conninfo, 
			min_size=1, 
			max_size=19,
			kwargs={"prepare_threshold": None}  # Disable automatic prepared statements
		)
		
		# quick smoke test
		with database_pool.connection() as conn:
			with conn.cursor() as cur:
				cur.execute("SELECT 1;")
				cur.fetchone()
		print("Connection pool created successfully.")

	except Exception as e:
		print(f"Failed to create connection pool: {e}")
		database_pool = None
	
@contextmanager
def get_cursor(commit: bool = False):
	"""
	Usage in repo layer:

	from ..database import get_cursor

	def some_query(...):
		with get_cursor() as cur:
			cur.execute("SELECT ...")
			return cur.fetchall()
	
	def some_insert(...):
		with get_cursor() as cur:
			cur.execute("INSERT ... RETURNING ...")
			row = cur.fetchone()
			return row
	
	This:
	- borrows a connection from the global pool
	- gives you a cursor to work with
	- commits or rolls back for you
	- returns the connection to the pool

	"""

	if database_pool is None:
		raise RuntimeError("Database pool not initialized. Have you called init_db_pool()?")

	with database_pool.connection() as conn:
		with conn.cursor() as cur:
			try:
				yield cur
				if commit:
					conn.commit()
			except Exception:
				conn.rollback()
				raise

def close_database():
	"""
	Close the global database pool and release worker threads.
	Call this at app shutdown.
	"""
	global database_pool

	if database_pool is not None:
		try:
			database_pool.close()
			print("Database pool closed.")
		except Exception as e:
			print(f"Error closing pool: {e}")
		finally:
			database_pool = None

# Example usage (commented out for import-safety)
# if database_pool:
#     res = insert_user(database_pool, 'htest@example.com', 'hashed_pw_citra_456', 'Citra Lestari', '+6281345678901')
#     print(res)
#     close_database(database_pool)
