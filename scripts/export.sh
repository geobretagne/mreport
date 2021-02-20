#!/bin/bash
PORT=5432
SCHEMA=data
DBSOURCE=dataviz
DBTEMP=dataviz_demo
WKS=/tmp
USER=dataviz_user


reports=()
for arg; do
   reports+=($arg)
done

expr=$(printf ",\'%s\'" "${reports[@]}")
expr=${expr:1}

echo "Export des rapports $expr"

cd $WKS

# 1 - Create text files with copy command to extract selected data reports 
psql -p $PORT -d $DBSOURCE -f $WKS/export.sql --set "expr=$expr"

# 2 dump database tructure only
pg_dump -f $WKS/dump.sql -p $PORT -d $DBSOURCE --schema-only -n $SCHEMA

#Création base démo
createdb -p $PORT -O $USER $DBTEMP -T template0 -E 'UTF8'

# import dump in db
psql -p $PORT -d $DBTEMP -f $WKS/dump.sql

#copy data
psql -p $PORT -d $DBTEMP -c "\copy data.level_type FROM '$WKS/level_type.txt' with delimiter ';';"
psql -p $PORT -d $DBTEMP -c "\copy data.dataid FROM '$WKS/dataid.txt' with delimiter ';';"
psql -p $PORT -d $DBTEMP -c "\copy data.dataviz FROM '$WKS/dataviz.txt' with delimiter ';';"
psql -p $PORT -d $DBTEMP -c "\copy data.rawdata FROM '$WKS/rawdata.txt' with delimiter ';'"
psql -p $PORT -d $DBTEMP -c "\copy data.report FROM '$WKS/report.txt' with delimiter ';';"
psql -p $PORT -d $DBTEMP -c "\copy data.report_composition FROM '$WKS/report_composition.txt' with delimiter ';';"

# 2 dump database with data
pg_dump -f $WKS/demo.sql -p $PORT -d $DBTEMP -n data

# Replace dump user by dataviz user of your installation
sed -i "s/$USER/:user/g" $WKS/demo.sql

# Replace dump schema by schema of your installation

sed -i "s/SCHEMA $SCHEMA/SCHEMA :schema/g" $WKS/demo.sql
sed -i "s/ $SCHEMA\./ :schema\./g" $WKS/demo.sql
