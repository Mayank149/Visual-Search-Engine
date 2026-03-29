from fastapi import FastAPI, UploadFile, File
from fastapi.staticfiles import StaticFiles
import numpy as np
import faiss
import pickle
import torch
from torchvision import transforms
from torchvision import models
from PIL import Image
import io

app = FastAPI()
app.mount("/images", StaticFiles(directory="dataset/images"), name="images")
index = faiss.read_index("faiss_index.bin")
with open("image_paths.pkl", "rb") as f:
    image_paths = pickle.load(f)

model = models.resnet50(pretrained = True)
model = torch.nn.Sequential(*list(model.children())[:-1])
model.eval()

transform = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean = [0.485, 0.456, 0.405],
        std = [0.229, 0.224, 0.229]
    )
])

@app.get("/")
def home():
    return {"message" : "API is running"}

def get_embedding(image):
    image = transform(image).unsqueeze(0)
    with torch.no_grad():
        embedding = model(image)
    return embedding.squeeze().numpy().astype("float32")

@app.post("/search")
async def search(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")

    query_vector = get_embedding(image)
    query_vector = np.expand_dims(query_vector, axis = 0)

    k = 5
    distances, indices = index.search(query_vector, k)

    results = [f"http://127.0.0.1:8000/images/{image_paths[i].split("/")[-1]}" for i in indices[0]]

    return {"results" : results}

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)