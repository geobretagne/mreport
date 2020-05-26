#!/usr/bin/env python
from app import db
db.create_all()
print("Database created")