-- Migration: Add vendor simulation data around Sampoerna University, Pancoran
-- Location: Sampoerna University is at approximately -6.2443° S, 106.8385° E

-- Insert master categories if they don't exist
INSERT INTO gerobakku.master_categories (category_id, name) VALUES
(1, 'Street Food'),
(2, 'Beverages'),
(3, 'Desserts'),
(4, 'Snacks'),
(5, 'Traditional Food')
ON CONFLICT (category_id) DO NOTHING;

-- Insert users for vendors (sellers)
-- Password hash for 'password123' (you should use proper hashing in production)
INSERT INTO gerobakku.users (user_id, email, password_hash, full_name, created_at) VALUES
(101, 'pak.joko@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lk3v0M1eMJKu', 'Pak Joko Santoso', NOW()),
(102, 'bu.siti@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lk3v0M1eMJKu', 'Bu Siti Nurhaliza', NOW()),
(103, 'pak.ahmad@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lk3v0M1eMJKu', 'Pak Ahmad Dahlan', NOW()),
(104, 'bu.rina@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lk3v0M1eMJKu', 'Bu Rina Kusuma', NOW()),
(105, 'pak.budi@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lk3v0M1eMJKu', 'Pak Budi Raharjo', NOW()),
(106, 'bu.dewi@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lk3v0M1eMJKu', 'Bu Dewi Lestari', NOW()),
(107, 'pak.rudi@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lk3v0M1eMJKu', 'Pak Rudi Hartono', NOW()),
(108, 'bu.ani@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lk3v0M1eMJKu', 'Bu Ani Wijaya', NOW()),
(109, 'pak.hendra@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lk3v0M1eMJKu', 'Pak Hendra Gunawan', NOW()),
(110, 'bu.maya@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lk3v0M1eMJKu', 'Bu Maya Anggraini', NOW()),
(111, 'pak.tono@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lk3v0M1eMJKu', 'Pak Tono Suryadi', NOW()),
(112, 'bu.linda@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lk3v0M1eMJKu', 'Bu Linda Purnama', NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Insert sellers (vendors)
INSERT INTO gerobakku.vendors (vendor_id, user_id, ktp_image_url, selfie_image_url, is_verified) VALUES
(201, 101, 'https://example.com/ktp/joko.jpg', 'https://example.com/selfie/joko.jpg', true),
(202, 102, 'https://example.com/ktp/siti.jpg', 'https://example.com/selfie/siti.jpg', true),
(203, 103, 'https://example.com/ktp/ahmad.jpg', 'https://example.com/selfie/ahmad.jpg', true),
(204, 104, 'https://example.com/ktp/rina.jpg', 'https://example.com/selfie/rina.jpg', true),
(205, 105, 'https://example.com/ktp/budi.jpg', 'https://example.com/selfie/budi.jpg', true),
(206, 106, 'https://example.com/ktp/dewi.jpg', 'https://example.com/selfie/dewi.jpg', true),
(207, 107, 'https://example.com/ktp/rudi.jpg', 'https://example.com/selfie/rudi.jpg', true),
(208, 108, 'https://example.com/ktp/ani.jpg', 'https://example.com/selfie/ani.jpg', true),
(209, 109, 'https://example.com/ktp/hendra.jpg', 'https://example.com/selfie/hendra.jpg', true),
(210, 110, 'https://example.com/ktp/maya.jpg', 'https://example.com/selfie/maya.jpg', true),
(211, 111, 'https://example.com/ktp/tono.jpg', 'https://example.com/selfie/tono.jpg', true),
(212, 112, 'https://example.com/ktp/linda.jpg', 'https://example.com/selfie/linda.jpg', true)
ON CONFLICT (vendor_id) DO NOTHING;

-- Insert stores around Sampoerna University, Pancoran
-- Sampoerna University: -6.2443, 106.8385
-- Spreading vendors within ~1km radius
INSERT INTO gerobakku.stores (store_id, vendor_id, name, description, rating, category_id, address, is_open, is_halal, open_time, close_time, created_at, store_image_url) VALUES
(301, 201, 'Sate Pak Joko', 'Sate ayam dan kambing yang lezat dengan bumbu kacang spesial', 4.5, 1, 'Jl. MT Haryono, dekat Sampoerna University', true, true, 10, 22, NOW(), 'https://example.com/stores/sate-joko.jpg'),
(302, 202, 'Es Teh Bu Siti', 'Minuman segar untuk cuaca panas Jakarta', 4.7, 2, 'Depan Sampoerna University', true, true, 7, 20, NOW(), 'https://example.com/stores/esteh-siti.jpg'),
(303, 203, 'Nasi Goreng Ahmad', 'Nasi goreng dengan berbagai pilihan topping', 4.3, 1, 'Jl. Pancoran, dekat ITC Cempaka Mas', true, true, 18, 2, NOW(), 'https://example.com/stores/nasgor-ahmad.jpg'),
(304, 204, 'Gorengan Bu Rina', 'Aneka gorengan hangat setiap hari', 4.6, 4, 'Samping kampus Sampoerna', true, true, 6, 18, NOW(), 'https://example.com/stores/gorengan-rina.jpg'),
(305, 205, 'Bakso Pak Budi', 'Bakso sapi kenyal dengan kuah gurih', 4.8, 1, 'Jl. Casablanca, Pancoran', true, true, 9, 21, NOW(), 'https://example.com/stores/bakso-budi.jpg'),
(306, 206, 'Kue Tradisional Bu Dewi', 'Kue basah dan kering khas Indonesia', 4.4, 3, 'Dekat stasiun Cawang', true, true, 8, 17, NOW(), 'https://example.com/stores/kue-dewi.jpg'),
(307, 207, 'Mie Ayam Pak Rudi', 'Mie ayam dengan pangsit goreng crispy', 4.7, 1, 'Jl. MT Haryono KM 10', true, true, 10, 22, NOW(), 'https://example.com/stores/mieayam-rudi.jpg'),
(308, 208, 'Jus Buah Bu Ani', 'Jus buah segar tanpa pengawet', 4.5, 2, 'Food court dekat Sampoerna', true, true, 7, 19, NOW(), 'https://example.com/stores/jus-ani.jpg'),
(309, 209, 'Soto Betawi Pak Hendra', 'Soto Betawi asli dengan santan gurih', 4.9, 5, 'Pancoran Barat', true, true, 6, 15, NOW(), 'https://example.com/stores/soto-hendra.jpg'),
(310, 210, 'Martabak Bu Maya', 'Martabak manis dan telur enak', 4.6, 3, 'Jl. Raya Pancoran', true, true, 16, 1, NOW(), 'https://example.com/stores/martabak-maya.jpg'),
(311, 211, 'Pecel Lele Pak Tono', 'Pecel lele goreng dengan sambal terasi pedas', 4.4, 1, 'Dekat Pasar Pancoran', true, true, 11, 23, NOW(), 'https://example.com/stores/pecellele-tono.jpg'),
(312, 212, 'Es Cendol Bu Linda', 'Es cendol dengan gula merah asli', 4.7, 2, 'Samping kampus', true, true, 9, 20, NOW(), 'https://example.com/stores/cendol-linda.jpg')
ON CONFLICT (store_id) DO NOTHING;

-- Insert menu items for each store (3-5 items per store)

-- Store 301: Sate Pak Joko
INSERT INTO gerobakku.menu_items (item_id, store_id, name, description, price, is_available, menu_image_url, created_at) VALUES
(1001, 301, 'Sate Ayam (10 tusuk)', 'Sate ayam dengan bumbu kacang', 25000, true, 'https://example.com/menu/sate-ayam.jpg', NOW()),
(1002, 301, 'Sate Kambing (10 tusuk)', 'Sate kambing muda empuk', 35000, true, 'https://example.com/menu/sate-kambing.jpg', NOW()),
(1003, 301, 'Lontong Sayur', 'Lontong dengan sayur lodeh', 15000, true, 'https://example.com/menu/lontong.jpg', NOW())
ON CONFLICT (item_id) DO NOTHING;

-- Store 302: Es Teh Bu Siti
INSERT INTO gerobakku.menu_items (item_id, store_id, name, description, price, is_available, menu_image_url, created_at) VALUES
(1004, 302, 'Es Teh Manis', 'Es teh manis segar', 5000, true, 'https://example.com/menu/esteh.jpg', NOW()),
(1005, 302, 'Es Jeruk', 'Es jeruk peras asli', 8000, true, 'https://example.com/menu/esjeruk.jpg', NOW()),
(1006, 302, 'Teh Tawar Hangat', 'Teh tawar hangat', 3000, true, 'https://example.com/menu/teh-tawar.jpg', NOW()),
(1007, 302, 'Kopi Hitam', 'Kopi hitam robusta', 7000, true, 'https://example.com/menu/kopi.jpg', NOW())
ON CONFLICT (item_id) DO NOTHING;

-- Store 303: Nasi Goreng Ahmad
INSERT INTO gerobakku.menu_items (item_id, store_id, name, description, price, is_available, menu_image_url, created_at) VALUES
(1008, 303, 'Nasi Goreng Ayam', 'Nasi goreng dengan ayam suwir', 18000, true, 'https://example.com/menu/nasgor-ayam.jpg', NOW()),
(1009, 303, 'Nasi Goreng Seafood', 'Nasi goreng dengan udang dan cumi', 25000, true, 'https://example.com/menu/nasgor-seafood.jpg', NOW()),
(1010, 303, 'Nasi Goreng Spesial', 'Nasi goreng dengan telur, ayam, dan bakso', 22000, true, 'https://example.com/menu/nasgor-spesial.jpg', NOW())
ON CONFLICT (item_id) DO NOTHING;

-- Store 304: Gorengan Bu Rina
INSERT INTO gerobakku.menu_items (item_id, store_id, name, description, price, is_available, menu_image_url, created_at) VALUES
(1011, 304, 'Pisang Goreng (5 pcs)', 'Pisang goreng crispy', 10000, true, 'https://example.com/menu/pisang-goreng.jpg', NOW()),
(1012, 304, 'Tempe Goreng (10 pcs)', 'Tempe goreng dengan tepung bumbu', 8000, true, 'https://example.com/menu/tempe.jpg', NOW()),
(1013, 304, 'Tahu Isi (5 pcs)', 'Tahu isi sayuran', 12000, true, 'https://example.com/menu/tahu-isi.jpg', NOW()),
(1014, 304, 'Bakwan (5 pcs)', 'Bakwan sayur goreng', 10000, true, 'https://example.com/menu/bakwan.jpg', NOW())
ON CONFLICT (item_id) DO NOTHING;

-- Store 305: Bakso Pak Budi
INSERT INTO gerobakku.menu_items (item_id, store_id, name, description, price, is_available, menu_image_url, created_at) VALUES
(1015, 305, 'Bakso Komplit', 'Bakso dengan mie, tahu, dan siomay', 20000, true, 'https://example.com/menu/bakso-komplit.jpg', NOW()),
(1016, 305, 'Bakso Urat', 'Bakso urat sapi kenyal', 22000, true, 'https://example.com/menu/bakso-urat.jpg', NOW()),
(1017, 305, 'Mie Bakso', 'Mie dengan bakso', 18000, true, 'https://example.com/menu/mie-bakso.jpg', NOW())
ON CONFLICT (item_id) DO NOTHING;

-- Store 306: Kue Tradisional Bu Dewi
INSERT INTO gerobakku.menu_items (item_id, store_id, name, description, price, is_available, menu_image_url, created_at) VALUES
(1018, 306, 'Klepon (10 pcs)', 'Klepon isi gula merah', 15000, true, 'https://example.com/menu/klepon.jpg', NOW()),
(1019, 306, 'Onde-onde (5 pcs)', 'Onde-onde kacang hijau', 12000, true, 'https://example.com/menu/onde.jpg', NOW()),
(1020, 306, 'Lemper (5 pcs)', 'Lemper ayam', 18000, true, 'https://example.com/menu/lemper.jpg', NOW()),
(1021, 306, 'Kue Lapis', 'Kue lapis legit', 25000, true, 'https://example.com/menu/lapis.jpg', NOW())
ON CONFLICT (item_id) DO NOTHING;

-- Store 307: Mie Ayam Pak Rudi
INSERT INTO gerobakku.menu_items (item_id, store_id, name, description, price, is_available, menu_image_url, created_at) VALUES
(1022, 307, 'Mie Ayam Biasa', 'Mie ayam dengan pangsit rebus', 15000, true, 'https://example.com/menu/mieayam-biasa.jpg', NOW()),
(1023, 307, 'Mie Ayam Spesial', 'Mie ayam dengan pangsit goreng', 18000, true, 'https://example.com/menu/mieayam-spesial.jpg', NOW()),
(1024, 307, 'Pangsit Goreng', 'Pangsit goreng crispy (10 pcs)', 12000, true, 'https://example.com/menu/pangsit.jpg', NOW())
ON CONFLICT (item_id) DO NOTHING;

-- Store 308: Jus Buah Bu Ani
INSERT INTO gerobakku.menu_items (item_id, store_id, name, description, price, is_available, menu_image_url, created_at) VALUES
(1025, 308, 'Jus Alpukat', 'Jus alpukat dengan susu', 15000, true, 'https://example.com/menu/jus-alpukat.jpg', NOW()),
(1026, 308, 'Jus Mangga', 'Jus mangga segar', 12000, true, 'https://example.com/menu/jus-mangga.jpg', NOW()),
(1027, 308, 'Jus Jambu', 'Jus jambu merah', 10000, true, 'https://example.com/menu/jus-jambu.jpg', NOW()),
(1028, 308, 'Smoothie Mix', 'Smoothie buah campuran', 18000, true, 'https://example.com/menu/smoothie.jpg', NOW())
ON CONFLICT (item_id) DO NOTHING;

-- Store 309: Soto Betawi Pak Hendra
INSERT INTO gerobakku.menu_items (item_id, store_id, name, description, price, is_available, menu_image_url, created_at) VALUES
(1029, 309, 'Soto Betawi Daging', 'Soto betawi dengan daging sapi', 25000, true, 'https://example.com/menu/soto-daging.jpg', NOW()),
(1030, 309, 'Soto Betawi Jeroan', 'Soto betawi dengan jeroan', 22000, true, 'https://example.com/menu/soto-jeroan.jpg', NOW()),
(1031, 309, 'Emping', 'Kerupuk emping', 5000, true, 'https://example.com/menu/emping.jpg', NOW())
ON CONFLICT (item_id) DO NOTHING;

-- Store 310: Martabak Bu Maya
INSERT INTO gerobakku.menu_items (item_id, store_id, name, description, price, is_available, menu_image_url, created_at) VALUES
(1032, 310, 'Martabak Manis Coklat Keju', 'Martabak manis dengan coklat dan keju', 35000, true, 'https://example.com/menu/martabak-manis.jpg', NOW()),
(1033, 310, 'Martabak Telur Daging', 'Martabak telur dengan daging cincang', 30000, true, 'https://example.com/menu/martabak-telur.jpg', NOW()),
(1034, 310, 'Terang Bulan Green Tea', 'Martabak manis green tea', 32000, true, 'https://example.com/menu/martabak-greentea.jpg', NOW())
ON CONFLICT (item_id) DO NOTHING;

-- Store 311: Pecel Lele Pak Tono
INSERT INTO gerobakku.menu_items (item_id, store_id, name, description, price, is_available, menu_image_url, created_at) VALUES
(1035, 311, 'Pecel Lele (2 ekor)', 'Lele goreng dengan sambal terasi', 20000, true, 'https://example.com/menu/pecel-lele.jpg', NOW()),
(1036, 311, 'Ayam Goreng', 'Ayam goreng kampung', 18000, true, 'https://example.com/menu/ayam-goreng.jpg', NOW()),
(1037, 311, 'Nasi Putih', 'Nasi putih hangat', 5000, true, 'https://example.com/menu/nasi.jpg', NOW()),
(1038, 311, 'Lalapan', 'Lalapan segar dengan sambal', 8000, true, 'https://example.com/menu/lalapan.jpg', NOW())
ON CONFLICT (item_id) DO NOTHING;

-- Store 312: Es Cendol Bu Linda
INSERT INTO gerobakku.menu_items (item_id, store_id, name, description, price, is_available, menu_image_url, created_at) VALUES
(1039, 312, 'Es Cendol Original', 'Es cendol dengan gula merah asli', 12000, true, 'https://example.com/menu/cendol.jpg', NOW()),
(1040, 312, 'Es Dawet', 'Es dawet ayu', 10000, true, 'https://example.com/menu/dawet.jpg', NOW()),
(1041, 312, 'Es Campur', 'Es campur lengkap', 15000, true, 'https://example.com/menu/es-campur.jpg', NOW())
ON CONFLICT (item_id) DO NOTHING;

-- Insert initial locations for all stores around Sampoerna University
-- Coordinates spread within ~1km radius of Sampoerna University (-6.2443, 106.8385)

INSERT INTO gerobakku.transactional_store_location (store_id, location) VALUES
-- Store 301: Sate Pak Joko - North of campus
(301, ST_SetSRID(ST_MakePoint(106.8385, -6.2400), 4326)::geography),
-- Store 302: Es Teh Bu Siti - Right in front of campus
(302, ST_SetSRID(ST_MakePoint(106.8390, -6.2443), 4326)::geography),
-- Store 303: Nasi Goreng Ahmad - East side
(303, ST_SetSRID(ST_MakePoint(106.8430, -6.2450), 4326)::geography),
-- Store 304: Gorengan Bu Rina - Beside campus
(304, ST_SetSRID(ST_MakePoint(106.8380, -6.2438), 4326)::geography),
-- Store 305: Bakso Pak Budi - Casablanca direction
(305, ST_SetSRID(ST_MakePoint(106.8420, -6.2420), 4326)::geography),
-- Store 306: Kue Bu Dewi - Near Cawang station
(306, ST_SetSRID(ST_MakePoint(106.8460, -6.2390), 4326)::geography),
-- Store 307: Mie Ayam Pak Rudi - MT Haryono KM 10
(307, ST_SetSRID(ST_MakePoint(106.8350, -6.2410), 4326)::geography),
-- Store 308: Jus Bu Ani - Food court area
(308, ST_SetSRID(ST_MakePoint(106.8395, -6.2445), 4326)::geography),
-- Store 309: Soto Pak Hendra - Pancoran Barat
(309, ST_SetSRID(ST_MakePoint(106.8320, -6.2480), 4326)::geography),
-- Store 310: Martabak Bu Maya - Raya Pancoran
(310, ST_SetSRID(ST_MakePoint(106.8400, -6.2470), 4326)::geography),
-- Store 311: Pecel Lele Pak Tono - Near Pancoran market
(311, ST_SetSRID(ST_MakePoint(106.8370, -6.2490), 4326)::geography),
-- Store 312: Es Cendol Bu Linda - Beside campus
(312, ST_SetSRID(ST_MakePoint(106.8392, -6.2440), 4326)::geography)
ON CONFLICT DO NOTHING;
