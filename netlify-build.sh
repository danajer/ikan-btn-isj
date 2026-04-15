#!/bin/bash

# Build script untuk mengganti placeholder dengan environment variable
echo "Building with WhatsApp number: ${VITE_WHATSAPP_NUMBER}"

# Ganti placeholder di file HTML
sed -i "s/%VITE_WHATSAPP_NUMBER%/${VITE_WHATSAPP_NUMBER}/g" index.html

# Ganti placeholder di file JS
sed -i "s/%VITE_WHATSAPP_NUMBER%/${VITE_WHATSAPP_NUMBER}/g" script.js

echo "Build completed!"
