#!/usr/bin/env python
from app import db
db.drop_all()
print("Database dropped")