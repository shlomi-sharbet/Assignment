const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'helfy-consumer',
    brokers: ['kafka:9092']
});

const consumer = kafka.consumer({ groupId: 'helfy-group' });

async function run() {
    console.log('Consumer starting...');
    await consumer.connect();
    console.log('Consumer connected to Kafka');

    await consumer.subscribe({ topic: 'helfy_topic', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
            console.log(`- ${prefix} ${message.key}#${message.value}`);

            try {
                const valueObj = JSON.parse(message.value.toString());
                console.log('Received Change Event:', JSON.stringify(valueObj, null, 2));
            } catch (e) {
                console.log('Raw Message:', message.value.toString());
            }
        },
    });
}

run().catch(console.error);
