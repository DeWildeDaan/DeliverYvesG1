from typing import Union
from xmlrpc.client import DateTime
from fastapi import FastAPI
from pydantic import BaseModel
from io import BytesIO
import pickle
from pyexpat import model
import requests
from yaml import load
from sklearn.linear_model import LinearRegression
import numpy as np
from sklearn.preprocessing import StandardScaler
from datetime import datetime
import json

class InputData(BaseModel):
    RackId: str
    Row: int
    DistMinH: float
    DistMaxH: float
    DistAvgH: float
    DistMinL: float
    DistMaxL: float
    DistAvgL: float
    DistTime: float


def load_model():
    mLink = 'https://github.com/DeWildeDaan/DeliverYvesG1-MCTS4/blob/API-SAMPLEDATA/DeliverYvesG1API/DeliverYvesG1API/MLModels/finalized_model.pkl?raw=true'
    mfile = BytesIO(requests.get(mLink).content)
    global model
    model = pickle.load(mfile)
    
def predict_position(input):
    global model
    if model:
        data = np.array([[input.DistMinH, input.DistMaxH, input.DistAvgH, input.DistMinL, input.DistMaxL, input.DistAvgL, input.DistTime, 0.9978, 3.51, 0.58, 9.4]])
        result = model.predict(data)
        return post_prediction(input.RackId, input.Row, result)
    else:
        return 0

def post_prediction(rack_id, row, position):
    url = 'https://deliveryevesg1minimalapi.livelygrass-d3385627.northeurope.azurecontainerapps.io/prediction'
    prediction = {"RackId": str(rack_id), "Row": int(row), "Position": int(position)}
    headers = {'Content-type': 'application/json'}
    r = requests.post(url, data=json.dumps(prediction), headers=headers)
    return r.status_code

app = FastAPI()
load_model()


@app.get("/")
async def read_root():
    return {"Status": f"alive"}

@app.get("/reload")
async def reload():
    load_model()
    return {"Reloaded": datetime.now()}

@app.post("/predict")
async def predict(input: InputData):
    return f"Statuscode: {predict_position(input)} ({datetime.now()})"