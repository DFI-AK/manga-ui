export interface ISystemUsageDto {
    cpuUsagePercentage: number;
    memoryUsagePercentage: number;
    networkBytesSent: number;
    networkBytesReceived: number;
    diskReadBytes: number;
    diskWriteBytes: number;
    timeStamp: string;
}

export interface ISystemDetailDto {
    machineName: string;
    osVersion: string;
    processorCount: number;
    architecture: string;
    totalMemoryKB: number;
    freeMemoryKB: number;
}

export interface IToken {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}