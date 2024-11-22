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
from sklearn.metrics import roc_curve, auc
import matplotlib.pyplot as plt
from tqdm import tqdm  # Import tqdm for the progress bar
import pandas as pd
import logging


from transformers import AutoModel, AutoTokenizer
# Import our models. The package will take care of downloading the models automatically
tokenizer = AutoTokenizer.from_pretrained("princeton-nlp/sup-simcse-roberta-large")
model = AutoModel.from_pretrained("princeton-nlp/sup-simcse-roberta-large")




# Directory containing the JSON files
directory_path = 'output/rewrite/gpt_mini_12t'

# Initialize an empty list to store the combined data
data1 = []

# Iterate over all JSON files in the directory
for filename in os.listdir(directory_path):
    if filename.endswith('.json'):  # Process only JSON files
        file_path = os.path.join(directory_path, filename)
        # print(file_path)
        with open(file_path, 'r') as file:
            file_data = json.load(file)  # Load JSON content
            data1.append({'data': file_data, 
                         'dataset': file_path.split('/')[-1].split('.')[0]})  # Add content to 



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

    # Convert lists to numpy arrays for compatibility
    labels = np.array(labels)
    scores = np.array(scores)

    # Compute ROC curve and AUC
    fpr, tpr, thresholds = roc_curve(labels, scores)
    roc_auc = auc(fpr, tpr)
    
    return roc_auc

    # Print AUC value
    print(f'AUC for strategy "{strategy}": {roc_auc:.4f}')

    # Plot ROC curve
    plt.figure()
    plt.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC curve (AUC = {roc_auc:.4f})')
    plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')  # Diagonal line
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title(f'Receiver Operating Characteristic - {strategy}')
    plt.legend(loc="lower right")
    plt.show()


if __name__ == "__main__":
      
    # Directory containing the JSON files
    directory_path = 'output/rewrite/gemini_flash_12t'
    detector_llm = directory_path.split('/')[-1]

    print(f"Start working on {detector_llm} directory datasets.")

    # Initialize an empty list to store the combined data
    data1 = []

    # Iterate over all JSON files in the directory
    for filename in os.listdir(directory_path):
        if filename.endswith('.json'):  # Process only JSON files
            file_path = os.path.join(directory_path, filename)
            # print(file_path)
            with open(file_path, 'r') as file:
                file_data = json.load(file)  # Load JSON content
                data1.append({'data': file_data, 
                            'dataset': file_path.split('/')[-1].split('.')[0]})  # Add content to 
    
    detector_llm = directory_path.split('/')[-1]
    rows = []
    for item in data1:
        print(f"Process on {item['dataset']} dataset...")
        auc_score = scoring_process(strategy='simcse', data=item['data'])
        row = {"dataset": '_'.join(item['dataset'].split('_')[1:3]), 
            f"AUC_{detector_llm}": f"{auc_score:.2f}"}
        rows.append(row)

    df = pd.DataFrame(rows)
    print(df)
    df.to_csv(f"output/{detector_llm}_output.csv", index=False)



