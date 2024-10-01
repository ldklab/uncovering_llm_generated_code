import torch
import torch.nn as nn
import deepspeed
from transformers import AutoModelForCausalLM,AutoTokenizer
from peft import get_peft_model,get_peft_config,LoraConfig,prepare_model_for_int8_training


class LLMPefT(nn.Module):
    def __init__(self,config):
        super(LLMPefT, self).__init__()
        self.llm = AutoModelForCausalLM.from_pretrained(config.plm_name,low_cpu_mem_usage=True,
                                                        load_in_8bit=config.use_int8)

        peft_config = LoraConfig(
            r=config.peft.lora_r,
            lora_alpha=config.peft.lora_alpha,
            target_modules=config.peft.target_modules,
            lora_dropout=config.peft.lora_dropout,
            bias=config.peft.bias,
            task_type=config.peft.task_type
        )
        if config.use_int8:
            self.llm = prepare_model_for_int8_training(self.llm)

        self.llm = get_peft_model(self.llm,peft_config)
        self.llm.print_trainable_parameters()


    def forwad(self,input_ids,attention_mask,labels):
        outputs = self.llm(input_ids=input_ids,attention_mask=attention_mask,labels=labels)
        loss = outputs[0]
        return loss

