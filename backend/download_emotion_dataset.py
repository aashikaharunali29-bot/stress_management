from pathlib import Path

import kagglehub


FER2013_DATASET = "msambare/fer2013"


def main() -> None:
    dataset_path = Path(kagglehub.dataset_download(FER2013_DATASET))
    print(f"Downloaded Kaggle FER dataset to: {dataset_path}")


if __name__ == "__main__":
    main()
