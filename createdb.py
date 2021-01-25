#!/usr/bin/env python
from backend import db
from sqlalchemy.sql import text

db.create_all()

with open('backend/datainit/demo.sql') as f:
  #sql = f.read().replace(':schema', app.config['SCHEMA'])
  sql = f.read()
  db.engine.execute(text(sql))


print("Tables created in database")