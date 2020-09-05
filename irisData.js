// Iris flowers data. Source:
//   https://archive.ics.uci.edu/ml/machine-learning-databases/iris/iris.data
const IRIS_DATA = { xData: [
                            [5.1,3.5,1.4,0.2],
                            [4.9,3. ,1.4,0.2],
                            [4.7,3.2,1.3,0.2],
                            [4.6,3.1,1.5,0.2],
                            [5. ,3.6,1.4,0.2],
                            [5.4,3.9,1.7,0.4],
                            [4.6,3.4,1.4,0.3],
                            [5. ,3.4,1.5,0.2],
                            [4.4,2.9,1.4,0.2],
                            [4.9,3.1,1.5,0.1],
                            [5.4,3.7,1.5,0.2],
                            [4.8,3.4,1.6,0.2],
                            [4.8,3. ,1.4,0.1],
                            [4.3,3. ,1.1,0.1],
                            [5.8,4. ,1.2,0.2],
                            [5.7,4.4,1.5,0.4],
                            [5.4,3.9,1.3,0.4],
                            [5.1,3.5,1.4,0.3],
                            [5.7,3.8,1.7,0.3],
                            [5.1,3.8,1.5,0.3],
                            [5.4,3.4,1.7,0.2],
                            [5.1,3.7,1.5,0.4],
                            [4.6,3.6,1. ,0.2],
                            [5.1,3.3,1.7,0.5],
                            [4.8,3.4,1.9,0.2],
                            [5. ,3. ,1.6,0.2],
                            [5. ,3.4,1.6,0.4],
                            [5.2,3.5,1.5,0.2],
                            [5.2,3.4,1.4,0.2],
                            [4.7,3.2,1.6,0.2],
                            [4.8,3.1,1.6,0.2],
                            [5.4,3.4,1.5,0.4],
                            [5.2,4.1,1.5,0.1],
                            [5.5,4.2,1.4,0.2],
                            [4.9,3.1,1.5,0.1],
                            [5. ,3.2,1.2,0.2],
                            [5.5,3.5,1.3,0.2],
                            [4.9,3.1,1.5,0.1],
                            [4.4,3. ,1.3,0.2],
                            [5.1,3.4,1.5,0.2],
                            [5. ,3.5,1.3,0.3],
                            [4.5,2.3,1.3,0.3],
                            [4.4,3.2,1.3,0.2],
                            [5. ,3.5,1.6,0.6],
                            [5.1,3.8,1.9,0.4],
                            [4.8,3. ,1.4,0.3],
                            [5.1,3.8,1.6,0.2],
                            [4.6,3.2,1.4,0.2],
                            [5.3,3.7,1.5,0.2],
                            [5. ,3.3,1.4,0.2],
                            [7. ,3.2,4.7,1.4],
                            [6.4,3.2,4.5,1.5],
                            [6.9,3.1,4.9,1.5],
                            [5.5,2.3,4. ,1.3],
                            [6.5,2.8,4.6,1.5],
                            [5.7,2.8,4.5,1.3],
                            [6.3,3.3,4.7,1.6],
                            [4.9,2.4,3.3,1. ],
                            [6.6,2.9,4.6,1.3],
                            [5.2,2.7,3.9,1.4],
                            [5. ,2. ,3.5,1. ],
                            [5.9,3. ,4.2,1.5],
                            [6. ,2.2,4. ,1. ],
                            [6.1,2.9,4.7,1.4],
                            [5.6,2.9,3.6,1.3],
                            [6.7,3.1,4.4,1.4],
                            [5.6,3. ,4.5,1.5],
                            [5.8,2.7,4.1,1. ],
                            [6.2,2.2,4.5,1.5],
                            [5.6,2.5,3.9,1.1],
                            [5.9,3.2,4.8,1.8],
                            [6.1,2.8,4. ,1.3],
                            [6.3,2.5,4.9,1.5],
                            [6.1,2.8,4.7,1.2],
                            [6.4,2.9,4.3,1.3],
                            [6.6,3. ,4.4,1.4],
                            [6.8,2.8,4.8,1.4],
                            [6.7,3. ,5. ,1.7],
                            [6. ,2.9,4.5,1.5],
                            [5.7,2.6,3.5,1. ],
                            [5.5,2.4,3.8,1.1],
                            [5.5,2.4,3.7,1. ],
                            [5.8,2.7,3.9,1.2],
                            [6. ,2.7,5.1,1.6],
                            [5.4,3. ,4.5,1.5],
                            [6. ,3.4,4.5,1.6],
                            [6.7,3.1,4.7,1.5],
                            [6.3,2.3,4.4,1.3],
                            [5.6,3. ,4.1,1.3],
                            [5.5,2.5,4. ,1.3],
                            [5.5,2.6,4.4,1.2],
                            [6.1,3. ,4.6,1.4],
                            [5.8,2.6,4. ,1.2],
                            [5. ,2.3,3.3,1. ],
                            [5.6,2.7,4.2,1.3],
                            [5.7,3. ,4.2,1.2],
                            [5.7,2.9,4.2,1.3],
                            [6.2,2.9,4.3,1.3],
                            [5.1,2.5,3. ,1.1],
                            [5.7,2.8,4.1,1.3],
                            [6.3,3.3,6. ,2.5],
                            [5.8,2.7,5.1,1.9],
                            [7.1,3. ,5.9,2.1],
                            [6.3,2.9,5.6,1.8],
                            [6.5,3. ,5.8,2.2],
                            [7.6,3. ,6.6,2.1],
                            [4.9,2.5,4.5,1.7],
                            [7.3,2.9,6.3,1.8],
                            [6.7,2.5,5.8,1.8],
                            [7.2,3.6,6.1,2.5],
                            [6.5,3.2,5.1,2. ],
                            [6.4,2.7,5.3,1.9],
                            [6.8,3. ,5.5,2.1],
                            [5.7,2.5,5. ,2. ],
                            [5.8,2.8,5.1,2.4],
                            [6.4,3.2,5.3,2.3],
                            [6.5,3. ,5.5,1.8],
                            [7.7,3.8,6.7,2.2],
                            [7.7,2.6,6.9,2.3],
                            [6. ,2.2,5. ,1.5],
                            [6.9,3.2,5.7,2.3],
                            [5.6,2.8,4.9,2. ],
                            [7.7,2.8,6.7,2. ],
                            [6.3,2.7,4.9,1.8],
                            [6.7,3.3,5.7,2.1],
                            [7.2,3.2,6. ,1.8],
                            [6.2,2.8,4.8,1.8],
                            [6.1,3. ,4.9,1.8],
                            [6.4,2.8,5.6,2.1],
                            [7.2,3. ,5.8,1.6],
                            [7.4,2.8,6.1,1.9],
                            [7.9,3.8,6.4,2. ],
                            [6.4,2.8,5.6,2.2],
                            [6.3,2.8,5.1,1.5],
                            [6.1,2.6,5.6,1.4],
                            [7.7,3. ,6.1,2.3],
                            [6.3,3.4,5.6,2.4],
                            [6.4,3.1,5.5,1.8],
                            [6. ,3. ,4.8,1.8],
                            [6.9,3.1,5.4,2.1],
                            [6.7,3.1,5.6,2.4],
                            [6.9,3.1,5.1,2.3],
                            [5.8,2.7,5.1,1.9],
                            [6.8,3.2,5.9,2.3],
                            [6.7,3.3,5.7,2.5],
                            [6.7,3. ,5.2,2.3],
                            [6.3,2.5,5. ,1.9],
                            [6.5,3. ,5.2,2. ],
                            [6.2,3.4,5.4,2.3],
                            [5.9,3. ,5.1,1.8]
                           ],
                    yData: [
                            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                            1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
                            1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
                            2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,
                            2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2
                           ],
                    classes: ["Iris-setosa", "Iris-versicolor", "Iris-virginica"]
                };

/**
 * Extracts additional information from the dataset.
 *
 * @param dataset The dataset object to be used.
 * @return An `Object`, with
 *   - numSamples The number of samples in the dataset.
 *   - numFeatures The number of features in each sample.
 *   - numClasses The number of output classes.
 */
function getInfo(dataset) {
    return { 
               numSamples: dataset.xData.length,
               numFeatures: dataset.xData[0].length,
               numClasses: dataset.classes.length
           };              
}

/**
 * Groups the input and output data by class.
 *
 * @param dataset The dataset object to be used.
 * @param info Additional information about the dataset.
 * @return An `Object`, with
 *   - input groups as an `Array` of shape [numClasses, numSamples, numFeatures].
 *   - output groups as an `Array` of shape [numClasses, numSamples].
 */
function groupDataByClass(dataset, info) {
    const inputGroups = [];
    const outputGroups = [];
    for (let i = 0; i < info.numClasses; i++) {
        inputGroups.push([]);
        outputGroups.push([]);
    }
    for (let i = 0; i < info.numSamples; i++) {
        inputGroups[dataset.yData[i]].push(dataset.xData[i]);
        outputGroups[dataset.yData[i]].push(dataset.yData[i]);   
    }

    return {
        inputGroups: inputGroups, 
        outputGroups: outputGroups
    };
}


/**
 * Shuffle the input and output data pairs.
 *
 * @param dataX The input data.
 * @param dataY The output data.
 * @return An `Object`, with
 *   - shuffled inputs as an `Array` of the same shape as dataX.
 *   - shuffled shuffled outputs as an `Array` of the same shape as dataY.
 */
function shuffleData(dataX, dataY) {
    // Create array of indices.
    const indices = [];
    for (let i = 0; i < dataY.length; i++) {
        indices.push(i);
    }
    // Randomly shuffle indices.
    tf.util.shuffle(indices);

    // Create arrays for shuffled inputs and outputs.
    const shuffledX = [];
    const shuffledY = [];
    for (const i of indices) {
        shuffledX.push(dataX[i]);
        shuffledY.push(dataY[i]);
    }

    return {
        inputs: shuffledX, 
        outputs: shuffledY
    };
}

/**
 * Shuffle the input and output data pairs within each class.
 *
 * @param inputGroups The input data grouped by classes.
 * @param outputGroups The output data grouped by classes.
 * @param numClasses The number of output classes.
 * @return An `Object`, with
 *   - shuffled inputs as an `Array` of shape [numSamples, numFeatures].
 *   - shuffled outputs as an `Array` of length numSamples.
 */
function shuffleByClass(inputGroups, outputGroups, numClasses) {
    const shuffledXGroups = [];
    const shuffledYGroups = [];
    for (let i = 0; i < numClasses; i++) {
        const shuffledData = shuffleData(inputGroups[i], outputGroups[i]);
        shuffledXGroups.push(shuffledData.inputs);
        shuffledYGroups.push(shuffledData.outputs);
    }

    return {
        inputGroups: shuffledXGroups, 
        outputGroups: shuffledYGroups
    };
}

/**
 * Splits inputs and outputs into training and validation sets.
 *
 * @param inputGroups The input data grouped by classes.
 * @param outputGroups The output data grouped by classes.
 * @param numClasses The number of output classes.
 * @param valSplit Fraction of data to be used as validation data: a number between 0 and 1.
 * @return An `Object`, with
 *   - training inputs as an `Array` of shape [(1 - valSplit) * numSamples, numFeatures].
 *   - training outputs as an `Array` of length (1 - valSplit) * numSamples.
 *   - validation inputs as an `Array` of shape [valSplit * numSamples, numFeatures].
 *   - validation outputs as an `Array` of length valSplit * numSamples.
 */
function splitData(inputGroups, outputGroups, numClasses, valSplit) {
    const xTrain = [];
    const yTrain = [];
    const xVal = [];
    const yVal = [];

    for (let i = 0; i < numClasses; i++) {
        const numValSamples = Math.round(valSplit * outputGroups[i].length);
        Array.prototype.push.apply(xVal, inputGroups[i].slice(0, numValSamples));
        Array.prototype.push.apply(yVal, outputGroups[i].slice(0, numValSamples));
        Array.prototype.push.apply(xTrain, inputGroups[i].slice(numValSamples));
        Array.prototype.push.apply(yTrain, outputGroups[i].slice(numValSamples));
        
    }
    
    return {
        xTrain: xTrain,
        yTrain: yTrain,
        xVal: xVal, 
        yVal, yVal
    };
}


/**
 * Converts input and output data to `tf.Tensor`s.
 *
 * @param datasetID The ID used to specify a dataset.
 * @param valSplit Fraction of data to be used as validation data: a number between 0 and 1.
 * @return An `Object`, with
 *   - training input as `tf.Tensor` of shape [numTrainExamples, numFeatures].
 *   - training one-hot outputs as a `tf.Tensor` of shape [numTrainExamples, numClasses]
 *   - validation input as `tf.Tensor` of shape [numTestExamples, numFeatures].
 *   - validation one-hot outputs as a `tf.Tensor` of shape [numTestExamples, numClasses]
 *   - mean as a `tf.Tensor` of shape [numFeatures]
 *   - standard deviation as a `tf.Tensor` of shape [numFeatures]
 *   - info as an `Object` containing additional information about the dataset.
 *   - classes as an `Array` of length numClasses
 */
export function data2Tensor(datasetID, valSplit) {
    let dataset;
    switch (datasetID) {
        case 0:
            dataset = IRIS_DATA;
            break;
        default:
            dataset = IRIS_DATA;
    }

    // Wrapping these calculations in a tidy will dispose any intermediate tensors.
    return tf.tidy(() => {
        const info = getInfo(dataset);
        const groups = groupDataByClass(dataset, info);
        const shuffledData = shuffleByClass(groups.inputGroups, groups.outputGroups, info.numClasses);
        const irisData = splitData(shuffledData.inputGroups, shuffledData.outputGroups, info.numClasses, valSplit);
        
        // Create 2D `tf.Tensor` to hold the training and validation data.
        const xTrainTensor = tf.tensor2d(irisData.xTrain, [irisData.xTrain.length, info.numFeatures]);
        const xValTensor = tf.tensor2d(irisData.xVal, [irisData.xVal.length, info.numFeatures]);
        // Create 1D `tf.Tensor` to hold the labels, and convert the number label
        // from the set {0, 1, 2} into one-hot encoding (e.g., 0 --> [1, 0, 0]).
        const yTrainTensor = tf.oneHot(tf.tensor1d(irisData.yTrain).toInt(), info.numClasses);
        const yValTensor = tf.oneHot(tf.tensor1d(irisData.yVal).toInt(), info.numClasses);

        // Create a 2D `tf.Tensor` for the input data (for taking the mean and std).
        const inputTensor = tf.tensor2d(dataset.xData, [info.numSamples, info.numFeatures]);
        // Calculate the mean and std of the input data.
        const axis = 0;
        const inputMean = inputTensor.mean(axis);
        const inputStd = inputTensor.sub(inputMean).square().sum(axis).sqrt();
        // Standardize the training and validation data to mean = 0, std = 1.
        const normalizedXTrain = xTrainTensor.sub(inputMean).div(inputStd);
        const normalizedXVal = xValTensor.sub(inputMean).div(inputStd);

        return {
            xTrain: normalizedXTrain,
            yTrain: yTrainTensor,
            xVal: normalizedXVal,
            yVal: yValTensor,
            mean: inputMean,
            std: inputStd,
            info: info,
            classes: dataset.classes
        };
    });
}
