from pathlib import Path
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
from backend.ai.model import MODULATION_CLASSES, ModulationCNN
from backend.ai.training.generate_dataset import generate_synthetic_dataset
from backend.config import MODELS_DIR, MODULATION_MODEL_PATH


def train_and_save_model(
    num_samples_per_class: int = 300, epochs: int = 15, batch_size: int = 32
) -> float:
    """Trains the PyTorch CNN modulation classification model and saves model weights."""
    print("Generating synthetic IQ training dataset...")
    X_data, y_data = generate_synthetic_dataset(
        num_samples_per_class=num_samples_per_class
    )

    X_tensor = torch.tensor(X_data)
    y_tensor = torch.tensor(y_data)

    dataset = TensorDataset(X_tensor, y_tensor)
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training PyTorch CNN model on device: {device}")

    model = ModulationCNN(num_classes=len(MODULATION_CLASSES)).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.002, weight_decay=1e-4)

    model.train()
    for epoch in range(epochs):
        total_loss = 0.0
        correct = 0
        total = 0

        for batch_x, batch_y in loader:
            batch_x, batch_y = batch_x.to(device), batch_y.to(device)

            optimizer.zero_grad()
            outputs = model(batch_x)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()

            total_loss += loss.item() * batch_x.size(0)
            _, predicted = torch.max(outputs, 1)
            total += batch_y.size(0)
            correct += (predicted == batch_y).sum().item()

        accuracy = 100.0 * correct / total
        avg_loss = total_loss / total
        if (epoch + 1) % 5 == 0 or epoch == epochs - 1:
            print(
                f"Epoch [{epoch + 1}/{epochs}] - Loss: {avg_loss:.4f} - Accuracy: {accuracy:.2f}%"
            )

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    torch.save(model.state_dict(), str(MODULATION_MODEL_PATH))
    print(f"Model successfully saved to {MODULATION_MODEL_PATH}")
    return accuracy


if __name__ == "__main__":
    train_and_save_model()
