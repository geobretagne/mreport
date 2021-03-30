import os
import tempfile
import requests

import pytest

from flask import app

def test_get_levels_check_status_code_equals_200():
     response = requests.get("http://localhost:5000/api/store/")
     assert response.status_code == 200

def test_get_locations_for_us_90210_check_content_type_equals_json():
     response = requests.get("http://localhost:5000/api/store/")
     assert response.headers["Content-Type"] == "application/json"

def test_get_levels_check_response_equals_sucess():
     response = requests.get("http://localhost:5000/api/store/")
     response_body = response.json()
     assert response_body["response"] == "success"