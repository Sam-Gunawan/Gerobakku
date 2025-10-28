from typing import Optional
from ..database import create_cursor, database_pool

def insert_user(email, password_hash, full_name, phone_number):
	sql = """
	INSERT INTO gerobakku.users (email, password_hash, full_name, phone_number, created_at)
	VALUES (%s, %s, %s, %s, NOW())
	RETURNING email, created_at;
	"""

	if not database_pool:
		return {"success": False, "error": "No database pool available", "data": None}

	try:
		cursor = create_cursor(database_pool)
		if not cursor:
			return {"success": False, "error": "Failed to create cursor", "data": None}
		cursor.execute(sql, (email, password_hash, full_name, phone_number))
		# fetch the returning values
		result = cursor.fetchone()
		cursor.connection.commit()
		return {"success": True, "data": result, "error": None}
	except Exception as e:
		return {"success": False,  "data": None, "error": str(e)}


def get_user():
	if not database_pool:
		return []
	sql = "SELECT * FROM gerobakku.users;"
	try:
		cursor = create_cursor(database_pool)
		if not cursor:
			return []
		cursor.execute(sql)
		return cursor.fetchall()
	except Exception as e:
		print(f"Error fetching users: {e}")
		return []

def get_user_by_id(user_id: str) -> Optional[tuple]:
	"""
	Return row as (user_id, email, password_hash, full_name, created_at, category_preference, is_verified) or None.
	"""
	if not database_pool:
		return None

	sql = "SELECT * FROM gerobakku.users WHERE user_id = %s;"
	try:
		cursor = create_cursor(database_pool)
		if not cursor:
			return None
		cursor.execute(sql, (user_id,))
		return cursor.fetchone()
	except Exception as e:
		print(f"Error fetching user by ID {user_id}: {e}")
		return None
	
def get_user_by_email(email: str) -> Optional[tuple]:
	"""
	Return row as (user_id, email, password_hash, full_name, created_at, category_preference, is_verified) or None.
	"""
	if not database_pool:
		return None

	sql = "SELECT * FROM gerobakku.users WHERE email = %s;"
	try:
		cursor = create_cursor(database_pool)
		if not cursor:
			return None
		cursor.execute(sql, (email,))
		return cursor.fetchone()
	except Exception as e:
		print(f"Error fetching user by email {email}: {e}")
		return None