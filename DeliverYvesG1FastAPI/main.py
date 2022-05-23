from fastapi import FastAPI
from pydantic import BaseModel
from io import BytesIO
import pickle
import requests
import numpy as np
from datetime import datetime
import json

# The class InputData is a subclass of BaseModel. It has 8 attributes: RackId, Row, DistMinH,
# DistMaxH, DistAvgH, DistMinL, DistMaxL, and DistTime


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
    """
    It downloads the model from GitHub and loads it into the variable model
    """
    mLink = 'https://github.com/DeWildeDaan/DeliverYvesG1-MCTS4/blob/AI/FinalAIModel/finalized_model.pkl?raw=true'
    mfile = BytesIO(requests.get(mLink).content)
    global model
    model = pickle.load(mfile)


def predict_position(input):
    """
    The function takes in a single input, which is a dataframe with the following columns: DistMinH,
    DistMaxH, DistAvgH, DistMinL, DistMaxL, DistAvgL, DistTime, RackId, Row, and then it returns a
    single output, which is a dataframe with the following columns: RackId, Row, and Position

    Args:
      input: 

    Returns:
      The predicted position of a bottle taken from the rack.
    """
    global model
    if model:
        data = np.array([[input.DistMinH, input.DistMaxH, input.DistAvgH, input.DistMinL,
                        input.DistMaxL, input.DistAvgL, input.DistTime, 0.9978, 3.51, 0.58, 9.4]])
        result = model.predict(data)
        return post_prediction(input.RackId, input.Row, result)
    else:
        return 0


def post_prediction(rack_id, row, position):
    """
    It takes in the rack ID, row, and position of a rack, and sends a POST request to the API with the
    data

    Args:
      rack_id: The rack ID of the rack you want to predict
      row: The row of the rack
      position: The position of the rack in the warehouse.

    Returns:
      The status code of the request.
    """
    url = 'https://deliveryevesg1minimalapi.livelygrass-d3385627.northeurope.azurecontainerapps.io/prediction'
    prediction = {"RackId": str(rack_id), "Row": int(
        row), "Position": int(position)}
    headers = {'Content-type': 'application/json'}
    r = requests.post(url, data=json.dumps(prediction), headers=headers)
    return r.status_code


app = FastAPI()
load_model()


@app.get("/")
async def read_root():
    """
    It returns a dictionary with a key of "Status" and a value of "alive" and the current date and time

    Returns:
      A dictionary with a key of "Status" and a value of "alive" and the current time.
    """
    return {"Status": f"alive {datetime.now()}"}


@app.get("/reload")
async def reload():
    """
    It loads the model and returns the current time

    Returns:
      The reload function is returning a dictionary with the key "Reloaded" and the value of the current
    time.
    """
    load_model()
    return {"Reloaded": datetime.now()}


@app.post("/predict")
async def predict(input: InputData):
    """
    It takes an input, calls the predict_position function, and returns the result

    Args:
      input (InputData): InputData - This is the input data that will be passed to the function.

    Returns:
      The status code of the prediction and the current time.
    """
    return f"Statuscode: {predict_position(input)} ({datetime.now()})"
