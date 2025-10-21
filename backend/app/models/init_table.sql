CREATE SCHEMA IF NOT EXISTS gerobakku;

create extension postgis with schema extensions;

CREATE TABLE gerobakku."users" (
  "user_id" int PRIMARY KEY,
  "email" varchar(255),
  "password_hash" varchar(255),
  "full_name" varchar(255),
  "phone_number" int,
  "created_at" timestamp
);

CREATE TABLE gerobakku."customer" (
  "customer_id" int PRIMARY KEY,
  "user_id" int,
  "category_preference" int
);


CREATE TABLE gerobakku."sellers" (
  "seller_id" int PRIMARY KEY,
  "user_id" int,
  "ktp_image_url" varchar(255),
  "selfie_image_url" varchar(255),
  "is_verified" boolean
);

CREATE TABLE gerobakku."stores" (
  "store_id" int PRIMARY KEY,
  "seller_id" int,
  "name" varchar(255),
  "description" text,
  "rating" float,
  "category_id" int,
  "address" text,
  "is_open" boolean,
  "is_halal" boolean,
  "open_time" int,
  "close_time" int,
  "current_location"  geography(Point, 4326);
  "created_at" timestamp,
  "store_image_url" varchar(255)
);

CREATE TABLE gerobakku."master_categories" (
  "category_id" int PRIMARY KEY,
  "name" varchar(255)
);

CREATE TABLE gerobakku."menu_items" (
  "item_id" int PRIMARY KEY,
  "store_id" int,
  "name" varchar(255),
  "description" text,
  "price" float,
  "is_available" boolean,
  "menu_image_url" varchar(255),
  "created_at" timestamp
);

CREATE TABLE gerobakku."transactional_reviews" (
  "rating_id" int PRIMARY KEY,
  "customer_id" int,
  "store_id" int,
  "score" int,
  "comment" text,
  "created_at" timestamp
);

CREATE TABLE gerobakku."transactional_favorites" (
  "customer_id" int,
  "store_id" int,
  PRIMARY KEY ("customer_id", "store_id")
);

CREATE TABLE gerobakku."transactional_wishlist_items" (
  "customer_id" int,
  "item_id" int,
  PRIMARY KEY ("customer_id", "item_id")
);

CREATE TABLE gerobakku."transactional_messages" (
  "message_id" int PRIMARY KEY,
  "sender_id" int,
  "receiver_id" int,
  "content" text,
  "sent_at" timestamp,
  "is_read" boolean
);

ALTER TABLE gerobakku."customers" ADD FOREIGN KEY ("user_id") REFERENCES gerobakku."users" ("user_id");

ALTER TABLE gerobakku."customers" ADD FOREIGN KEY ("category_preference") REFERENCES gerobakku."master_categories" ("category_id");

ALTER TABLE gerobakku."sellers" ADD FOREIGN KEY ("user_id") REFERENCES gerobakku."users" ("user_id");

ALTER TABLE gerobakku."stores" ADD FOREIGN KEY ("seller_id") REFERENCES gerobakku."sellers" ("seller_id");

ALTER TABLE gerobakku."stores" ADD FOREIGN KEY ("category_id") REFERENCES gerobakku."master_categories" ("category_id");

ALTER TABLE gerobakku."menu_items" ADD FOREIGN KEY ("store_id") REFERENCES gerobakku."stores" ("store_id");

ALTER TABLE gerobakku."transactional_reviews" ADD FOREIGN KEY ("customer_id") REFERENCES gerobakku."customers" ("customer_id");

ALTER TABLE gerobakku."transactional_reviews" ADD FOREIGN KEY ("store_id") REFERENCES gerobakku."stores" ("store_id");

ALTER TABLE gerobakku."transactional_favorites" ADD FOREIGN KEY ("customer_id") REFERENCES gerobakku."customers" ("customer_id");

ALTER TABLE gerobakku."transactional_favorites" ADD FOREIGN KEY ("store_id") REFERENCES gerobakku."stores" ("store_id");

ALTER TABLE gerobakku."transactional_wishlist_items" ADD FOREIGN KEY ("customer_id") REFERENCES gerobakku."customers" ("customer_id");

ALTER TABLE gerobakku."transactional_wishlist_items" ADD FOREIGN KEY ("item_id") REFERENCES gerobakku."menu_items" ("item_id");

ALTER TABLE gerobakku."transactional_messages" ADD FOREIGN KEY ("sender_id") REFERENCES gerobakku."users" ("user_id");

ALTER TABLE gerobakku."transactional_messages" ADD FOREIGN KEY ("receiver_id") REFERENCES gerobakku."users" ("user_id");

.