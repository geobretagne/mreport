import os
import tempfile
import requests
from sqlalchemy.exc import NoInspectionAvailable
from sqlalchemy import inspect, func
import shutil, glob, json, os
import logging

import pytest

from flask import app

def test_getPictos():
    style = []
    for filepath in glob.iglob('frontend/static/picto/**/*.svg', recursive=True):
        filename = os.path.basename(filepath)
        folder =  os.path.basename(os.path.dirname(filepath))
        (file, ext) = os.path.splitext(filename)
        style.append({"id": "icon-" + folder + "-" + file, "folder": folder, "url": filepath.replace("frontend","")})
        logging.warning(style)
    return style

def test_getPictos_returns_array():
  assert len(test_getPictos()) != 0