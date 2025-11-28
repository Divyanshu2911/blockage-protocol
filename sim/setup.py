from setuptools import setup, find_packages

setup(
    name="blockage-sim",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "numpy",
        "pandas",
        "matplotlib",
        "click",
        "seaborn",
    ],
    entry_points={
        "console_scripts": [
            "blockage-sim=blockage.cli:main",
        ],
    },
)
