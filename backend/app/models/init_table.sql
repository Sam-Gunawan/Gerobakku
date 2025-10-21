CREATE TABLE gerobakku.users (
  "user_id" int PRIMARY KEY,
  "email" varchar(255),
  "password_hash" varchar(255),
  "full_name" varchar(255),
  "phone_number" int,
  "created_at" timestamp
);