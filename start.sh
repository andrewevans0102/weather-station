#!/bin/bash

echo "building server"
npm install
npm run build
node server.js &
echo "server started"
