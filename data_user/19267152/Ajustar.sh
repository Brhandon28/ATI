#!/bin/bash

for archivo in *.jpg; do
    if [[ $archivo =~ -[0-9]+\.jpg$ ]]; then
        continue
    fi
    
    nombre_base="${archivo%.jpg}"
    
    # Redimensionar con calidad y optimización
    convert "$archivo" -resize 200x  -strip "${nombre_base}-200.jpg"
    convert "$archivo" -resize 400x  -strip "${nombre_base}-400.jpg"
    convert "$archivo" -resize 800x  -strip "${nombre_base}-800.jpg"
    
    echo "Creadas versiones optimizadas para: $archivo"
done
