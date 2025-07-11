from setuptools import setup, find_packages

setup(
    name="power_ms_trading",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "setuptools>=65.5.1",
        "wheel>=0.40.0",
        "fastapi==0.95.2",
        "uvicorn[standard]==0.22.0",
        "sqlalchemy>=1.4.0,<2.0.0",
        "pydantic==1.10.7",
        "pandas==2.0.1",
        "numpy==1.24.3",
        "python-multipart==0.0.6",
        "python-binance==1.0.29",
        "psycopg2-binary==2.9.6",
        "gunicorn==20.1.0",
        "python-dotenv==1.0.0",
    ],
    python_requires=">=3.10.0,<3.12.0",
)
