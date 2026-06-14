from pymongo import MongoClient
from bson.decimal128 import Decimal128
from datetime import datetime, timedelta
import json

client = MongoClient("mongodb://localhost:27017")
db = client["equivale"]

def days_ago(n):
    return datetime.utcnow() - timedelta(days=n)

def D(s):
    return Decimal128(s)

# Clear existing data
for col in ["users", "products", "services", "communities", "transactions", "reviews"]:
    db[col].delete_many({})
    print(f"Cleared {col}")

# Load seed data
with open("seed_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

now = datetime.utcnow()

# Insert users
users = []
for u in data["users"]:
    users.append({
        "_id": u["id"], "Name": u["name"], "Email": u["email"],
        "PasswordHash": "$2a$11$placeholder_hash", "AvatarUrl": None,
        "Bio": u["bio"], "Role": u["role"], "WalletBalance": Decimal128(str(u["wallet"])),
        "CreatedAt": days_ago(u["days"]), "UpdatedAt": now
    })
db.users.insert_many(users)
print(f"OK {len(users)} users")

# Insert products
products = []
for p in data["products"]:
    products.append({
        "_id": p["id"], "SellerId": p["seller"], "Title": p["title"],
        "Description": p["desc"], "Category": p["category"],
        "PriceInEquivale": Decimal128(str(p["price"])), "Images": [],
        "Status": 0, "CreatedAt": days_ago(p["days"]), "UpdatedAt": days_ago(p["days"])
    })
db.products.insert_many(products)
print(f"OK {len(products)} products")

# Insert services
services = []
for s in data["services"]:
    h, m = s["dur"].split(":")
    services.append({
        "_id": s["id"], "ProviderId": s["provider"], "Title": s["title"],
        "Description": s["desc"], "Category": s["category"],
        "PriceInEquivale": Decimal128(str(s["price"])),
        "Duration": str(timedelta(hours=int(h), minutes=int(m))),
        "Location": s["location"], "Status": 0,
        "CreatedAt": days_ago(s["days"]), "UpdatedAt": days_ago(s["days"])
    })
db.services.insert_many(services)
print(f"OK {len(services)} services")

# Insert communities
communities = []
for c in data["communities"]:
    communities.append({
        "_id": c["id"], "Name": c["name"], "Description": c["desc"],
        "BannerUrl": None, "CreatorId": c["creator"],
        "Members": c["members"],
        "CreatedAt": days_ago(c["days"]), "UpdatedAt": days_ago(c["days2"])
    })
db.communities.insert_many(communities)
print(f"OK {len(communities)} communities")

# Insert transactions
transactions = []
for t in data["transactions"]:
    transactions.append({
        "_id": t["id"], "FromUserId": t["from"], "ToUserId": t["to"],
        "Amount": Decimal128(str(t["amount"])),
        "Description": t["desc"], "TransactionType": t["type"],
        "RelatedItemId": t.get("item"), "CreatedAt": days_ago(t["days"])
    })
db.transactions.insert_many(transactions)
print(f"OK {len(transactions)} transactions")

# Insert reviews
reviews = []
for r in data["reviews"]:
    reviews.append({
        "_id": r["id"], "ReviewerId": r["reviewer"], "TargetUserId": r["target"],
        "ItemId": r["item"], "ItemType": r["type"], "Rating": r["rating"],
        "Comment": r["comment"], "CreatedAt": days_ago(r["days"])
    })
db.reviews.insert_many(reviews)
print(f"OK {len(reviews)} reviews")

# Summary
print("\n=== SEED COMPLETE ===")
for col_name in ["users", "products", "services", "communities", "transactions", "reviews"]:
    print(f"  {col_name}: {db[col_name].count_documents({})}")
print("====================")
