<h1 align="center">
  <br>
  <img src="https://github.com/kuriofoolio/etymos/blob/working_branch/css/images/logo.png" alt="Etymos" width="150"></a>
  <br>
  <b>Etymos</b>
  <br>
  <sub><sup><b>(E-TI-MOS)</b></sup></sub>
  
</h1>

<p align="center">
  Etymos is your passport to new cultures.
  It was written from scratch and development on the project began in March 2022.
  Etymos is available on Github under the <a href="https://github.com/kuriofoolio/etymos/blob/working_branch/LICENSE.txt" target="_blank">MIT license</a>.
  <br />
</p>


# Etymos - Scrabble Word Power Enhancement

A semantic search engine for AI-generated images of African cultural elements, powered by DALL-E 3 and ChromaDB. The system generates, stores, and enables similarity-based searching of images using natural language queries.

## Features

- **AI Image Generation**: Generates high-quality images using DALL-E 3
- **Semantic Search**: Find images based on natural language descriptions
- **Similarity Scoring**: See how closely results match your search query
- **Web Interface**: User-friendly interface for searching and viewing results
- **Vector Database**: Efficient storage and retrieval using ChromaDB

## Installation

### Prerequisites

- Python 3.8 or higher
- Conda package manager
- OpenAI API key
- Chroma DB Client

### Setup

1. Create and activate a new conda environment:
```bash
conda create -n rag_venv python=<latest_python_stable_release> 
conda activate rag_venv
```

2. Install required packages:
Alternatively, create your environment and install the required packages found in environment.yml using the following commands: 
```bash
conda env create -f environment.yml
```

3. Create a `.env` file in the project root:
```bash
OPENAI_PROJECT_KEY=your_openai_api_key_here
```

## Project Structure

```
african_search_engine/
├── .env                  # Environment variables
├── app.py               # Flask backend
├── static/              # Static files
│   └── index.html       # Web interface
├── turathi_images_db/   # ChromaDB storage
└── requirements.txt     # Project dependencies
```

## Running the Application

1. Ensure your conda environment is activated:
```bash
conda activate rag_venv
```

2. Start the Flask server:
```bash
python app.py
```

3. Open your web browser and navigate to:
```
http://localhost:5000
```

## Usage

### Generating and Storing Images

```python
# Example of adding new images to the database
words_to_process = ["matatu", "ugali", "kitenge"]
ids, metadatas, documents, embeddings = process_words_batch(words_to_process)
store_batch_in_chroma(ids, metadatas, documents, embeddings)
```

### Searching Images

Through the web interface:
1. Enter your search query in the search bar
2. View results with similarity scores
3. Browse generated images and their metadata

Via Python:
```python
results = search_images_with_similarity("public transportation in Kenya", n_results=3)
```

## Current Features

1. **Image Generation**
   - High-quality image generation using DALL-E 3
   - Support for African cultural concepts and terms

2. **Vector Storage**
   - Efficient storage using ChromaDB
   - Metadata preservation
   - Base64 image storage

3. **Semantic Search**
   - Natural language queries
   - Similarity scoring
   - Fast retrieval

4. **Web Interface**
   - Clean, responsive design
   - Real-time search results
   - Loading states and error handling
   - Image display with metadata

## Future Potential

1. **Enhanced Search Features**
   - Advanced filtering options
   - Category-based browsing
   - Custom similarity thresholds
   - Multi-language support

2. **User Interface Improvements**
   - Image zooming and modal views
   - Gallery view option
   - Batch image generation
   - Download capabilities
   - User collections

3. **Database Enhancements**
   - Image versioning
   - Automatic tagging
   - Related image suggestions
   - Duplicate detection

4. **API Extensions**
   - RESTful API endpoints
   - Batch processing
   - Rate limiting
   - Authentication

5. **Cultural Features**
   - Cultural context annotations
   - Historical information integration
   - Regional categorization
   - Cultural accuracy scoring

6. **Performance Optimization**
   - Caching layer
   - Image compression
   - Parallel processing
   - Query optimization

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for DALL-E 3
- ChromaDB team for the vector database
- Flask team for the web framework
