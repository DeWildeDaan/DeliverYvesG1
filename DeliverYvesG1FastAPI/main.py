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

class InputData(BaseModel):
    DistMinH: float
    DistMaxH: float
    DistAvgH: float
    DistMinL: float
    DistMaxL: float
    DistAvgL: float
    DistTime: float
    Position: Union[int, None] = None

class OutputData(BaseModel):
    Position: int


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
        return result
    else:
        return 0


app = FastAPI()
load_model()


@app.get("/")
async def read_root():
    return {"Status": f"alive {datetime.now()}"}

@app.get("/reload")
async def reload():
    load_model()
    return {"Reloaded": datetime.now()}

@app.post("/predict", response_model=OutputData)
async def predict(input: InputData):
    input.Position = predict_position(input)
    return input