/** User-selected generated attachments only; never read conversation text or application state. */
export declare const WEBSITE_FILE_MAX_BYTES: number;
export type WebsiteFile = {
    readonly kind: 'file';
    readonly name: string;
    readonly mediaType: string;
    readonly dataUrl: string;
};
export type WebsiteDownload = WebsiteFile | {
    readonly kind: 'failed' | 'too-large' | 'busy';
};
/** Runs in the approved guest. No API replacement, preload, IPC, storage or private React state. */
export declare function manageWebsiteDownloads(doc: Document, origin: string, action: 'poll' | 'dispose', enabled: boolean, maxBytes: number): unknown;
export declare function websiteDownloadScript(action: 'poll' | 'dispose', enabled?: boolean): string;
/** Treat guest output as untrusted; never hand an arbitrary URL to the native saver. */
export declare function parseWebsiteDownload(value: unknown): WebsiteDownload | null;
/** Reconstitute only the explicitly selected file; bytes never enter a UI snapshot or log. */
export declare function websiteDownloadBlob(value: WebsiteFile): Blob;
