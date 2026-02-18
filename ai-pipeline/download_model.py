from huggingface_hub import hf_hub_download
import shutil
import os

print("⏳ Téléchargement du modèle YOLO DocLayNet...")

# On télécharge le fichier 'best.pt' du repo Hugging Face
model_path = hf_hub_download(
    repo_id="keremberke/yolov8m-document-layout", filename="best.pt"
)

# On le renomme et le déplace à la racine pour faire propre
destination = "yolov8m-doclaynet.pt"
shutil.copy(model_path, destination)

print(f"✅ Modèle téléchargé avec succès : {destination}")
