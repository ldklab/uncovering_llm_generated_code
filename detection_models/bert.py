import torch
import torch.nn as nn
from transformers import RobertaModel
import torch.nn.functional as F


class BertCLS(nn.Module):
    def __init__(self,config):
        super(BertCLS,self).__init__()
        self.plm = RobertaModel.from_pretrained(config.plm_name,local_files_only=True)
        self.cls_head = nn.Sequential(nn.Dropout(config.cls_drop),
                                      nn.Linear(768,config.cls_dim),
                                      nn.Tanh(),
                                      nn.Dropout(config.cls_drop),
                                      nn.Linear(config.cls_dim,2))
        self.loss_fn = nn.CrossEntropyLoss()

    def forward(self, x, y):
        x_hidden = self.plm(x)[0]
        x_logits = self.cls_head(x_hidden[:,0,:])

        loss = self.loss_fn(x_logits,y)

        return loss

    def predict(self, x, return_numpy=False, return_confidence=False):
        with torch.no_grad():
            x_hidden = self.plm(x)[0]
            x_logits = self.cls_head(x_hidden[:, 0, :])

            pred = torch.argmax(x_logits,dim=-1)
            if return_confidence:
                confidence = torch.softmax(x_logits,dim=-1)[:,1]
                # confidence = confidence * pred + (1-confidence) * (1-pred)
            if return_numpy:
                pred = pred.cpu().numpy()
                if return_confidence:
                    confidence = confidence.cpu().numpy()

            if return_confidence:
                return pred,confidence
            else:
                return pred


class InfoNCELoss(nn.Module):
    def __init__(self, temperature,norm=True):
        super(InfoNCELoss, self).__init__()
        self.t = temperature
        self.norm=norm
    def forward(self, pred, target):
        bsz = pred.shape[0]
        pair_wise_label = (target[:,None] == target[None,:]).to(pred)

        pos_mask = ((pair_wise_label - torch.eye(bsz).to(pair_wise_label)) == 1).to(torch.int)
        neg_mask = (pair_wise_label == 0).to(torch.int)

        if self.norm:
            pred_norm = F.normalize(pred,p=2.0)
        else:
            pred_norm = pred
        logits = torch.matmul(pred_norm,pred_norm.transpose(0,1)).to(torch.float) / self.t #[bsz, bsz]
        exp_logits = torch.exp(logits)

        pos_logits = exp_logits * pos_mask
        neg_logits = exp_logits * neg_mask

        loss = torch.log(pos_logits + 1e-9) * pos_mask
        loss -= torch.log(1e-9 + pos_logits + neg_logits.sum(-1,keepdims=True)/(neg_mask.sum(-1,keepdims=True) + 1e-9))* pos_mask
        loss = -loss.sum(-1).mean()

        return loss



        

class BertSupConCLS(nn.Module):
    def __init__(self,config):
        super(BertSupConCLS,self).__init__()
        self.plm = RobertaModel.from_pretrained(config.plm_name,local_files_only=True)
        self.cls_head = nn.Sequential(nn.Dropout(config.cls_drop),
                                      nn.Linear(768,config.cls_dim),
                                      nn.Tanh(),
                                      nn.Dropout(config.cls_drop),
                                      nn.Linear(config.cls_dim,2))
        self.ce_loss_fn = nn.CrossEntropyLoss()
        self.infonce_loss_fn = InfoNCELoss(temperature=config.temperature,norm=True)
        self.trade_off = config.trade_off

    def forward(self, x, y):
        x_hidden = self.plm(x)[0][:, 0, :]
        x_logits = self.cls_head(x_hidden)

        ce_loss = self.ce_loss_fn(x_logits,y)
        infonce_loss = self.infonce_loss_fn(x_hidden,y)
        loss = ce_loss + self.trade_off * infonce_loss

        return loss

    def predict(self, x, return_numpy=False, return_confidence=False):
        with torch.no_grad():
            x_hidden = self.plm(x)[0]
            x_logits = self.cls_head(x_hidden[:, 0, :])

            pred = torch.argmax(x_logits,dim=-1)
            if return_confidence:
                confidence = torch.softmax(x_logits,dim=-1)[:,1]
                # confidence = confidence * pred + (1-confidence) * (1-pred)
            if return_numpy:
                pred = pred.cpu().numpy()
                if return_confidence:
                    confidence = confidence.cpu().numpy()

            if return_confidence:
                return pred,confidence
            else:
                return pred




class DualBertCLS(nn.Module):
    def __init__(self,config):
        super(DualBertCLS,self).__init__()
        self.plm1 = RobertaModel.from_pretrained(config.plm_name1)
        # self.plm2 = RobertaModel.from_pretrained(config.plm_name2)

        self.cls_head = nn.Sequential(nn.Dropout(config.cls_drop),
                                      nn.Linear(768,config.cls_dim),
                                      nn.Tanh(),
                                      nn.Dropout(config.cls_drop),
                                      nn.Linear(config.cls_dim,2))

        self.loss_fn = nn.CrossEntropyLoss()

    def forward(self, x1, x2, y):
        x1_hidden = self.plm1(x1)[0]
        x2_hidden = self.plm1(x2)[0]

        x_hidden = x1_hidden[:,0,:] + x2_hidden[:,0,:]

        x_logits = self.cls_head(x_hidden)
        loss = self.loss_fn(x_logits,y)

        return loss

    def predict(self, x1, x2, return_numpy=False, return_confidence=False):
        with torch.no_grad():
            x1_hidden = self.plm1(x1)[0]
            x2_hidden = self.plm1(x2)[0]

            x_hidden = x1_hidden[:, 0, :] + x2_hidden[:, 0, :]

            x_logits = self.cls_head(x_hidden)

            pred = torch.argmax(x_logits,dim=-1)
            if return_confidence:
                confidence = torch.softmax(x_logits,dim=-1)[:,1]
                # confidence = confidence * pred + (1-confidence) * (1-pred)
            if return_numpy:
                pred = pred.cpu().numpy()
                if return_confidence:
                    confidence = confidence.cpu().numpy()

            if return_confidence:
                return pred,confidence
            else:
                return pred