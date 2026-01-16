-- Database schema for QR Cafe Ordering System

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  description TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cafe tables table
CREATE TABLE IF NOT EXISTS cafe_tables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_number INTEGER NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_id UUID REFERENCES cafe_tables(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PREPARING', 'COMPLETED', 'CANCELLED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  is_cancelled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  method TEXT NOT NULL DEFAULT 'COUNTER',
  status TEXT NOT NULL DEFAULT 'PAID' CHECK (status IN ('PAID', 'PENDING', 'FAILED')),
  amount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Insert some sample data
INSERT INTO categories (name) VALUES
  ('Freakshakes'),
  ('Iced & Frappes'),
  ('Lemonade'),
  ('Slushy'),
  ('Milkshakes'),
  ('Starters'),
  ('Fries'),
  ('Club Sandwiches'),
  ('Wraps'),
  ('Burgers'),
  ('Neapolitan Style Pizza'),
  ('Pasta'),
  ('Fruit Refreshers')
ON CONFLICT DO NOTHING;


INSERT INTO menu_items (category_id, name, price, description, image_url) VALUES


  -- Freakshakes
  ((SELECT id FROM categories WHERE name = 'Freakshakes'), 'Oreo Obsession', 190, 'Rich Oreo blended freakshake', '/images/freakshakes/oreo-obsession.jpg'),
  ((SELECT id FROM categories WHERE name = 'Freakshakes'), 'Choco Storm', 190, 'Intense chocolate freakshake', '/images/freakshakes/choco-storm.jpg'),
  ((SELECT id FROM categories WHERE name = 'Freakshakes'), 'Mocha Madness', 190, 'Coffee and chocolate mocha shake', '/images/freakshakes/mocha-madness.jpg'),
  ((SELECT id FROM categories WHERE name = 'Freakshakes'), 'Krazy KitKat', 190, 'Crunchy KitKat chocolate shake', '/images/freakshakes/krazy-kitkat.jpg'),
  ((SELECT id FROM categories WHERE name = 'Freakshakes'), 'Nutella Nova', 190, 'Creamy Nutella loaded shake', '/images/freakshakes/nutella-nova.jpg'),
  ((SELECT id FROM categories WHERE name = 'Freakshakes'), 'Fruity Nut Riot', 190, 'Fruity shake with nutty crunch', '/images/freakshakes/fruity-nut-riot.jpg')

  -- Iced & Frappes
  ((SELECT id FROM categories WHERE name = 'Iced & Frappes'), 'Classic Cold Coffee', 70, 'Chilled classic cold coffee', '/images/iced-frappes/classic-cold-coffee.jpg'),
  ((SELECT id FROM categories WHERE name = 'Iced & Frappes'), 'Chocolate Coffee', 80, 'Cold coffee blended with chocolate', '/images/iced-frappes/chocolate-coffee.jpg'),
  ((SELECT id FROM categories WHERE name = 'Iced & Frappes'), 'Irish Frappe', 100, 'Creamy Irish-style frappe', '/images/iced-frappes/irish-frappe.jpg'),
  ((SELECT id FROM categories WHERE name = 'Iced & Frappes'), 'Nutella Latte', 100, 'Nutella infused iced latte', '/images/iced-frappes/nutella-latte.jpg'),
  ((SELECT id FROM categories WHERE name = 'Iced & Frappes'), 'Dark Mocha Magic', 100, 'Rich dark chocolate mocha frappe', '/images/iced-frappes/dark-mocha-magic.jpg'),
  ((SELECT id FROM categories WHERE name = 'Iced & Frappes'), 'Bistro Signature Frappe', 120, 'House special signature frappe', '/images/iced-frappes/bistro-signature-frappe.jpg')

 -- Lemonade
  ((SELECT id FROM categories WHERE name = 'Lemonade'), 'Ginger Zing', 60, 'Refreshing lemon drink with ginger kick', '/images/lemonade/ginger-zing.jpg'),
  ((SELECT id FROM categories WHERE name = 'Lemonade'), 'Ocean Lemon', 60, 'Cool blue lemon refresher', '/images/lemonade/ocean-lemon.jpg'),
  ((SELECT id FROM categories WHERE name = 'Lemonade'), 'Greenapple Glow', 60, 'Green apple flavored lemonade', '/images/lemonade/greenapple-glow.jpg'),
  ((SELECT id FROM categories WHERE name = 'Lemonade'), 'Violet Spark / Pink Punch', 60, 'Floral violet or pink fruit punch lemonade', '/images/lemonade/violet-spark-pink-punch.jpg'),
  ((SELECT id FROM categories WHERE name = 'Lemonade'), 'Bubblegum Twist', 60, 'Sweet bubblegum flavored lemonade', '/images/lemonade/bubblegum-twist.jpg'),
  ((SELECT id FROM categories WHERE name = 'Lemonade'), 'Virgin Mojito', 60, 'Classic mint lemon mojito (non-alcoholic)', '/images/lemonade/virgin-mojito.jpg'),
  ((SELECT id FROM categories WHERE name = 'Lemonade'), 'Blueberry Breeze', 60, 'Blueberry infused lemon drink', '/images/lemonade/blueberry-breeze.jpg'),
  ((SELECT id FROM categories WHERE name = 'Lemonade'), 'Passion Splash', 60, 'Tangy passion fruit lemonade', '/images/lemonade/passion-splash.jpg'),
  ((SELECT id FROM categories WHERE name = 'Lemonade'), 'Minty Ocean / Mojito Mint', 60, 'Minty ocean-blue lemonade', '/images/lemonade/minty-ocean-mojito-mint.jpg'),
  ((SELECT id FROM categories WHERE name = 'Lemonade'), 'Caribbean Cooler', 60, 'Tropical style chilled lemonade', '/images/lemonade/caribbean-cooler.jpg')

-- Slushy
  ((SELECT id FROM categories WHERE name = 'Slushy'), 'Ocean Mist', 90, 'Cool ocean-flavored slushy', '/images/slushy/ocean-mist.jpg'),
  ((SELECT id FROM categories WHERE name = 'Slushy'), 'Green Apple Chill', 90, 'Icy green apple slushy', '/images/slushy/green-apple-chill.jpg'),
  ((SELECT id FROM categories WHERE name = 'Slushy'), 'Mint Mojito Frost', 80, 'Minty mojito-style frozen drink', '/images/slushy/mint-mojito-frost.jpg'),
  ((SELECT id FROM categories WHERE name = 'Slushy'), 'Blueberry Burst', 90, 'Frozen blueberry flavored slushy', '/images/slushy/blueberry-burst.jpg'),
  ((SELECT id FROM categories WHERE name = 'Slushy'), 'Violet Crush', 90, 'Floral violet flavored slushy', '/images/slushy/violet-crush.jpg'),
  ((SELECT id FROM categories WHERE name = 'Slushy'), 'Frozen Pink', 90, 'Sweet pink fruity slushy', '/images/slushy/frozen-pink.jpg'),
  ((SELECT id FROM categories WHERE name = 'Slushy'), 'Bubblegum Freeze', 90, 'Bubblegum flavored frozen slushy', '/images/slushy/bubblegum-freeze.jpg'),
  ((SELECT id FROM categories WHERE name = 'Slushy'), 'Passion Pop', 90, 'Tangy passion fruit slushy', '/images/slushy/passion-pop.jpg'),
  ((SELECT id FROM categories WHERE name = 'Slushy'), 'Caribbean Blue', 90, 'Tropical blue frozen slushy', '/images/slushy/caribbean-blue.jpg'),
  ((SELECT id FROM categories WHERE name = 'Slushy'), 'Chilly Mojito', 90, 'Refreshing mint lemon frozen mojito', '/images/slushy/chilly-mojito.jpg')

 -- Milkshakes (M & XL)

  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'Oreo Overload (M)', 60, 'Oreo milkshake - medium', '/images/milkshakes/oreo-overload-m.jpg'),
  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'Oreo Overload (XL)', 110, 'Oreo milkshake - extra large', '/images/milkshakes/oreo-overload-xl.jpg'),

  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'Shamam Smoothie (M)', 60, 'Fruit smoothie - medium', '/images/milkshakes/shamam-smoothie-m.jpg'),
  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'Shamam Smoothie (XL)', 110, 'Fruit smoothie - extra large', '/images/milkshakes/shamam-smoothie-xl.jpg'),

  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'Mixed Fruity Fusion (M)', 60, 'Mixed fruit milkshake - medium', '/images/milkshakes/mixed-fruity-fusion-m.jpg'),
  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'Mixed Fruity Fusion (XL)', 110, 'Mixed fruit milkshake - extra large', '/images/milkshakes/mixed-fruity-fusion-xl.jpg'),

  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'Chikoo Charm (M)', 60, 'Chikoo milkshake - medium', '/images/milkshakes/chikoo-charm-m.jpg'),
  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'Chikoo Charm (XL)', 110, 'Chikoo milkshake - extra large', '/images/milkshakes/chikoo-charm-xl.jpg'),

  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'Royal Anjeer (M)', 80, 'Fig flavored milkshake - medium', '/images/milkshakes/royal-anjeer-m.jpg'),
  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'Royal Anjeer (XL)', 150, 'Fig flavored milkshake - extra large', '/images/milkshakes/royal-anjeer-xl.jpg'),

  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'Nutella Oreo Dream (M)', 80, 'Nutella & Oreo milkshake - medium', '/images/milkshakes/nutella-oreo-dream-m.jpg'),
  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'Nutella Oreo Dream (XL)', 150, 'Nutella & Oreo milkshake - extra large', '/images/milkshakes/nutella-oreo-dream-xl.jpg'),

  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'Dry Fruit & Nut Crunch (M)', 90, 'Dry fruits milkshake - medium', '/images/milkshakes/dry-fruit-nut-crunch-m.jpg'),
  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'Dry Fruit & Nut Crunch (XL)', 170, 'Dry fruits milkshake - extra large', '/images/milkshakes/dry-fruit-nut-crunch-xl.jpg'),

  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'Vanilla Cloud / Irish Cocoa (M)', 90, 'Vanilla or Irish cocoa shake - medium', '/images/milkshakes/vanilla-cloud-m.jpg'),
  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'Vanilla Cloud / Irish Cocoa (XL)', 170, 'Vanilla or Irish cocoa shake - extra large', '/images/milkshakes/vanilla-cloud-xl.jpg'),

  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'Classic Chocolate (M)', 100, 'Classic chocolate milkshake - medium', '/images/milkshakes/classic-chocolate-m.jpg'),
  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'Classic Chocolate (XL)', 190, 'Classic chocolate milkshake - extra large', '/images/milkshakes/classic-chocolate-xl.jpg'),

  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'Choco Nut Swirl (M)', 100, 'Chocolate nut milkshake - medium', '/images/milkshakes/choco-nut-swirl-m.jpg'),
  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'Choco Nut Swirl (XL)', 190, 'Chocolate nut milkshake - extra large', '/images/milkshakes/choco-nut-swirl-xl.jpg'),

  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'Brownie Crush (M)', 120, 'Brownie chocolate milkshake - medium', '/images/milkshakes/brownie-crush-m.jpg'),
  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'Brownie Crush (XL)', 230, 'Brownie chocolate milkshake - extra large', '/images/milkshakes/brownie-crush-xl.jpg'),

  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'KitKat Fantasy (M)', 120, 'KitKat milkshake - medium', '/images/milkshakes/kitkat-fantasy-m.jpg'),
  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'KitKat Fantasy (XL)', 230, 'KitKat milkshake - extra large', '/images/milkshakes/kitkat-fantasy-xl.jpg'),

  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'Nutella Nuts (M)', 130, 'Nutella nut milkshake - medium', '/images/milkshakes/nutella-nuts-m.jpg'),
  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'Nutella Nuts (XL)', 240, 'Nutella nut milkshake - extra large', '/images/milkshakes/nutella-nuts-xl.jpg'),

  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'Roasted Almond Delight (M)', 130, 'Roasted almond milkshake - medium', '/images/milkshakes/roasted-almond-delight-m.jpg'),
  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'Roasted Almond Delight (XL)', 240, 'Roasted almond milkshake - extra large', '/images/milkshakes/roasted-almond-delight-xl.jpg'),

  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'Seetaphal Surprise (Seasonal) (M)', 80, 'Seasonal custard apple shake - medium', '/images/milkshakes/seetaphal-surprise-m.jpg'),
  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'Seetaphal Surprise (Seasonal) (XL)', 150, 'Seasonal custard apple shake - extra large', '/images/milkshakes/seetaphal-surprise-xl.jpg'),

  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'Mango Mood (Seasonal) (M)', 80, 'Seasonal mango shake - medium', '/images/milkshakes/mango-mood-m.jpg'),
  ((SELECT id FROM categories WHERE name = 'Milkshakes'), 'Mango Mood (Seasonal) (XL)', 150, 'Seasonal mango shake - extra large', '/images/milkshakes/mango-mood-xl.jpg')


-- Starters
  ((SELECT id FROM categories WHERE name = 'Starters'), 'Crunchy Chicken Bites', 140, 'Crispy bite-sized chicken starters', '/images/starters/crunchy-chicken-bites.jpg'),
  ((SELECT id FROM categories WHERE name = 'Starters'), 'Pop’n’Roll Chicken', 160, 'Rolled crispy chicken snacks', '/images/starters/popnroll-chicken.jpg'),
  ((SELECT id FROM categories WHERE name = 'Starters'), 'Golden Crispy Tenders', 180, 'Golden fried chicken tenders', '/images/starters/golden-crispy-tenders.jpg'),

  -- Fries
  ((SELECT id FROM categories WHERE name = 'Fries'), 'Classic Salted Fries', 70, 'Classic salted french fries', '/images/fries/classic-salted-fries.jpg'),
  ((SELECT id FROM categories WHERE name = 'Fries'), 'Peri Peri Fries', 90, 'Spicy peri peri seasoned fries', '/images/fries/peri-peri-fries.jpg'),
  ((SELECT id FROM categories WHERE name = 'Fries'), 'Spicy Cayenne Pepper', 100, 'Fries tossed in cayenne pepper spice', '/images/fries/spicy-cayenne-pepper.jpg'),
  ((SELECT id FROM categories WHERE name = 'Fries'), 'Chicken Loaded Funky Fries', 200, 'Loaded fries topped with spicy chicken', '/images/fries/chicken-loaded-funky-fries.jpg'),

  -- Club Sandwiches
  ((SELECT id FROM categories WHERE name = 'Club Sandwiches'), 'Tikka Club Melt', 120, 'Chicken tikka club sandwich', '/images/club-sandwiches/tikka-club-melt.jpg'),
  ((SELECT id FROM categories WHERE name = 'Club Sandwiches'), 'Zinger Club Twist', 120, 'Crispy zinger chicken club sandwich', '/images/club-sandwiches/zinger-club-twist.jpg'),

  -- Wraps
  ((SELECT id FROM categories WHERE name = 'Wraps'), 'Zinger Twister', 120, 'Crispy zinger chicken wrap', '/images/wraps/zinger-twister.jpg'),
  ((SELECT id FROM categories WHERE name = 'Wraps'), 'Crispy Strip Roll', 100, 'Crispy chicken strip wrap', '/images/wraps/crispy-strip-roll.jpg'),
  ((SELECT id FROM categories WHERE name = 'Wraps'), 'Chicken Peri Peri', 100, 'Peri peri spiced chicken wrap', '/images/wraps/chicken-peri-peri.jpg')

 -- Burgers
  ((SELECT id FROM categories WHERE name = 'Burgers'), 'Broasted Crunch Burger', 80, 'Crispy broasted chicken burger', '/images/burgers/broasted-crunch-burger.jpg'),
  ((SELECT id FROM categories WHERE name = 'Burgers'), 'Chicken Tikka Heat Burger', 80, 'Spicy chicken tikka burger', '/images/burgers/chicken-tikka-heat-burger.jpg'),
  ((SELECT id FROM categories WHERE name = 'Burgers'), 'Butter Chicken Broasted', 100, 'Butter chicken style broasted burger', '/images/burgers/butter-chicken-broasted.jpg'),
  ((SELECT id FROM categories WHERE name = 'Burgers'), 'Double Strip Stack', 100, 'Double chicken strip stacked burger', '/images/burgers/double-strip-stack.jpg'),
  ((SELECT id FROM categories WHERE name = 'Burgers'), 'Veggie Melt Burger', 80, 'Cheesy vegetarian melt burger', '/images/burgers/veggie-melt-burger.jpg'),

  -- Neapolitan Style Pizza (9" & 12")
  ((SELECT id FROM categories WHERE name = 'Neapolitan Style Pizza'), 'Cheesy Classic Margarita (9")', 150, 'Classic cheese margherita pizza 9 inch', '/images/pizza/cheesy-classic-margarita-9.jpg'),
  ((SELECT id FROM categories WHERE name = 'Neapolitan Style Pizza'), 'Cheesy Classic Margarita (12")', 280, 'Classic cheese margherita pizza 12 inch', '/images/pizza/cheesy-classic-margarita-12.jpg'),

  ((SELECT id FROM categories WHERE name = 'Neapolitan Style Pizza'), 'Garden Fresh Farmhouse (9")', 180, 'Garden fresh veggie pizza 9 inch', '/images/pizza/garden-fresh-farmhouse-9.jpg'),
  ((SELECT id FROM categories WHERE name = 'Neapolitan Style Pizza'), 'Garden Fresh Farmhouse (12")', 300, 'Garden fresh veggie pizza 12 inch', '/images/pizza/garden-fresh-farmhouse-12.jpg'),

  ((SELECT id FROM categories WHERE name = 'Neapolitan Style Pizza'), 'Butter Chicken Special (9")', 250, 'Butter chicken topped pizza 9 inch', '/images/pizza/butter-chicken-special-9.jpg'),
  ((SELECT id FROM categories WHERE name = 'Neapolitan Style Pizza'), 'Butter Chicken Special (12")', 450, 'Butter chicken topped pizza 12 inch', '/images/pizza/butter-chicken-special-12.jpg'),

  ((SELECT id FROM categories WHERE name = 'Neapolitan Style Pizza'), 'Broasted Supreme (9")', 250, 'Loaded broasted chicken pizza 9 inch', '/images/pizza/broasted-supreme-9.jpg'),
  ((SELECT id FROM categories WHERE name = 'Neapolitan Style Pizza'), 'Broasted Supreme (12")', 450, 'Loaded broasted chicken pizza 12 inch', '/images/pizza/broasted-supreme-12.jpg'),

  ((SELECT id FROM categories WHERE name = 'Neapolitan Style Pizza'), 'Chicken Tikka Classic (9")', 250, 'Classic chicken tikka pizza 9 inch', '/images/pizza/chicken-tikka-classic-9.jpg'),
  ((SELECT id FROM categories WHERE name = 'Neapolitan Style Pizza'), 'Chicken Tikka Classic (12")', 450, 'Classic chicken tikka pizza 12 inch', '/images/pizza/chicken-tikka-classic-12.jpg'),

  ((SELECT id FROM categories WHERE name = 'Neapolitan Style Pizza'), 'The All-Star Chicken (9")', 250, 'Signature all-star chicken pizza 9 inch', '/images/pizza/all-star-chicken-9.jpg'),
  ((SELECT id FROM categories WHERE name = 'Neapolitan Style Pizza'), 'The All-Star Chicken (12")', 450, 'Signature all-star chicken pizza 12 inch', '/images/pizza/all-star-chicken-12.jpg')

  -- Pasta
  ((SELECT id FROM categories WHERE name = 'Pasta'), 'BY Special Angry Bird Pasta', 200, 'Signature spicy angry bird style pasta', '/images/pasta/by-special-angry-bird-pasta.jpg'),
  ((SELECT id FROM categories WHERE name = 'Pasta'), 'Creamy Alfredo Bliss', 200, 'Rich and creamy alfredo pasta', '/images/pasta/creamy-alfredo-bliss.jpg'),

  -- Fruit Refreshers
  ((SELECT id FROM categories WHERE name = 'Fruit Refreshers'), 'Mint Lime Refresher', 50, 'Mint and lime chilled refresher', '/images/fruit-refreshers/mint-lime-refresher.jpg'),
  ((SELECT id FROM categories WHERE name = 'Fruit Refreshers'), 'Grape / Musambi / Orange', 50, 'Fresh fruit juice selection', '/images/fruit-refreshers/grape-musambi-orange.jpg'),
  ((SELECT id FROM categories WHERE name = 'Fruit Refreshers'), 'Watermelon Wave', 50, 'Fresh watermelon cooler', '/images/fruit-refreshers/watermelon-wave.jpg'),
  ((SELECT id FROM categories WHERE name = 'Fruit Refreshers'), 'Grape Mint Fizz', 50, 'Grape juice with mint fizz', '/images/fruit-refreshers/grape-mint-fizz.jpg'),
  ((SELECT id FROM categories WHERE name = 'Fruit Refreshers'), 'Pineapple Pop', 50, 'Sweet pineapple refresher', '/images/fruit-refreshers/pineapple-pop.jpg'),
  ((SELECT id FROM categories WHERE name = 'Fruit Refreshers'), 'Fruity Fusion', 70, 'Mixed fruit refresher blend', '/images/fruit-refreshers/fruity-fusion.jpg')

-- Creamy Bliss
 ((SELECT id FROM categories WHERE name = 'Creamy Bliss'), 'Nutella Cream Bliss', 220, 'Rich nutella creamy dessert', '/images/creamy-bliss/nutella-cream-bliss.jpg'),
  ((SELECT id FROM categories WHERE name = 'Creamy Bliss'), 'KitKat Crush Cream', 220, 'KitKat infused creamy dessert', '/images/creamy-bliss/kitkat-crush-cream.jpg'),
  ((SELECT id FROM categories WHERE name = 'Creamy Bliss'), 'Mango Velvet Cream', 220, 'Smooth mango cream dessert', '/images/creamy-bliss/mango-velvet-cream.jpg'),
  ((SELECT id FROM categories WHERE name = 'Creamy Bliss'), 'Biscoff Cream Burst', 220, 'Creamy biscoff flavored dessert', '/images/creamy-bliss/biscoff-cream-burst.jpg')

-- Popping Boba
INSERT INTO menu_items (category_id, name, price, description, image_url) VALUES
  ((SELECT id FROM categories WHERE name = 'Popping Boba'), 'Cocoa Burst', 120, 'Chocolate popping boba drink', '/images/popping-boba/cocoa-burst.jpg'),
  ((SELECT id FROM categories WHERE name = 'Popping Boba'), 'Starberry Blush', 120, 'Strawberry popping boba drink', '/images/popping-boba/starberry-blush.jpg'),
  ((SELECT id FROM categories WHERE name = 'Popping Boba'), 'Sunshine Mango', 120, 'Mango popping boba drink', '/images/popping-boba/sunshine-mango.jpg'),
  ((SELECT id FROM categories WHERE name = 'Popping Boba'), 'Coffee Espresso Pop', 120, 'Coffee espresso popping boba', '/images/popping-boba/coffee-espresso-pop.jpg'),
  ((SELECT id FROM categories WHERE name = 'Popping Boba'), 'Ocean Blueberry', 120, 'Blueberry ocean popping boba', '/images/popping-boba/ocean-blueberry.jpg')


ON CONFLICT DO NOTHING;


INSERT INTO cafe_tables (table_number) VALUES (1), (2), (3), (4), (5) ON CONFLICT DO NOTHING;