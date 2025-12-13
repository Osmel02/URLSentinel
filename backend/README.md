```bash
backend/
  ├── app/
  │   ├── main.py              # Servidor Flask
  │   ├── ml/
  │   │   ├── model.pkl        # Modelo ML entrenado
  │   │   ├── preprocess.py    # Feature engineering
  │   │   └── predict.py       # Predicción ML
  │   ├── services/
  │   │   ├── virustotal.py    # Integración VT
  │   │   ├── urlscan.py       # Integración URLScan
  │   │   └── openphish.py     # Integración OpenPhish
  │   └── utils/
  │       ├── correlator.py    # Correlación de resultados
  │       └── validators.py    # Validación de URLs
  ├── metrics.py               # Métricas en memoria
  └── requirements.txt
```

