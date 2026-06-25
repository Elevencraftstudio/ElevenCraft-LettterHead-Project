import { ExportMetadata, ExportDocumentModel, APP_VERSION } from './types';

/** Build a complete metadata object from the document plus user overrides. */
export function buildMetadata(doc: ExportDocumentModel, partial?: Partial<ExportMetadata>): ExportMetadata {
  const now = new Date().toISOString();
  const companyName = (doc.company?.name as string) ?? '';
  return {
    title: partial?.title ?? doc.title ?? 'Untitled',
    author: partial?.author ?? companyName,
    company: partial?.company ?? companyName,
    subject: partial?.subject ?? ((doc.letter?.subject as string) ?? ''),
    keywords: partial?.keywords ?? [],
    createdDate: partial?.createdDate ?? now,
    modifiedDate: partial?.modifiedDate ?? now,
    documentVersion: partial?.documentVersion ?? '1.0',
    appVersion: APP_VERSION,
  };
}
