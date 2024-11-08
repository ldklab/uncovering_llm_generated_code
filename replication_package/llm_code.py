import os
from openai import OpenAI
import tiktoken
enc = tiktoken.encoding_for_model("gpt-4")
import sys
import subprocess
import os
import shutil
import json

import warnings
warnings.filterwarnings("ignore")

#final_output_file = open('classification_results.csv', 'a')

import TSED
import torch
from scipy.spatial.distance import cosine
from transformers import AutoModel, AutoTokenizer
# Import our models. The package will take care of downloading the models automatically
tokenizer = AutoTokenizer.from_pretrained("princeton-nlp/sup-simcse-roberta-large")
model = AutoModel.from_pretrained("princeton-nlp/sup-simcse-roberta-large")

def string_similarity(first, second):
	output = subprocess.check_output(["node", "string-similarity-wrapper.js", first, second], universal_newlines=True)
	
	score = float(output.split(" ")[-1])
	return score

key = open('openai.key').read().rstrip('\n')
client = OpenAI(api_key=key, timeout=600)

generate_prompt = "Please first explain the functionality described in the Node.js package README.md below. Then generate the code for a Node.js package which implements said functionality according to your explanation. Please organize all the code in a single markdown code block. Please do not add any clarifications after the rewritten code."
rewrite_prompt = "Please first explain the functionality of the Node.js code below. Then generate a possible rewrite for this Node.js code according to your explanation. Please organize all the code in a single markdown code block. Please do not add any clarifications after the rewritten code."

def generate_synthetic_package(pkg, readme):
	if not os.path.exists('popular_packages_l/' + pkg):
		os.makedirs('popular_packages_l/' + pkg)

	readme_contents = open(readme, encoding="utf-8").read()
	chat_completion = client.chat.completions.create(
	messages=[
	{
		"role": "system",
		"content": generate_prompt,
	},
	{
		"role": "user",
		"content": readme_contents,
	}
	],
	model="gpt-4o",
	temperature=1.0,
	seed=0,
	)

	model_output = chat_completion.choices[0].message.content
	
	outfile = open('popular_packages_l/' + pkg + '/model_output.txt', 'w', encoding='utf-8')
	outfile.write(model_output)
	outfile.close()

	model_output_split = model_output.split('```')
	if len(model_output_split) == 3:
		js = '\n'.join(model_output_split[1].split('\n')[1:])
		outfile = open('popular_packages_l/' + pkg + '/index.js', 'w', encoding='utf-8')
		outfile.write(js)
		outfile.close()

		return

	model_output.replace('```markdown', '')
	model_output.replace('```json', '')

	model_output_split = model_output.split('```javascript')
	if len(model_output_split) > 1:
		js = '\n'.join(model_output_split[1:])
		if js.startswith("\n"):
			js = '\n'.join(js.split('\n')[1:])

		js.replace('```', '')

		outfile = open('popular_packages_l/' + pkg + '/index.js', 'w', encoding='utf-8')
		outfile.write(js)
		outfile.close()
	else:
		model_output_split = model_output.split('```js')
		if len(model_output_split) > 1:
			js = '\n'.join(model_output_split[1:])
			if js.startswith("\n"):
				js = '\n'.join(js.split('\n')[1:])

			js.replace('```', '')

			outfile = open('popular_packages_l/' + pkg + '/index.js', 'w', encoding='utf-8')
			outfile.write(js)
			outfile.close()
	

def rewrite_package(fpath, num_rewrites):
	js_orig = open(fpath, encoding="utf-8").read()

	split_path = fpath.split('/')
	dir = '/'.join(split_path[:-1]) + '/'
	fname = split_path[-1]
	base_fname = '.'.join(fname.split('.')[:-1])

	for i in range(num_rewrites):

		chat_completion = client.chat.completions.create(
		messages=[
		{
			"role": "system",
			"content": rewrite_prompt,
		},
		{
			"role": "user",
			"content": js_orig,
		}
		],
		model="gpt-4o",
		temperature=1.0,
		)

		model_output = chat_completion.choices[0].message.content
	
		outfile = open(dir + 'model_rewrite_output_' + str(i+1) + '.txt', 'w', encoding='utf-8')
		outfile.write(model_output)
		outfile.close()

		model_output_split = model_output.split('```')
		if len(model_output_split) == 3:
			js = '\n'.join(model_output_split[1].split('\n')[1:])
			outfile = open(dir + base_fname + '_' + str(i+1) + '.js', 'w', encoding='utf-8')
			outfile.write(js)
			outfile.close()

			continue
		

		model_output.replace('```markdown', '')
		model_output.replace('```json', '')

		model_output_split = model_output.split('```javascript')
		if len(model_output_split) > 1:
			js = '\n'.join(model_output_split[1:])
			if js.startswith("\n"):
				js = '\n'.join(js.split('\n')[1:])

			js.replace('```', '')
			outfile = open(dir + base_fname + '_' + str(i+1) + '.js', 'w', encoding='utf-8')
			outfile.write(js)
			outfile.close()
		else:
			model_output_split = model_output.split('```js')
			if len(model_output_split) > 1:
				js = '\n'.join(model_output_split[1:])
				if js.startswith("\n"):
					js = '\n'.join(js.split('\n')[1:])

				js.replace('```', '')

				outfile = open(dir + base_fname + '_' + str(i+1) + '.js', 'w', encoding='utf-8')
				outfile.write(js)
				outfile.close()

def classify_package(fpath, num_rewrites, strategy):
	js_orig = open(fpath, encoding="utf-8").read()
	texts = [js_orig]

	split_path = fpath.split('/')
	dir = '/'.join(split_path[:-1]) + '/'
	fname = split_path[-1]
	base_fname = '.'.join(fname.split('.')[:-1])

	for i in range(num_rewrites):

		js_rewrite = open(dir + base_fname + '_' + str(i+1) + '.js', encoding='utf-8').read()
		texts.append(js_rewrite)

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
			sim = TSED.Calculate("javascript", texts[0], texts[i+1], 1.0, 0.8, 1.0)
			sim_scores.append(sim)
	else:
		print('ERROR. Invalid Strategy: "' + strategy + '"')
		return []

	return sim_scores
	

#testing functions

#generate_synthetic_package('arg', 'popular_packages_h/arg/arg@5.0.0/README.md') 
#rewrite_package('popular_packages_l/arg/index.js', 4)
#rewrite_package('popular_packages_h/arg/arg@5.0.0/index.js', 4)

#sim_scores_llm = classify_package('popular_packages_l/arg/index.js', 4, 'simcse')
#print('LLM-generated package similarity scores:', sim_scores_llm)
#sim_scores_hum = classify_package('popular_packages_h/arg/arg@5.0.0/index.js', 4, 'simcse')
#print('Human-generated package similarity scores:', sim_scores_hum)