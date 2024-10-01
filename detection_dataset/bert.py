import torch
from torch.utils.data import Dataset
from transformers import RobertaTokenizer
import json
import tqdm
import pandas as pd

def load_json_dataset(pth):
    dataset = []
    with open(pth,"r") as f:
        for line in f:
            dataset.append(json.loads(line.strip()))
    return dataset

def dump_dataset_json(pth,dataset):
    with open(pth,"w") as f:
        for data in dataset:
            f.write(json.dumps(data) + "\n")

def select_data(data_cfg):
    data = pd.read_pickle(data_cfg.data_pth)
    selected = data.extracted_full_func.apply(len) >= 0
    if hasattr(data_cfg,"domain"):
        selected &= data.source.isin(list(data_cfg.domain))
    if hasattr(data_cfg,"model_name"):
        selected &= data.model_name.isin(list(data_cfg.model_name))
    if hasattr(data_cfg,"temp"):
        selected &= data.temp.isin(list(data_cfg.temp))
    if hasattr(data_cfg,'top_p'):
        selected &= data.top_p.isin(list(data_cfg.top_p))
    if hasattr(data_cfg,'top_k'):
        selected &= data.top_k.isin(list(data_cfg.top_k))

    return data[selected]




class BertCLSDataset(Dataset):
    def __init__(self,data_cfg,tokenizer_pth,max_input_len=512,mini_dataset=False,
                 input_key='extracted_full_func',frac=1.0,seed=44):
        super(BertCLSDataset,self).__init__()

        gen_data = select_data(data_cfg.gen)
        gen_data['label'] = 1
        human_data = select_data(data_cfg.human)
        human_data['label'] = 0

        self.all_data = pd.concat([gen_data, human_data])
        if mini_dataset:
            self.all_data = self.all_data.sample(frac=0.05)
        tokenizer = RobertaTokenizer.from_pretrained(tokenizer_pth)
        self.pad_id = tokenizer.pad_token_id
        print("Processing Data")
        def tokenize(x):
            input_ids = tokenizer(x,
                                  truncation=True,
                                  max_length=max_input_len,
                                  add_special_tokens=True,
                                  return_attention_mask=False).input_ids
            return input_ids

        self.all_data = self.all_data[self.all_data[input_key].apply(lambda x: len(x) > 0)]
        self.all_data['input_ids'] = self.all_data[input_key].apply(tokenize)
        if frac < 1.0:
            self.all_data = self.all_data.sample(frac=frac,random_state=seed)


    def __len__(self):
        return len(self.all_data)

    def __getitem__(self, idx):
        return self.all_data.iloc[idx]

    def collate_fn(self, batch):
        batched_input_ids = [data['input_ids'] for data in batch]
        batched_labels = [data['label'] for data in batch]
        max_len = max([len(seq) for seq in batched_input_ids])
        batched_input_ids = [seq + [self.pad_id] * (max_len - len(seq)) for seq in batched_input_ids]

        return torch.LongTensor(batched_input_ids), torch.LongTensor(batched_labels)



class DualBertCLSDataset(Dataset):
    def __init__(self,data_cfg,tokenizer_pth1,tokenizer_pth2,max_input_len=512,mini_dataset=False,
                 input_key1='extracted_full_func',input_key2='question',frac=1.0,seed=44):
        super(DualBertCLSDataset,self).__init__()

        gen_data = select_data(data_cfg.gen)
        human_data = select_data(data_cfg.human)

        self.all_data = pd.concat([gen_data, human_data])
        if mini_dataset:
            self.all_data = self.all_data.sample(frac=0.05)
        tokenizer = RobertaTokenizer.from_pretrained(tokenizer_pth1)
        self.pad_id1 = tokenizer.pad_token_id
        print("Processing Data")
        def tokenize(x):
            input_ids = tokenizer(x,
                                  truncation=True,
                                  max_length=max_input_len,
                                  add_special_tokens=True,
                                  return_attention_mask=False).input_ids
            return input_ids
        # self.all_data = self.all_data[self.all_data[input_key1].apply(lambda x: len(x) > 0)]
        self.all_data['input_ids_1'] = self.all_data[input_key1].apply(tokenize)


        tokenizer = RobertaTokenizer.from_pretrained(tokenizer_pth2)
        self.pad_id2 = tokenizer.pad_token_id
        # self.all_data = self.all_data[self.all_data[input_key2].apply(lambda x: len(x) > 0)]
        self.all_data['input_ids_2'] = self.all_data[input_key2].apply(tokenize)

        if frac < 1.0:
            self.all_data = self.all_data.sample(frac=frac,random_state=seed)


    def __len__(self):
        return len(self.all_data)

    def __getitem__(self, idx):
        return self.all_data.iloc[idx]

    def collate_fn(self, batch):
        batched_input_ids1 = [data['input_ids_1'] for data in batch]
        max_len = max([len(seq) for seq in batched_input_ids1])
        batched_input_ids1 = [seq + [self.pad_id1] * (max_len - len(seq)) for seq in batched_input_ids1]

        batched_input_ids2 = [data['input_ids_2'] for data in batch]
        max_len = max([len(seq) for seq in batched_input_ids2])
        batched_input_ids2 = [seq + [self.pad_id2] * (max_len - len(seq)) for seq in batched_input_ids2]

        batched_labels = [data['label'] for data in batch]

        return torch.LongTensor(batched_input_ids1), torch.LongTensor(batched_input_ids2), torch.LongTensor(batched_labels)