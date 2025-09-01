import gradio as gr
import numpy as np
import timm
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as T
import keras
import traceback
from PIL import Image
from skimage.transform import resize

# ----------- Constants -----------
CLASSES = ["Glioma", "Meningioma", "No Tumor", "Pituitary"]
IMG_SIZE = (224, 224)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ----------- Segmentation Model Definition -----------
swin = timm.create_model('swin_base_patch4_window7_224', pretrained = False, features_only = True)

class UNetDecoder(nn.Module):
    def __init__(self):
        super().__init__()

        def conv_block(in_c, out_c):
            return nn.Sequential(
                nn.Conv2d(in_c, out_c, kernel_size=3, padding=1),
                nn.ReLU(inplace=True),
                nn.Conv2d(out_c, out_c, kernel_size=3, padding=1),
                nn.ReLU(inplace=True)
            )

        self.up3 = nn.ConvTranspose2d(512, 256, kernel_size=2, stride=2)
        self.dec3 = conv_block(768, 256)

        self.up2 = nn.ConvTranspose2d(256, 128, kernel_size=2, stride=2)
        self.dec2 = conv_block(384, 128)

        self.up1 = nn.ConvTranspose2d(128, 64, kernel_size=2, stride=2)
        self.dec1 = conv_block(192, 64)

        self.final = nn.Conv2d(64, 1, kernel_size=1)

    def forward(self, features):
        e1, e2, e3, e4 = features  # e4 is reduced 512 channels

        d3 = self.up3(e4)
        d3 = self.dec3(torch.cat([d3, e3], dim=1))  # concat 256 + 512 = 768

        d2 = self.up2(d3)
        d2 = self.dec2(torch.cat([d2, e2], dim=1))  # concat 128 + 256 = 384

        d1 = self.up1(d2)
        d1 = self.dec1(torch.cat([d1, e1], dim=1))  # concat 64 + 128 = 192

        out = F.interpolate(d1, scale_factor=4, mode='bilinear', align_corners=False)
        return torch.sigmoid(self.final(out))
    
class SwinUNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.encoder = swin
        self.channel_reducer = nn.Conv2d(1024, 512, kernel_size=1)
        self.decoder = UNetDecoder()

    def forward(self, x):
        if x.shape[1] == 1:
            x = x.repeat(1, 3, 1, 1)

        features = self.encoder(x)
        features = [self._to_channels_first(f) for f in features]

        features[3] = self.channel_reducer(features[3])

        output = self.decoder(features)
        return output

    def _to_channels_first(self, feature):
        if feature.dim() == 4:
            return feature.permute(0, 3, 1, 2).contiguous()
        elif feature.dim() == 3:
            B, N, C = feature.shape
            H = W = int(N ** 0.5)
            feature = feature.permute(0, 2, 1).contiguous()
            return feature.view(B, C, H, W)
        else:
            raise ValueError(f"Unexpected feature shape: {feature.shape}")

# ----------- Load Swin-UNet -----------
swinunet_model = SwinUNet()
swinunet_model.load_state_dict(torch.load("swinunet.pth", map_location = device))
swinunet_model = swinunet_model.to(device)
swinunet_model.eval()

# ----------- Load Classifier Model -----------
classifier_model = keras.models.load_model("cnn-swinunet")

# ----------- Transform -----------
transform = T.Compose([
    T.Resize((224, 224)),
    T.ToTensor()
])

# ----------- Segmentation -----------
def segmentation(image: Image.Image) -> np.ndarray:
    # Convert to grayscale and tensor
    image = image.convert("L")
    input_tensor = transform(image).unsqueeze(0).to(device)  # [1, 1, 224, 224]

    with torch.no_grad():
        mask_pred = swinunet_model(input_tensor)
        mask_pred = F.interpolate(mask_pred, size=(224, 224), mode="bilinear", align_corners=False)
        mask_pred = (mask_pred > 0.5).float()

    image_np = input_tensor.squeeze().cpu().numpy()  # [224, 224]
    mask_np = mask_pred.squeeze().cpu().numpy()      # [224, 224]
    
    combined = np.stack([image_np, mask_np], axis=-1)  # [224, 224, 2]
    return combined

def predict(image: Image.Image):
    try:
      combined = segmentation(image)
      combined = np.expand_dims(combined, axis=0) # Shape: (1, 224, 224, 2)

      probs = classifier_model.predict(combined)[0]
      return CLASSES[int(np.argmax(probs))]
    except Exception as e:
      traceback_str = traceback.format_exc()
      print(traceback_str)      
      return traceback_str

demo = gr.Interface(
    fn = predict,
    inputs = gr.Image(type = "pil", label = "Brain MRI"),
    outputs = gr.Label(num_top_classes = 4),
    title = "Brain‑Tumor Net)",
    description = "Returns: Glioma, Meningioma, No Tumor, Pituitary"
)

demo.launch()

if __name__ == "main":
    demo.launch()
