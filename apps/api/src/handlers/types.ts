/**
 * This represents the format all handlers should follow as an export in their root handler folder. 
 * 
 * Either: @class @object
 */
export interface IHandler {
    downloadFile (): Promise<string>;
    uploadFile (data: Buffer): Promise<Record<string, any>>;
    getAverageWaitTime (): number; // milliseconds
    getStatus(): Promise<'working' | 'unavailable' | 'error'>;
}