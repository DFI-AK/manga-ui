export interface ISystemUsageDto {
    cpuUsagePercentage: number;
    memoryUsagePercentage: number;
    networkBytesSent: number;
    networkBytesReceived: number;
    diskReadBytes: number;
    diskWriteBytes: number;
    timeStamp: string;
}

export type DiskUsageKeys = "read" | "write";
export type NetworkTrafficKeys = "transmit" | "received";
