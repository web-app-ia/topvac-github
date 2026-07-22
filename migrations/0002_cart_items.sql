-- Cart persistence: store cart items per user in D1
-- so carts follow the account across devices/browsers

CREATE TABLE IF NOT EXISTS cart_items (
    user_id TEXT NOT NULL,
    ad_id TEXT NOT NULL,
    ad_data TEXT NOT NULL DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, ad_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
