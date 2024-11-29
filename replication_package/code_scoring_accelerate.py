#!/usr/bin/env python
# coding: utf-8

import subprocess
import os
import TSED
import torch
from scipy.spatial.distance import cosine
import tiktoken
enc = tiktoken.encoding_for_model("gpt-4")
import json
import numpy as np
from sklearn.metrics import roc_curve, auc, accuracy_score, precision_score, recall_score
import matplotlib.pyplot as plt
from tqdm import tqdm  # Import tqdm for the progress bar
import pandas as pd
import logging
import argparse
from transformers import AutoModel, AutoTokenizer

# Set the device to GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Load the tokenizer and model, and move the model to the device
tokenizer = AutoTokenizer.from_pretrained("princeton-nlp/sup-simcse-roberta-large")
model = AutoModel.from_pretrained("princeton-nlp/sup-simcse-roberta-large").to(device)
model.eval()  # Set model to evaluation mode

def string_similarity(first, second):
    output = subprocess.check_output(["node", "string-similarity-wrapper.js", first, second], universal_newlines=True)
    score = float(output.split(" ")[-1])
    return score

def classify_package_batch(batch_items, strategy='simcse'):
    batch_labels = []
    batch_avg_scores = []

    if strategy == 'simcse':
        texts = []
        code_indices = []
        rewrite_indices = []

        for idx, item in enumerate(batch_items):
            # Get the label (1 for machine, 0 for human)
            label = 1 if item['writer'] == 'machine' else 0
            batch_labels.append(label)

            code_index = len(texts)
            texts.append(item['code'])
            code_indices.append(code_index)
            rewrite_indices_item = []
            for rewrite in item['rewrite']:
                rewrite_index = len(texts)
                texts.append(rewrite)
                rewrite_indices_item.append(rewrite_index)
            rewrite_indices.append(rewrite_indices_item)

        # Tokenize all texts
        inputs = tokenizer(texts, padding=True, truncation=True, return_tensors="pt")
        inputs = inputs.to(device)
        with torch.no_grad():
            embeddings = model(**inputs, output_hidden_states=True, return_dict=True).pooler_output

        for i in range(len(batch_items)):
            code_emb = embeddings[code_indices[i]]
            rewrite_embs = embeddings[rewrite_indices[i]]  # Shape: [num_rewrites_i, hidden_size]
            if rewrite_embs.size(0) == 0:
                # Handle case with no rewrites
                avg_score = 0.0
            else:
                sim_scores = torch.nn.functional.cosine_similarity(
                    code_emb.unsqueeze(0).expand(rewrite_embs.size(0), -1),
                    rewrite_embs, dim=1
                )
                avg_score = sim_scores.mean().item()
            batch_avg_scores.append(avg_score)

    else:
        # For 'string' and 'tsed' strategies, batch processing is not implemented
        print('ERROR. Invalid Strategy or not implemented for batch processing: "' + strategy + '"')
        return [], []

    return batch_labels, batch_avg_scores

def scoring_process(strategy='simcse', data=[], batch_size=32):
    # Initialize lists to collect labels and scores
    labels = []
    scores = []

    # Process data in batches
    num_items = len(data)
    for batch_start in tqdm(range(0, num_items, batch_size), desc="Processing items in batches"):
        batch_items = data[batch_start:batch_start+batch_size]
        # Process batch_items
        batch_labels, batch_scores = classify_package_batch(batch_items, strategy)
        labels.extend(batch_labels)
        scores.extend(batch_scores)

    # Convert lists to numpy arrays for compatibility
    labels = np.array(labels)
    scores = np.array(scores)

    # Compute ROC curve and AUC
    fpr, tpr, thresholds = roc_curve(labels, scores)
    roc_auc = auc(fpr, tpr)

    # Find the optimal threshold (Youden's J statistic)
    J = tpr - fpr
    ix = np.argmax(J)
    optimal_threshold = thresholds[ix]
    print(f"Optimal Threshold: {optimal_threshold}")

    # Binarize the scores using the optimal threshold
    predicted_labels = (scores >= optimal_threshold).astype(int)

    # Compute accuracy, precision, and recall
    accuracy = accuracy_score(labels, predicted_labels)
    precision = precision_score(labels, predicted_labels)
    recall = recall_score(labels, predicted_labels)

    return roc_auc, accuracy, precision, recall

if __name__ == "__main__":
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description='Process datasets for zero-shot classification.')
    parser.add_argument('--input_folder', type=str, required=True,
                        help='Input folder containing JSON files.')
    parser.add_argument('--output_folder', type=str, required=True,
                        help='Output folder to save CSV results.')
    args = parser.parse_args()

    # Directory containing the JSON files
    directory_path = args.input_folder
    detector_llm = os.path.basename(directory_path)

    print(f"Start working on datasets in the '{detector_llm}' directory.")

    # Initialize an empty list to store the combined data
    data_list = []

    # Iterate over all JSON files in the directory
    for filename in os.listdir(directory_path):
        if filename.endswith('.json'):  # Process only JSON files
            file_path = os.path.join(directory_path, filename)
            with open(file_path, 'r') as file:
                file_data = json.load(file)  # Load JSON content
                data_list.append({
                    'data': file_data, 
                    'dataset': os.path.splitext(filename)[0]  # Extract filename without extension
                })

    rows = []
    for item in data_list:
        print(f"Processing dataset '{item['dataset']}'...")
        # Unpack the metrics returned by scoring_process
        roc_auc, accuracy, precision, recall = scoring_process(strategy='simcse', data=item['data'], batch_size=32)
        
        # Format the numbers to 2 decimal places
        roc_auc_str = f"{roc_auc:.2f}"
        accuracy_str = f"{accuracy:.2f}"
        precision_str = f"{precision:.2f}"
        recall_str = f"{recall:.2f}"

        # Prepare the dataset name as per original code
        dataset_name = '_'.join(item['dataset'].split('_')[1:3])

        # Prepare the row with all metrics
        row = {
            "dataset": dataset_name,
            f"AUC_{detector_llm}": roc_auc_str,
            f"Accuracy_{detector_llm}": accuracy_str,
            f"Precision_{detector_llm}": precision_str,
            f"Recall_{detector_llm}": recall_str
        }
        rows.append(row)

    # Create a DataFrame from the rows
    df = pd.DataFrame(rows)

    # Ensure the output folder exists
    output_folder = args.output_folder
    os.makedirs(output_folder, exist_ok=True)

    # Save the DataFrame to CSV
    output_csv_path = os.path.join(output_folder, f"{detector_llm}_output.csv")
    df.to_csv(output_csv_path, index=False)
    
    print(f"Results saved to '{output_csv_path}'.")
