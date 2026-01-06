#!/bin/sh

echo "Waiting for TiCDC to be ready..."

# Wait loop until TiCDC API is available (checking port 8300)
while ! nc -z ticdc 8300; do   
  sleep 5
done

echo "TiCDC is up! Waiting for Kafka to be ready..."
while ! nc -z kafka 9092; do   
  sleep 5
done

echo "Kafka is up! Waiting a few more seconds for full initialization..."
sleep 10

echo "Creating Changefeed Task..."
/cdc cli changefeed create --server=http://ticdc:8300 --sink-uri="kafka://kafka:9092/helfy_topic?protocol=canal-json" --changefeed-id="simple-replication-task"

if [ $? -eq 0 ]; then
  echo "Changefeed created successfully."
else
  echo "Changefeed creation failed (maybe it already exists)."
fi
