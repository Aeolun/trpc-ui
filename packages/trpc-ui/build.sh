#!/bin/bash
# First, transpile TypeScript
tsc

# Process CSS with Tailwind
npx tailwindcss -i src/react-app/index.css -o lib/src/react-app/index.css

# Copy HTML template
cp src/react-app/index.html lib/src/react-app/index.html

# Bundle JavaScript with esbuild
esbuild src/react-app/index.tsx --loader:.svg=dataurl --bundle --outfile=lib/src/react-app/bundle.js --platform=browser --format=iife --sourcemap=inline --tree-shaking=true --target=es2020
