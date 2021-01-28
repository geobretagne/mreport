#!/usr/bin/env python
import sys
sys.path.append("..")
from backend import db
from backend import Rawdata, Dataid, Report_composition, Report, Dataviz

for table in [Rawdata, Dataid, Report_composition, Report, Dataviz]:
  db.session.query(table).delete()

db.session.commit()