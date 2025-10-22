import psycopg2
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()



def connect_to_db():
	# Fetch variables
	USER = os.getenv("DB_USER")
	PASSWORD = os.getenv("DB_PASS")
	HOST = os.getenv("DB_HOST")
	PORT = os.getenv("DB_PORT")
	DBNAME = os.getenv("DB_DATABASE")
    
	try:
		connection = psycopg2.connect(
			user=USER,
			password=PASSWORD,
			host=HOST,
			port=PORT,
			dbname=DBNAME
		)
		cursor = connection.cursor()
		print("Connection successful!")
		return connection, cursor
	except Exception as e:
		print(f"Failed to connect: {e}")
		# Return a pair so unpacking doesn't fail in callers
		return None, None

def close_database(database_connection, database_cursor):
    # Close the database connection and cursor.

    if database_cursor:
        try:
            database_cursor.close()
        except Exception as e:
            print(f"Error closing cursor: {e}")
    if database_connection:
        try:
            database_connection.close()
        except Exception as e:
            print(f"Error closing connection: {e}")
    database_connection = None
    database_cursor = None

def insert_user(email, password_hash, full_name, phone_number):
	sql = """
	INSERT INTO gerobakku.users (email, password_hash, full_name, phone_number, created_at)
	VALUES (%s, %s, %s, %s, NOW())
	RETURNING email, created_at;
	"""

	# Ensure database connection/cursor are available
	if not database_connection or not database_cursor:
		return {"success": False, "error": "No database connection", "data": None}

	try:
		# single execute only
		database_cursor.execute(sql, (email, password_hash, full_name, phone_number))
		database_connection.commit()
		return {"success": True, "data": database_cursor.fetchone(), "error": None}
	except Exception as e:
		if database_connection:
			database_connection.rollback()
		return {"success": False, "error": str(e), "data": None}



# create connection and cursor after the function is defined
database_connection, database_cursor = connect_to_db()



# # Test
# if database_connection and database_cursor:
#     res = insert_user('htest@example.com', 'hashed_pw_citra_456', 'Citra Lestari', '+6281345678901')
#     print(res)

#     # Close the cursor and connection
    
#     close_database(database_connection, database_cursor)
# else:
#     print("Skipping example insert because database connection failed.")

