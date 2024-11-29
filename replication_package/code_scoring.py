#!/usr/bin/env python
# coding: utf-8


import subprocess
import os
import TSED
import torch
from scipy.spatial.distance import cosine
import tiktoken
enc = tiktoken.encoding_for_model("gpt-4")
import os
from openai import OpenAI
import json
import numpy as np
from sklearn.metrics import roc_curve, auc, accuracy_score, precision_score, recall_score
import matplotlib.pyplot as plt
from tqdm import tqdm  # Import tqdm for the progress bar
import pandas as pd
import logging
import argparse



from transformers import AutoModel, AutoTokenizer
# Import our models. The package will take care of downloading the models automatically
tokenizer = AutoTokenizer.from_pretrained("princeton-nlp/sup-simcse-roberta-large")
model = AutoModel.from_pretrained("princeton-nlp/sup-simcse-roberta-large")



def string_similarity(first, second):
	output = subprocess.check_output(["node", "string-similarity-wrapper.js", first, second], universal_newlines=True)
	
	score = float(output.split(" ")[-1])
	return score

def classify_package(item, num_rewrites, strategy):
	texts = [item['code']]
	texts.extend(item['rewrite'])

	sim_scores = []

	if strategy == 'simcse':
		inputs = tokenizer(texts, padding=True, truncation=True, return_tensors="pt")
		with torch.no_grad():
			embeddings = model(**inputs, output_hidden_states=True, return_dict=True).pooler_output

		for i in range(num_rewrites):
			sim = 1 - cosine(embeddings[0], embeddings[i+1])
			sim_scores.append(sim)

	elif strategy == 'string':
		for i in range(num_rewrites):
			sim = string_similarity(texts[0], texts[i+1])
			sim_scores.append(sim)

	elif strategy == 'tsed':
		for i in range(num_rewrites):
			sim = TSED.Calculate("python", texts[0], texts[i+1], 1.0, 0.8, 1.0)
			sim_scores.append(sim)
	else:
		print('ERROR. Invalid Strategy: "' + strategy + '"')
		return []

	return sim_scores


def scoring_process(strategy='simcse', data=[]):
    # Initialize lists to collect labels and scores
    labels = []
    scores = []

    # Choose the strategy for similarity computation
    strategy = strategy  # You can also use 'string' or 'tsed'

    # Iterate over the dataset with a progress bar
    for item in tqdm(data, desc="Processing items"):
        # Get the label (1 for machine, 0 for human)
        label = 1 if item['writer'] == 'machine' else 0
        labels.append(label)
        
        # Compute similarity scores using classify_package
        num_rewrites = len(item['rewrite'])
        sim_scores = classify_package(item, num_rewrites, strategy)
        
        # Average the similarity scores as per the formula
        avg_score = np.mean(sim_scores)
        scores.append(avg_score)
        
        if item['id'] > 10:
            break

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
        roc_auc, accuracy, precision, recall = scoring_process(strategy='simcse', data=item['data'])
        
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