import os
import tempfile
import requests

import pytest

from flask import app

def test_api_level_001():
     response = requests.get("http://localhost:5000/api/level/")
     assert response.status_code == 200

def test_api_level_002():
     response = requests.get("http://localhost:5000/api/level/")
     assert response.headers["Content-Type"] == "application/json"

def test_api_level_003():
     response = requests.get("http://localhost:5000/api/level/")
     response_body = response.json()
     assert response_body["response"] == "success"

def test_api_level_004():
     response = requests.get("http://localhost:5000/api/level/")
     response_body = response.json()
     assert response_body["levels"][0] == "epci"
     assert response_body["levels"][1] == "ecluse" 

def test_api_level_005():
     response = requests.get("http://localhost:5000/api/level/")
     response_body = response.json()
     assert len(response_body["levels"]) == 2
