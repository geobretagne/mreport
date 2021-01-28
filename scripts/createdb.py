#!/usr/bin/env python
import sys
sys.path.append("..")
from backend import db

db.create_all()
print("Tables created in database")