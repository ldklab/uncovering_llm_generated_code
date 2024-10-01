import torch
import re
from transformers import AutoModelForCausalLM,AutoTokenizer,CodeGenForCausalLM,CodeGenTokenizer

def load_model(model_path="checkpoints/codegen-2B-mono") -> CodeGenForCausalLM:
    print("Loading CodeGen from checkpoints/codegen-2B-mono...")
    model = AutoModelForCausalLM.from_pretrained(model_path)
    return model

def load_tokenizer(tokenizer_path="checkpoints/codegen-2B-mono") -> CodeGenTokenizer:
    print("Loading tokenizer from checkpoints/codegen-2B-mono...")
    tokenizer = AutoTokenizer.from_pretrained(tokenizer_path)
    return tokenizer

"""
This function is adapted from the original Github implementation of CodeGen sampling
https://github.com/salesforce/CodeGen/blob/main/jaxformer/hf/sample.py
"""
def sample(
    device,
    model: CodeGenForCausalLM,
    tokenizer: CodeGenTokenizer,
    context,
    pad_token_id,
    num_return_sequences=1,
    temp=0.2,
    top_p=0.95,
    top_k=None,
    max_length_sample=128,
    max_length=2048
):

    input_ids = tokenizer(
        context,
        truncation=True,
        padding=True,
        max_length=max_length,
        return_tensors='pt',
    ).input_ids

    input_ids_len = input_ids.shape[1]
    assert input_ids_len < max_length

    with torch.no_grad():
        input_ids = input_ids.to(device)
        tokens = model.generate(
            input_ids,
            do_sample=True,
            num_return_sequences=num_return_sequences,
            temperature=temp,
            max_length=input_ids_len + max_length_sample,
            top_p=top_p,
            top_k=top_k,
            pad_token_id=pad_token_id,
            use_cache=True,
        )
        text = tokenizer.batch_decode(tokens[:, input_ids_len:, ...])

    return text

"""
This function is copied from the original Github implementation of CodeGen sampling
https://github.com/salesforce/CodeGen/blob/main/jaxformer/hf/sample.py
"""
def truncate(completion):

    def find_re(string, pattern, start_pos):
        m = pattern.search(string, start_pos)
        return m.start() if m else -1

    terminals = [
        re.compile(r, re.MULTILINE)
        for r in
        [
            '^#',
            re.escape('<|endoftext|>'),
            "^'''",
            '^"""',
            '\n\n\n'
        ]
    ]

    prints = list(re.finditer('^print', completion, re.MULTILINE))
    if len(prints) > 1:
        completion = completion[:prints[1].start()]

    defs = list(re.finditer('^def', completion, re.MULTILINE))
    if len(defs) > 1:
        completion = completion[:defs[1].start()]

    start_pos = 0

    terminals_pos = [pos for pos in [find_re(completion, terminal, start_pos) for terminal in terminals] if pos != -1]
    if len(terminals_pos) > 0:
        return completion[:min(terminals_pos)]
    else:
        return completion

