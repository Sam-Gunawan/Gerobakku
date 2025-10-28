from ..database import create_cursor

def insert_user(pool, email, password_hash, full_name, phone_number):
	sql = """
	INSERT INTO gerobakku.users (email, password_hash, full_name, phone_number, created_at)
	VALUES (%s, %s, %s, %s, NOW())
	RETURNING email, created_at;
	"""

	if not pool:
		return {"success": False, "error": "No database pool available", "data": None}

	try:
		cursor = create_cursor(pool)
		if not cursor:
			return {"success": False, "error": "Failed to create cursor", "data": None}
		cursor.execute(sql, (email, password_hash, full_name, phone_number))
		# fetch the returning values
		result = cursor.fetchone()
		cursor.connection.commit()
		return {"success": True, "data": result, "error": None}
	except Exception as e:
		return {"success": False,  "data": None, "error": str(e)}


def get_user(pool):
	if not pool:
		return []
	sql = "SELECT * FROM gerobakku.users;"
	try:
		cursor = create_cursor(pool)
		if not cursor:
			return []
		cursor.execute(sql)
		return cursor.fetchall()
	except Exception as e:
		print(f"Error fetching users: {e}")
		return []