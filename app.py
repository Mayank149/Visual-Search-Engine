from fastapi import FastAPI
import torch
from torchvision import transforms
from PIL import Image


app = FastAPI()

@app.get("/")
def home():
    return {"message" : "API is running"}

