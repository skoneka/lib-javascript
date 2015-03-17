#!/bin/bash

# This script updates the default event types JSON schema file,
# used as a fallback if the lib can't retrieve the types directory online

BASE_URL=http://pryv.github.io/event-types/
FLAT_URL=${BASE_URL}flat.json
EXTRAS_URL=${BASE_URL}extras.json
FLAT_DEST=source/event-types.default.json
EXTRAS_DEST=source/event-extras.default.json

# working dir fix
SCRIPT_FOLDER=$(cd $(dirname "$0"); pwd)
cd $SCRIPT_FOLDER/..

echo ""
echo "Downloading event types files from $BASE_URL, saving to $FLAT_DEST and $EXTRAS_DEST..."
echo ""

curl -L --fail -o $FLAT_DEST $FLAT_URL
EXIT_CODE=$(($?))
curl -L --fail -o $EXTRAS_DEST $EXTRAS_URL
EXIT_CODE=$((${EXIT_CODE}+$?))

echo ""

exit ${EXIT_CODE}
