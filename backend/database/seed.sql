TRUNCATE TABLE ratings, stores, users RESTART IDENTITY CASCADE;

WITH inserted_users AS (
  INSERT INTO users (name, email, password_hash, address, role)
  VALUES
    (
      'System Administrator Root',
      'admin@example.com',
      crypt('Admin@123', gen_salt('bf', 10)),
      '100 Platform Administration Avenue',
      'ADMIN'
    ),
    (
      'Primary Store Owner User',
      'owner@example.com',
      crypt('Owner@123', gen_salt('bf', 10)),
      '200 Retail Operations Street',
      'STORE_OWNER'
    ),
    (
      'Default Normal User Account',
      'normal@example.com',
      crypt('User@1234', gen_salt('bf', 10)),
      '300 Customer District Road',
      'USER'
    )
  RETURNING id, email
),
inserted_store AS (
  INSERT INTO stores (name, email, address, owner_id)
  SELECT
    'Downtown Fresh Market Hub',
    'store@example.com',
    '410 Central Market Lane',
    id
  FROM inserted_users
  WHERE email = 'owner@example.com'
  RETURNING id
)
INSERT INTO ratings (user_id, store_id, rating)
SELECT u.id, s.id, 5
FROM inserted_users u
CROSS JOIN inserted_store s
WHERE u.email = 'normal@example.com';
