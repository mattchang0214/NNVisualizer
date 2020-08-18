import numpy as np

NUM_SAMPLES = 150
NUM_FEATURES = 4


def savetxt(file_name, data):
    with open(file_name, 'a') as f:
        f.write(np.array2string(data, max_line_width=80, separator=',', prefix='[', suffix=']'))
        f.write('\n')


if __name__ == '__main__':
    # preallocate matrix for iris data
    xData = np.empty((NUM_SAMPLES, NUM_FEATURES))
    yData = np.empty(NUM_SAMPLES, dtype=object)
    classDict = dict()

    # fill in matrix with data
    with open('iris.data') as f:
        num = 0
        for line in f:
            line = line.rstrip()
            if line:
                entries = line.split(',')
                xData[num, :] = list(map(float, entries[:-1]))
                if entries[-1] not in classDict:
                    classDict[entries[-1]] = len(classDict)
                yData[num] = classDict[entries[-1]]
                num += 1

    savetxt('xData_iris.txt', xData)
    savetxt('yData_iris.txt', yData)
