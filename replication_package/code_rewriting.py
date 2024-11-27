#!/usr/bin/env python
# coding: utf-8

import json 
from api.openai_api import OPENAI_API
from api.google_api import GOOGLE_API
from api.anthropic_api import ANTHROPIC_API
from concurrent.futures import ThreadPoolExecutor, as_completed
import sys
import os
import argparse


parser = argparse.ArgumentParser(description="A script to demonstrate argument parsing.")


parser.add_argument("--model", type=str, default="gpt-4o-mini", help="The target model name for regeneration")
parser.add_argument("--dataset", type=str, default="", help="Dataset for regeneration")
parser.add_argument("--output", type=str, default="output/rewrite_main", help="Dataset for regeneration")
parser.add_argument('--size', type=int, default=-1, help="The portion of the dataset for regeneration")
parser.add_argument('--rewriting_number', type=int, default=3, help="The portion of the dataset for regeneration")

# gemini-1.5-flash

args = parser.parse_args()


# dataset = args.dataset
rewrite_model = args.model
data_size = args.size
output = args.output
rewriting_number = args.rewriting_number
samples = {}

assert os.path.exists(output) and os.path.isdir(output), f"Directory does not exist: {output}"
folder = rewrite_model+"_"+str(rewriting_number)+"t"
output = os.path.join(output, folder)


try:
    os.mkdir(output)
    print(f"Directory created: {output}")
except FileExistsError:
    print(f"Directory already exists: {output}")
except Exception as e:
    print(f"An error occurred: {e}")
    
# print(output)
# exit()    

# print(dataset)
# print(rewrite_model)
# print(data_size)
# print(output)
# exit(0)

datasets = ["csn_claude-3-5-sonnet-20240620", "csn_gemini-1.5-flash", "csn_gpt-4o", "ibm_claude-3-5-sonnet-20240620", "ibm_gemini-1.5-flash", "ibm_gpt-4o"]

for dataset in datasets:
    
    print(f"Dataset: {dataset} is in progrss...")

    with open(f"data/{dataset}.json") as file:
        data = json.load(file)

    # Get the portion that we need to regenerate 
    data = data if data_size == -1 else data[:data_size]

    print(f"Original dataset size is: {len(data)}")

    # Expanding data by duplicating each sample, one with 'human_code' and one with 'machine_code'
    splitted_data = []

    for sample in data:
        # Sample with human_code
        human_sample = {key: sample[key] for key in sample if key not in ['machine_code', 'human_code']}
        human_sample["code"] = sample["human_code"]
        human_sample["writer"] = "human"
        
        # Sample with machine_code
        machine_sample = {key: sample[key] for key in sample if key not in ['machine_code', 'human_code']}
        machine_sample["code"] = sample["machine_code"]
        machine_sample["writer"] = "machine"
        
        # Add both samples to the expanded_data list
        splitted_data.extend([human_sample, machine_sample])

    print(f"Splitted dataset size is: {len(splitted_data)}")
    # print(len(splitted_data))
    # print(splitted_data[0])
    # exit(0)


    # os.environ["OPENAI_API_KEY"] = ""
    # os.environ["GOOGLE_API_KEY"] = ''
    # os.environ["ANTHROPIC_API_KEY"] = ''

    print(f"Setting API config for: {rewrite_model}")
    if 'gpt' in rewrite_model:
        api = OPENAI_API(model=f"{rewrite_model}", temperature=1)
    elif 'gemini' in rewrite_model:
        api = GOOGLE_API(model=f"{rewrite_model}", temperture=1)
    elif 'claude' in rewrite_model:
        api = ANTHROPIC_API(model=f"{rewrite_model}", temperature=1)
    else:
        print("Invalid Model Name")
        sys.exit(1)

    # print(api)
    # exit(0)

    def process_item(item, idx):
        if "claude" in rewrite_model:
            # pcode = "```python def main(): for a in range(1, 10):)```"
            code = item['code']
            rewrite_prompt = f"Please first explain the functionality of the Python code below. Then generate a possible rewrite for this Python code function according to your explanation. Please just give me a pure code in reponse, not any explanation or text. Please do not add any clarifications after the rewritten code. JUST PURE CODE, DONT GENERATE ANY WORD, OTHER THAN CODE. ANSOLUTLY NOTHING, BUT CODE.\n CODE: \n {code}"

            # Generating the rewrite codes
            rewrite_codes = api.communication_regen(prompt=rewrite_prompt, n=rewriting_number)
            # CleanUp the generated codes
            rewrite_codes = [api.codeSnippetCleanup(item) for item in rewrite_codes]
            item["rewrite"] = rewrite_codes
        
        elif "gpt" in rewrite_model:
            # pcode = "```python def main(): for a in range(1, 10):)```"
            code = item['code']
            rewrite_prompt = f"Please first explain the functionality of the Python code below. Then generate a possible rewrite for this Python code function according to your explanation. Please just give me a pure code in reponse, not any explanation or text. Please do not add any clarifications after the rewritten code. JUST PURE CODE, DONT GENERATE ANY WORD, OTHER THAN CODE. ANSOLUTLY NOTHING, BUT CODE.\n CODE: \n {code}"

            # Generating the rewrite codes
            rewrite_codes = api.communication_regen(prompt=rewrite_prompt, n=rewriting_number)
            # CleanUp the generated codes
            rewrite_codes = [api.codeSnippetCleanup(item) for item in rewrite_codes]
            item["rewrite"] = rewrite_codes

        elif "gemini" in rewrite_model:
            # pcode = "```python def main(): for a in range(1, 10):)```"
            code = item['code']
            rewrite_prompt = f"Please first explain the functionality of the Python code below. Then generate a possible rewrite for this Python code function according to your explanation. Please just give me a pure code in reponse, not any explanation or text. Please do not add any clarifications after the rewritten code. JUST PURE CODE, DONT GENERATE ANY WORD, OTHER THAN CODE. ANSOLUTLY NOTHING, BUT CODE.\n CODE: \n {code}"

            # Generating the rewrite codes
            rewrite_codes = api.communication_regen(prompt=rewrite_prompt, n=rewriting_number)
            # CleanUp the generated codes
            rewrite_codes = [api.codeSnippetCleanup(item) for item in rewrite_codes]
            item["rewrite"] = rewrite_codes
        
        return item


    print(f"Start API communication process...")
    rewrtied_data = []
    with ThreadPoolExecutor(max_workers=16) as executer:
        futures_to_items = {executer.submit(process_item, item, idx): item for idx, item in enumerate(splitted_data)}
        for i, future in enumerate(as_completed(futures_to_items)):
            try:
                result = future.result()
                if result is not None: rewrtied_data.append(result)
                sys.stdout.write(f"\rProcessed {i + 1} of {len(splitted_data)} prompts...")
                sys.stdout.flush()
            except Exception as e:
                print(f"\nError processing prompt {i + 1}: {e}")
            # if i == 1 : break
    print(f"End of API communication process and saving results.")
    with open(f"{output}/rewrite_{dataset}_{rewrite_model}_{'all' if data_size == -1 else data_size}.json", 'w') as file:
        json.dump(rewrtied_data, file, indent=4)



    # python code_rewriting.py --model gpt-4o-mini --size 50 --output output/rewrite/gpt_mini --dataset csn_gemini-1.5-flash