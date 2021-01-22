#!/usr/bin/env python
from backend import db
from sqlalchemy.sql import text

db.create_all()
db.engine.execute(" SET @schema='data'")
db.engine.execute(text(open("backend/datainit/alimentation.sql").read())) 


print("Tables created and test data added")