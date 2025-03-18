# backend/scripts/generate_types.py
import os
import sys
import importlib
import inspect
from typing import Dict, Any, Type, List
from pydantic import BaseModel
from pydantic2ts import generate_typescript_defs


def get_models_from_file(file_path: str) -> List[Type[BaseModel]]:
    """Extract all Pydantic models from a Python file"""
    # Convert file path to module path
    module_path = file_path.replace("/", ".").replace(".py", "")

    try:
        # Import the module
        module = importlib.import_module(module_path)

        # Get all Pydantic models
        models = []
        for name, obj in inspect.getmembers(module):
            if inspect.isclass(obj) and issubclass(obj, BaseModel) and obj != BaseModel:
                models.append(obj)

        return models
    except Exception as e:
        print(f"Error importing {module_path}: {e}", file=sys.stderr)
        return []


def generate_typescript_for_file(file_path: str, output_dir: str) -> None:
    """Generate TypeScript definitions for a single Python file"""

    # Get models from the file
    models = get_models_from_file(file_path)
    if not models:
        print(f"No models found in {file_path}")
        return

    # Determine output file name
    file_name = os.path.basename(file_path)
    ts_file_name = file_name.replace(".py", ".ts")
    output_path = os.path.join(output_dir, ts_file_name)

    # Generate TypeScript
    generate_typescript_defs(models, output_path, json2ts_cmd="npm install json2ts")

    print(f"Generated TypeScript for {file_path} -> {output_path}")


def main():
    # Get the list of Python files to process
    python_files = []
    for root_dir in ["src.models"]:
        if os.path.exists(root_dir):
            for file in os.listdir(root_dir):
                if file.endswith(".py") and file != "__init__.py":
                    python_files.append(os.path.join(root_dir, file))

    # Create output directory
    output_dir = "../frontend/src/types/generated"
    os.makedirs(output_dir, exist_ok=True)

    # Process each file
    for file_path in python_files:
        generate_typescript_for_file(file_path, output_dir)


if __name__ == "__main__":
    main()
