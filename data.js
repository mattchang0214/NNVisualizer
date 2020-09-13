import * as classData from "./classificationData.js";

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
    if (dataset.classes != null) {
        return { 
                   numSamples: dataset.xData.length,
                   numFeatures: dataset.features.length,
                   numClasses: dataset.classes.length
               };  
    }

    return { 
               numSamples: dataset.xData.length,
               numFeatures: dataset.features.length,
               numClasses: 0
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
            dataset = classData.IRIS_DATA;
            break;
        default:
            dataset = classData.IRIS_DATA;
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
            /*mean: inputMean,
            std: inputStd,*/
            info: info,
            classes: dataset.classes,
            features: dataset.features
        };
    });
}
