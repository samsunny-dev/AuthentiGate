const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');

const rawData = JSON.parse(fs.readFileSync('./Backend/data/preprocessed_data.json'));

const labels = { "fake": 0, "real": 1};

const texts = rawData.map(entry => entry.text);
const yData = rawData.map(entry => labels[entry.label]);

const MAX_TOKENS = 10000;
const MAX_LEN = 50;

async function tokenizeText(texts) {
    const tokenizer = new tf.layers.textVectorization({
        maxTokens: MAX_TOKENS,
        outputSequenceLength: MAX_LEN
    });

    tokenizer.adapt(tf.data.array(texts));
    return tokenizer;
}

async function trainModel() {
    const tokenizer = await tokenizeText(texts);

    const xData = texts.map(text => tokenizer.call(tf.tensor([text])));

    const X = tf.tensor2d(xData, [xData.length, MAX_LEN]);
    const Y = tf.tensor1d(yData, 'int32');

    const model = tf.sequential();
    model.add(tf.layers.embedding({ inputDim: MAX_TOKENS, outputDim: 128, inputLength: MAX_LEN }));
    model.add(tf.layers.lstm({ units: 64, returnSequences: true }));
    model.add(tf.layers.lstm({ units: 32 }));
    model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

    // Compile model
    model.compile({
        optimizer: tf.train.adam(),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
    });

    console.log("✅ Model architecture:");
    model.summary();

    await model.fit(X, Y, {
        epochs: 10,
        batchSize: 32,
        validationSplit: 0.2
    });

    // Save the model
    await model.save(`file://./Backend/data/fake_news_model`);
    console.log("✅ Model training complete and saved!");

}

trainModel();