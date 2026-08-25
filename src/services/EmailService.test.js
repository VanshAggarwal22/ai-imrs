import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EmailService } from './EmailService';

describe('EmailService', () => {
    describe('generatePdfBase64', () => {
        let mockHtml2Pdf;
        let setMock;
        let fromMock;
        let outputPdfMock;
        let originalHtml2Pdf;

        beforeEach(() => {
            originalHtml2Pdf = window.html2pdf;

            outputPdfMock = vi.fn().mockResolvedValue('data:application/pdf;base64,mockbase64data');
            fromMock = vi.fn().mockReturnValue({ outputPdf: outputPdfMock });
            setMock = vi.fn().mockReturnValue({ from: fromMock });

            mockHtml2Pdf = vi.fn().mockReturnValue({ set: setMock });

            window.html2pdf = mockHtml2Pdf;

            vi.spyOn(document.body, 'appendChild');
            vi.spyOn(document.body, 'removeChild');
        });

        afterEach(() => {
            vi.restoreAllMocks();
            window.html2pdf = originalHtml2Pdf;
        });

        it('should generate a base64 string using html2pdf when window.html2pdf is already loaded', async () => {
            const htmlString = '<div><p>Test Content</p></div>';

            const result = await EmailService.generatePdfBase64(htmlString, 'test_already_loaded.pdf');

            expect(result).toBe('mockbase64data');
            expect(mockHtml2Pdf).toHaveBeenCalled();
            expect(setMock).toHaveBeenCalledWith(expect.objectContaining({
                filename: 'test_already_loaded.pdf'
            }));
            expect(fromMock).toHaveBeenCalled();
            expect(outputPdfMock).toHaveBeenCalledWith('datauristring');

            // Check DOM manipulation
            expect(document.body.appendChild).toHaveBeenCalled();
            expect(document.body.removeChild).toHaveBeenCalled();
        });

        it('should load html2pdf script if not already loaded', async () => {
            delete window.html2pdf;

            const appendChildSpy = vi.spyOn(document.head, 'appendChild');

            // We need to simulate the script load event
            const originalCreateElement = document.createElement.bind(document);
            vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
                const el = originalCreateElement(tagName);
                if (tagName === 'script') {
                    setTimeout(() => {
                        window.html2pdf = mockHtml2Pdf; // Set it before triggering onload
                        if (el.onload) el.onload();
                    }, 10);
                }
                return el;
            });

            const htmlString = '<div><p>Test</p></div>';
            const result = await EmailService.generatePdfBase64(htmlString, 'test_load_script.pdf');

            expect(appendChildSpy).toHaveBeenCalled();
            const addedScript = appendChildSpy.mock.calls.find(call => call[0].tagName === 'SCRIPT');
            expect(addedScript).toBeDefined();
            expect(addedScript[0].src).toBe('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');

            expect(result).toBe('mockbase64data');
        });

        it('should wait for images to load before generating PDF', async () => {
            const htmlString = `
                <div>
                    <img id="img1" src="test1.jpg" />
                    <img id="img2" src="test2.jpg" />
                </div>
            `;

            const originalCreateElement = document.createElement.bind(document);
            vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
                const el = originalCreateElement(tagName);
                if (tagName === 'div') {
                    // We need to mock the innerHTML assignment to set up our mock images
                    let _innerHTML = '';
                    Object.defineProperty(el, 'innerHTML', {
                        get: () => _innerHTML,
                        set: (val) => {
                            _innerHTML = val;

                            // Mocking the behavior for the images specifically
                            const img1 = originalCreateElement('img');
                            Object.defineProperty(img1, 'complete', { value: true }); // Already loaded

                            const img2 = originalCreateElement('img');
                            Object.defineProperty(img2, 'complete', { value: false }); // Needs load event
                            setTimeout(() => {
                                if (img2.onload) img2.onload();
                            }, 10);

                            // Simulate the structure that querySelectorAll will find
                            const mockQuerySelectorAll = vi.fn().mockReturnValue([img1, img2]);

                            // A bit hacky but we need to intercept the wrapper's firstElementChild
                            const mockFirstElementChild = {
                                style: {},
                                querySelectorAll: mockQuerySelectorAll
                            };
                            Object.defineProperty(el, 'firstElementChild', { value: mockFirstElementChild });
                        }
                    });
                }
                return el;
            });

            const result = await EmailService.generatePdfBase64(htmlString, 'test_images.pdf');

            expect(result).toBe('mockbase64data');
            expect(outputPdfMock).toHaveBeenCalled();
        });

        it('should properly clean up the DOM even if html2pdf throws an error', async () => {
            outputPdfMock.mockRejectedValueOnce(new Error('PDF generation failed'));

            const htmlString = '<div><p>Error Test</p></div>';

            await expect(EmailService.generatePdfBase64(htmlString)).rejects.toThrow('PDF generation failed');

            expect(document.body.removeChild).toHaveBeenCalled();
        });
    });
});
