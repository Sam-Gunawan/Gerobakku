-- Insert dummy reviews for all stores
-- Using user_ids 1-10
-- Store 301: Sate Pak Joko (Indonesian, Halal)
INSERT INTO gerobakku.transactional_reviews (user_id, store_id, score, comment, created_at) VALUES
(1, 301, 5, 'Sate nya juara! Bumbu kacangnya pas banget dan dagingnya empuk. Pasti balik lagi!', NOW() - INTERVAL '5 days'),
(3, 301, 4, 'Enak sih, tapi kadang harus nunggu lama karena rame. Worth it kok!', NOW() - INTERVAL '3 days'),
(7, 301, 5, 'Best sate around campus! Harganya terjangkau dan porsinya generous.', NOW() - INTERVAL '1 day');
-- Store 302: Es Teh Bu Siti (Beverages, Halal)
INSERT INTO gerobakku.transactional_reviews (user_id, store_id, score, comment, created_at) VALUES
(2, 302, 5, 'Es tehnya seger banget! Perfect buat cuaca Jakarta yang panas.', NOW() - INTERVAL '6 days'),
(4, 302, 4, 'Rasanya enak, manisnya pas. Tapi kadang es nya kurang banyak.', NOW() - INTERVAL '4 days'),
(8, 302, 5, 'Langganan tiap hari! Bu Siti orangnya ramah dan harganya murah.', NOW() - INTERVAL '2 days');
-- Store 303: Nasi Goreng Ahmad (Indonesian, Halal)
INSERT INTO gerobakku.transactional_reviews (user_id, store_id, score, comment, created_at) VALUES
(1, 303, 4, 'Nasi gorengnya enak, porsi banyak. Toppingnya bervariasi juga.', NOW() - INTERVAL '7 days'),
(5, 303, 5, 'Malam-malam buka sampai jam 2 pagi, penyelamat begadang! Rasanya mantap.', NOW() - INTERVAL '2 days'),
(9, 303, 4, 'Value for money banget. Telor nya gede-gede dan ayamnya banyak.', NOW() - INTERVAL '1 day');
-- Store 304: Gorengan Bu Rina (Snacks, Halal)
INSERT INTO gerobakku.transactional_reviews (user_id, store_id, score, comment, created_at) VALUES
(2, 304, 5, 'Gorengannya selalu fresh dan hangat. Tempe mendoan nya juara!', NOW() - INTERVAL '5 days'),
(6, 304, 4, 'Enak sih tapi kadang terlalu berminyak. Overall masih recommended.', NOW() - INTERVAL '3 days'),
(10, 304, 5, 'Harga Rp2000-3000 per piece, worth it banget! Sambelnya pedes mantap.', NOW() - INTERVAL '1 day');
-- Store 305: Bakso Pak Budi (Indonesian, Halal)
INSERT INTO gerobakku.transactional_reviews (user_id, store_id, score, comment, created_at) VALUES
(3, 305, 5, 'Kuahnya gurih banget! Baksonya kenyal dan gak pake bahan aneh-aneh.', NOW() - INTERVAL '6 days'),
(5, 305, 5, 'Best bakso near campus hands down. Mie nya juga enak.', NOW() - INTERVAL '4 days'),
(7, 305, 4, 'Enak tapi porsinya agak kecilan. Tapi rasa juara sih!', NOW() - INTERVAL '2 days');
-- Store 306: Kue Tradisional Bu Dewi (Snacks, Halal)
INSERT INTO gerobakku.transactional_reviews (user_id, store_id, score, comment, created_at) VALUES
(1, 306, 4, 'Kue basahnya enak-enak, klepon sama lemper favorit gue.', NOW() - INTERVAL '5 days'),
(4, 306, 5, 'Kue tradisional authentic! Kaya buatan nenek. Miss this so much.', NOW() - INTERVAL '3 days'),
(8, 306, 4, 'Harga terjangkau dan porsi oke. Cocok buat oleh-oleh juga.', NOW() - INTERVAL '1 day');
-- Store 307: Mie Ayam Pak Rudi (Indonesian, Halal)
INSERT INTO gerobakku.transactional_reviews (user_id, store_id, score, comment, created_at) VALUES
(2, 307, 5, 'Pangsit gorengnya crispy banget! Mie ayamnya juga lezat.', NOW() - INTERVAL '6 days'),
(6, 307, 4, 'Enak dan mengenyangkan. Porsinya pas buat orang Indonesia.', NOW() - INTERVAL '4 days'),
(9, 307, 5, 'Been coming here for years. Consistency is amazing!', NOW() - INTERVAL '2 days');
-- Store 308: Jus Buah Bu Ani (Beverages, Halal)
INSERT INTO gerobakku.transactional_reviews (user_id, store_id, score, comment, created_at) VALUES
(3, 308, 5, 'Jusnya fresh tanpa pengawet! Bisa request sugar level juga.', NOW() - INTERVAL '5 days'),
(5, 308, 4, 'Buahnya segar, tapi kadang ngantri. Popular banget memang.', NOW() - INTERVAL '3 days'),
(10, 308, 5, 'Healthy option around campus. Alpukat nya kental and creamy!', NOW() - INTERVAL '1 day');
-- Store 309: Soto Betawi Pak Hendra (Western, Halal)
INSERT INTO gerobakku.transactional_reviews (user_id, store_id, score, comment, created_at) VALUES
(1, 309, 5, 'Authentic Soto Betawi! Santannya gurih dan dagingnya empuk.', NOW() - INTERVAL '6 days'),
(4, 309, 4, 'Enak tapi porsi jeroan nya bisa lebih banyak. Kuahnya the best.', NOW() - INTERVAL '4 days'),
(7, 309, 5, 'Rasanya persis kayak Soto Betawi di Haji Husein. Recommended!', NOW() - INTERVAL '2 days');
-- Store 310: Martabak Bu Maya (Snacks, Halal)
INSERT INTO gerobakku.transactional_reviews (user_id, store_id, score, comment, created_at) VALUES
(2, 310, 5, 'Martabak manisnya luar biasa! Toppingnya melimpah.', NOW() - INTERVAL '5 days'),
(6, 310, 5, 'Martabak telor nya juicy and full of filling. Highly recommended!', NOW() - INTERVAL '3 days'),
(8, 310, 4, 'Enak sih tapi pricey. Tapi kualitas sebanding dengan harga.', NOW() - INTERVAL '1 day');
-- Store 311: Pecel Lele Pak Tono (Indonesian, Halal)
INSERT INTO gerobakku.transactional_reviews (user_id, store_id, score, comment, created_at) VALUES
(3, 311, 5, 'Sambal terasinya pedesnya nampol! Lele nya crispy di luar empuk di dalam.', NOW() - INTERVAL '6 days'),
(5, 311, 4, 'Enak tapi kadang lelenya kecil-kecil. Tapi rasa tetap juara!', NOW() - INTERVAL '4 days'),
(9, 311, 5, 'Late night makan spot! Buka sampe jam 11 malam. Perfect!', NOW() - INTERVAL '2 days');
-- Store 312: Es Cendol Bu Linda (Beverages, Halal)
INSERT INTO gerobakku.transactional_reviews (user_id, store_id, score, comment, created_at) VALUES
(1, 312, 5, 'Gula merahnya authentic! Es cendolnya sweet and refreshing.', NOW() - INTERVAL '5 days'),
(4, 312, 4, 'Enak tapi es nya cepet cair. Tapi rasa tetap top!', NOW() - INTERVAL '3 days'),
(10, 312, 5, 'Perfect dessert after lunch. Not too sweet, just right!', NOW() - INTERVAL '1 day');
