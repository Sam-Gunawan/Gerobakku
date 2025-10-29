from typing import Optional
from ..database import get_cursor

def insert_user(email, password_hash, full_name):
	"""
	Inserts user to the database on registration.
	Returns the user information on successful insertion.
	"""

	sql = """
		INSERT INTO gerobakku.users (email, password_hash, full_name, created_at)
		VALUES (%s, %s, %s, NOW())
		RETURNING user_id, email, full_name, created_at, is_verified;
	"""

	output = {
		"success": False,
		"data": None,
		"error": None,
	}

	try:
		with get_cursor(commit=True) as cur:
			cur.execute(sql, (email, password_hash, full_name))
			row = cur.fetchone()
			
			output["success"] = True
			output["data"] = row
			return output
		
	except Exception as e:
		output["success"] = False
		output["data"] = None
		output["error"] = str(e)
		return output


def get_all_users():
	sql = "SELECT * FROM gerobakku.users;"
	
	try:
		with get_cursor() as cur:
			cur.execute(sql)
			return cur.fetchall()
	
	except Exception as e:
		print(f"Error fetching users: {e}")
		return []

def get_user_by_id(user_id: str) -> Optional[tuple]:
	"""
	Return row as (user_id, email, password_hash, full_name, created_at, is_verified) or None.
	"""
	sql = "SELECT user_id, email, password_hash, full_name, created_at, is_verified FROM gerobakku.users WHERE user_id = %s;"
	
	try:
		with get_cursor() as cur:
			cur.execute(sql, (user_id,))
			return cur.fetchone()

	except Exception as e:
		print(f"Error fetching user by ID {user_id}: {e}")
		return None
	
def get_user_by_email(email: str) -> Optional[tuple]:
	"""
	Return row as (user_id, email, password_hash, full_name, created_at, is_verified) or None.
	"""

	sql = "SELECT user_id, email, password_hash, full_name, created_at, is_verified FROM gerobakku.users WHERE email = %s;"
	
	try:
		with get_cursor() as cur:
			cur.execute(sql, (email,))
			return cur.fetchone()

	except Exception as e:
		print(f"Error fetching user by email {email}: {e}")
		return None