from sqlalchemy.exc import NoInspectionAvailable
from sqlalchemy import inspect
import shutil
## Use for (select *) from a single table ex : {'datavizs': json.loads(json.dumps([row2dict(r) for r in result]))}
def row2dict(row,label="null"):
    d = {}
    try:
        inspect(row)
        if(row.__table__.columns):
            for column in row.__table__.columns:
                nonecheck = str(getattr(row, column.name))
                if nonecheck == 'None':
                    nonecheck = ''
                d[column.name] = nonecheck
    except NoInspectionAvailable:
        d[label]=row
    return d

## Use for (select atr1,atr2 ...) ex : {'reports': json.loads(json.dumps(dict_builder(result)))}.
def dict_builder(result):
    dlist = []
    for r in result:
        d={}
        res = r._asdict()
        for key in res:
            d.update(row2dict(res[key],key))
        dlist.append(d)
    return dlist

def insertdb(file,schema):
    fd = open(file, 'r')
    sqlFile = fd.read()
    fd.close()
    sqlFile = sqlFile.replace("schema.",schema)
    return sqlFile

def createFileSystemStructure(src, dest):
    try:
        shutil.copytree(src, dest)
        return 'success'
    # Directories are the same
    except shutil.Error as e:
        return 'Directory not copied. Error: %s' % e
    # Any error saying that the directory doesn't exist
    except OSError as e:
        return 'Directory not copied. Error: %s' % e

def deleteFileSystemStructure(src):
    try:
        shutil.rmtree(src)
        return 'success'
    except IOError as e:
        return "I/O error({0}): {1}".format(e.errno, e.strerror)

def updateReportHTML(src, html):
    try:
        f = open(src, 'w')
        f.write(html)
        f.close()
        return 'success'
    except IOError as e:
        return "I/O error({0}): {1}".format(e.errno, e.strerror)
