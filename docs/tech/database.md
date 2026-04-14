🧠 First principle (very important)

👉 Your database is operational, not analytical

So:

Normalize enough → avoid duplication
Keep queries simple → SQLite-friendly
Avoid “enterprise schema madness”
🧱 Database Design Strategy

We’ll structure around real-world flows, not abstractions:

Core flows:
People contribute → subscriptions + transactions
System calculates → allocations
Partners distribute → distributions
Families receive → beneficiary_receipts
📦 Full Database Document

You can drop this directly into your repo as:

/docs/database.md

# 🐝 Colmeia Network — Database Design

---

# 1. 🎯 Objective

Define a simple, scalable, and explicit relational database structure using Turso (libSQL).

The schema is designed to:

- support operational workflows
- remain easy to query
- scale without major refactors

---

# 2. 🧠 Design Principles

- Simple > clever
- Explicit relationships
- Avoid premature abstraction
- Optimize for reads + clarity
- Keep writes predictable

---

# 3. 🧩 Core Entities Overview

| Domain          | Tables |
|----------------|--------|
| Users          | users |
| Payments       | subscriptions, transactions |
| Partners       | partners |
| Beneficiaries  | beneficiaries |
| Distribution   | distributions, distribution_items |
| Tracking       | receipts |

---

# 4. 👤 USERS

Represents contributors and admins.

```sql
users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user', -- user | admin
  created_at DATETIME,
  updated_at DATETIME
)

5. 💳 SUBSCRIPTIONS

Monthly contributions.

subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT, -- active | paused | canceled
  started_at DATETIME,
  canceled_at DATETIME,

  FOREIGN KEY (user_id) REFERENCES users(id)
)

6. 💰 TRANSACTIONS

Actual money events.

transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  subscription_id TEXT,
  amount INTEGER NOT NULL,
  status TEXT, -- pending | completed | failed
  provider TEXT,
  created_at DATETIME,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
)

7. 🤝 PARTNERS

Local distribution entities.

partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT,
  contact_info TEXT,
  capacity INTEGER,
  created_at DATETIME
)

8. 👥 BENEFICIARIES

Families receiving aid.

beneficiaries (
  id TEXT PRIMARY KEY,
  name TEXT,
  document_id TEXT,
  region TEXT,
  household_size INTEGER,
  status TEXT, -- pending | approved | rejected
  created_at DATETIME
)

9. 📦 DISTRIBUTIONS

Represents a batch of food distribution.

distributions (
  id TEXT PRIMARY KEY,
  partner_id TEXT,
  total_baskets INTEGER,
  status TEXT, -- planned | dispatched | completed
  created_at DATETIME,

  FOREIGN KEY (partner_id) REFERENCES partners(id)
)

10. 📦 DISTRIBUTION ITEMS

Links beneficiaries to a distribution.

distribution_items (
  id TEXT PRIMARY KEY,
  distribution_id TEXT,
  beneficiary_id TEXT,
  status TEXT, -- pending | delivered

  FOREIGN KEY (distribution_id) REFERENCES distributions(id),
  FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id)
)

11. 🧾 RECEIPTS (PROOF OF DELIVERY)

Confirms delivery.

receipts (
  id TEXT PRIMARY KEY,
  distribution_item_id TEXT,
  confirmed_by TEXT,
  notes TEXT,
  created_at DATETIME,

  FOREIGN KEY (distribution_item_id) REFERENCES distribution_items(id)
)

12. 🔄 DATA FLOW
Contribution Flow

users → subscriptions → transactions

Distribution Flow

transactions → distributions → distribution_items → receipts

13. 📊 DERIVED LOGIC (NOT STORED)

Avoid storing calculated values.

Compute:

total funds available
number of baskets possible
partner allocation
14. ⚡ INDEXES (IMPORTANT)
CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);

CREATE INDEX idx_partners_region ON partners(region);

CREATE INDEX idx_beneficiaries_region ON beneficiaries(region);
CREATE INDEX idx_beneficiaries_status ON beneficiaries(status);

CREATE INDEX idx_distributions_partner ON distributions(partner_id);

CREATE INDEX idx_distribution_items_distribution ON distribution_items(distribution_id);
CREATE INDEX idx_distribution_items_beneficiary ON distribution_items(beneficiary_id);

15. ⚠️ RULES
No business logic in DB
No complex triggers
No premature denormalization
No JSON blobs for core data
16. 🧭 FUTURE EXTENSIONS

When needed:

Add tables:
regions (normalize geography)
audit_logs
notifications
inventory (if managing stock)
17. 🧠 FINAL PRINCIPLE

The database should:

reflect real-world operations
be easy to reason about
be hard to misuse

If it's hard to explain, it's wrong.


---

# 🧠 Why this structure works (important insight)

This model gives you:

✅ Clear flow of money → food → people  
✅ Easy reporting (transparency page)  
✅ Clean partner-based distribution  
✅ No over-engineering  
✅ Easy future expansion  

---

