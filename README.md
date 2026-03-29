# Visual Search Engine

An AI-powered visual search application that finds similar images using deep learning embeddings and semantic similarity.

**Built by:** Mayank Bansal, Arnav Godara

---

## Overview

Visual Search Engine is a web application that allows users to upload an image and instantly discover visually similar images from a database. Powered by ResNet50 neural networks and FAISS similarity search, it provides fast and accurate results without relying on text-based queries.

### Key Features

- **Drag & Drop Interface** - Intuitive, user-friendly design
- **Real-time Search** - Get results in seconds using efficient FAISS indexing
- **Deep Learning** - ResNet50 pre-trained model for feature extraction
- **Semantic Similarity** - Find images based on visual content, not metadata
- **Responsive Design** - Works seamlessly across devices

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Backend** | FastAPI (Python) |
| **ML Model** | ResNet50 (PyTorch) |
| **Search Engine** | FAISS (Facebook AI Similarity Search) |
| **Frontend** | HTML, CSS, JavaScript |
| **Database** | Pre-computed embeddings (NumPy) |

---

## Project Structure

```
Visual Search Engine/
├── app.py                 # FastAPI server & API endpoints
├── index.html             # Frontend interface
├── script.js              # Client-side logic
├── style.css              # UI styling
├── dataset/
│   └── images/            # Database of 1000+ images
├── embeddings.npy         # Pre-computed image embeddings
├── faiss_index.bin        # FAISS index for similarity search
└── image_paths.pkl        # Image file paths mapping
```

---

## How It Works

1. **Image Upload** → User uploads an image via the web interface
2. **Feature Extraction** → ResNet50 generates a 2048-dimensional embedding
3. **Similarity Search** → FAISS finds the 5 most similar images in the index
4. **Results Display** → Matching images are displayed in the UI

---

## Getting Started

### Prerequisites

- Python 3.7+
- Required packages (see below)

### Installation

1. **Clone or Download** this repository

2. **Install Dependencies**
   ```bash
   pip install fastapi uvicorn torch torchvision pillow numpy faiss-cpu
   ```

3. **Run the Server**
   ```bash
   python app.py
   ```
   The server will start at `http://127.0.0.1:8000`

4. **Access the Application**
   - Open `index.html` in your browser or navigate to the server URL

---

## API Endpoints

### GET `/`
Returns API status
```
Response: {"message": "API is running"}
```

### POST `/search`
Search for similar images
- **Input**: Image file (JPG, PNG, WEBP)
- **Output**: JSON with 5 most similar image URLs
```json
{
  "results": [
    "http://127.0.0.1:8000/images/image1.jpg",
    "http://127.0.0.1:8000/images/image2.jpg",
    ...
  ]
}
```

---

## Features Explained

### ResNet50 Model
Pre-trained deep neural network that extracts high-level visual features (2048 dimensions) from images, capturing semantic meaning.

### FAISS Indexing
Efficiently searches millions of vectors to find the most similar embeddings using optimized approximate nearest neighbor search.

### CORS Support
Enabled for cross-origin requests, allowing the frontend to communicate with the backend seamlessly.

---

## Usage Example

1. Open the application in your browser
2. Click the upload box or drag & drop an image
3. Wait for processing (typically 1-2 seconds)
4. View the 5 most visually similar images from the database

---

## Future Enhancements

- [ ] Support for different ML models (VGG16, EfficientNet, Vision Transformers)
- [ ] Database management UI for adding/removing images
- [ ] Advanced filtering and sorting options
- [ ] User authentication and saved searches
- [ ] Performance optimization for larger datasets
- [ ] Mobile app version

---

## License

This project is for educational and research purposes.

---

**Last Updated:** 2026
