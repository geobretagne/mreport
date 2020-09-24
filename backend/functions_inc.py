from sqlalchemy.exc import NoInspectionAvailable
from sqlalchemy import inspect, func
import shutil, glob, json, os
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

def updateReportHTML(src, html, css, composer):
    try:
        f1 = open(src + '.html', 'w')
        f1.write(html)
        f1.close()
        f2 = open(src + '.css', 'w')
        f2.write(css)
        f2.close()
        f3 = open(src + '_composer.html', 'w')
        f3.write(composer)
        f3.close()
        return 'success'
    except IOError as e:
        return "I/O error({0}): {1}".format(e.errno, e.strerror)
def get_count(q):
    count_q = q.statement.with_only_columns([func.count()]).order_by(None)
    count = q.session.execute(count_q).scalar()
    return count+1

def getPictos():
    style = []
    for filepath in glob.iglob('frontend/static/picto/**/*.svg', recursive=True):
        filename = os.path.basename(filepath)
        folder =  os.path.basename(os.path.dirname(filepath))
        (file, ext) = os.path.splitext(filename)
        style.append({"id": "icon-" + folder + "-" + file, "folder": folder, "url": filepath.replace("frontend","")})
    return style