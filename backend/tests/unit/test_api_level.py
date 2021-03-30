import os
import tempfile
import requests

import pytest

from flask import app

def test_tu_001():
     response = requests.get("http://localhost:5000/api/level/")
     assert response.status_code == 200

def test_tu_002():
     response = requests.get("http://localhost:5000/api/level/")
     assert response.headers["Content-Type"] == "application/json"

def test_tu_003():
     response = requests.get("http://localhost:5000/api/level/")
     response_body = response.json()
     assert response_body["response"] == "success"

def test_tu_004():
     response = requests.get("http://localhost:5000/api/level/")
     response_body = response.json()
     assert response_body["levels"][0] == "ecluse\n"
     assert response_body["levels"][1] == "epci" 

def test_tu_005():
     response = requests.get("http://localhost:5000/api/level/")
     response_body = response.json()
     assert len(response_body["levels"]) == 2
