import torch
import torch.nn as nn
from .bert import BertCLS

class DetectionModel(nn.Module):
    def __init__(self,config):
        super(DetectionModel,self).__init__()

