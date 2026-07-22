-- Initial schema for TOP VACANCES.BF

CREATE TABLE IF NOT EXISTS publications (
    id TEXT PRIMARY KEY,
    titre TEXT NOT NULL DEFAULT '',
    page_name TEXT DEFAULT '',
    description TEXT DEFAULT '',
    image TEXT DEFAULT '',
    creative_image_url TEXT DEFAULT '',
    tags TEXT DEFAULT '[]',
    date TEXT DEFAULT '',
    delivery_start_time TEXT DEFAULT '',
    lien TEXT DEFAULT '',
    certifie INTEGER DEFAULT 0,
    whatsapp TEXT DEFAULT '',
    prix TEXT DEFAULT '',
    lieu TEXT DEFAULT '',
    hero INTEGER DEFAULT 0,
    auteur_id TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS boites (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    nom TEXT NOT NULL DEFAULT '',
    filters TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sponsors (
    id TEXT PRIMARY KEY,
    url TEXT DEFAULT '',
    type TEXT DEFAULT 'image',
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE DEFAULT '',
    name TEXT DEFAULT '',
    picture TEXT DEFAULT '',
    google_id TEXT UNIQUE DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS about_data (
    id INTEGER PRIMARY KEY DEFAULT 1,
    data TEXT DEFAULT '{}'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_boites_user_id ON boites(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_publications_date ON publications(date);

-- Seed 12 default publications
INSERT OR IGNORE INTO publications (id, titre, page_name, description, image, date, certifie, whatsapp) VALUES
('local_1','Tech4Kids','Tech4Kids','On y est ! Les sessions de robotique, programmation, drone, IA pour les enfants démarre lundi 22 juillet 2026.','images/704731435_1540220664405105_7612308673669814406_n.jpg','2026-07-22',0,'+22603131313'),
('local_2','Tech4Kids','Tech4Kids','Et si ces vacances devenaient le point de départ des talents numériques de vos enfants ?','images/720647807_2975533895987739_132519361158921880_n.jpg','2026-07-22',0,'+22655643242'),
('local_3','ISO Summer Fun 2026','ISO Summer Fun 2026','Keep your kids (ages 3-16) active and smiling with Sports, Arts, English Fun, and Swimming.','images/721782533_1617182480408812_4433600137694542818_n.jpg','2026-06-15',0,'+22676569144'),
('local_4','CS Electro-Informatique','CS Electro-Informatique','VACANCES UTILES 2026 - Formation pratique pour les enfants de 9 à 15 ans.','images/730084070_1450679637076187_8358239240930686442_n.jpg','2026-07-13',0,'+22672161367'),
('local_5','Le Clavier CFP','Le Clavier CFP','FORMATION EN INFORMATIQUE, INTELLIGENCE ARTIFICIELLE & CRÉATIVITÉ DIGITALE.','images/730487655_122175996218907332_8232751266356483922_n.jpg','2026-06-29',0,'+22677383427'),
('local_6','Nilis Academy','Nilis Academy','INITIEZ-VOUS À LA ROBOTIQUE AVEC ARDUINO !','images/733195398_122114789595345400_4701813681312240008_n.jpg','2026-07-27',0,'+22667573232'),
('local_7','Cerfi Burkina','Cerfi Burkina','COLONIE DE VACANCES ISLAMIQUE KADIOGO 2026.','images/730516003_992522850316275_623432142623436980_n.jpg','2026-07-30',0,''),
('local_8','Improv''you','Improv''you','KIDS WINNING WEEK — OFFREZ À VOS ENFANTS DES VACANCES QUI LES FERONT GRANDIR !','images/731239557_1620857936654774_701111186225977687_n.jpg','2026-07-20',0,'+22660686816'),
('local_9','Young Techs Burkina','Young Techs Burkina','Avec SYA YOUNG TECHS, les jeunes de 10 à 20 ans découvriront les bases du codage.','images/719532429_122175084596890957_3879330958297811756_n.jpg','2026-08-10',0,'+22666320403'),
('local_10','Studio TyRine Zaka','Studio TyRine Zaka','DANSE VACANCES 2026 - 4e édition !','images/725839002_1622443059881829_8288281453455099564_n.jpg','2026-06-29',0,''),
('local_11','Africa Digital Technology-Sarl','Africa Digital Technology-Sarl','Programme spécial Anglais & Informatique pour les enfants de 12 à 18 ans.','images/730001751_974085565493215_8715369582005480985_n.jpg','2026-07-06',0,'+22602893939'),
('local_12','PSCHOOL KIDS 2026','PSCHOOL KIDS 2026','Stage de Vacances PSCHOOL KIDS 2026 - Codage, Robotique, IA.','images/730688971_2080044932942667_2922172761182027804_n.jpg','2026-06-28',0,'+22607571645');

-- Seed about data
INSERT OR IGNORE INTO about_data (id, data) VALUES (1, '{}');
