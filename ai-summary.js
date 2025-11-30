/*
PDF TEXT EXTRACTION -
 extracts text from a URL storing the bill data and returns it as a concatednated string
 by using PDF.js library. 
*/
async function extractTextFromPDF(pdfUrl) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    try {
        console.log('Loading PDF from:', pdfUrl);
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        
        let fullText = '';
        const maxPages = Math.min(pdf.numPages, 80);
        
        console.log(`Processing ${maxPages} pages...`);
        
        for (let i = 1; i <= maxPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n\n';
            
            document.getElementById('ai-overview').innerHTML = 
                `<p>Processing page ${i}/${maxPages}...</p>`;
        }
        
        console.log('Extracted text length:', fullText.length);
        return fullText;
        
    } catch (error) {
        console.error('PDF extraction error:', error);
        throw new Error('Failed to extract text from PDF');
    }
}

/*
GENERATES AI SUMMARY-
1. Collects a refernece to the AI overview display elements and switches to a loading state.
2. Sends a POST request to /ai-summary with the billText
3. Checks for HTTP response and parses JSON response data
4. Updates UI with the proper format 
*/
async function generateAISummary(billText) {
    const aiOverview = document.getElementById('ai-overview');
    
    try {
        aiOverview.innerHTML = '<p>Generating AI summary with Cloudflare AI...</p>';
        console.log('Sending to Cloudflare Worker...');
        
        const response = await fetch('/ai-summary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                bill_text: billText.substring(0, 8000)
            })
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('AI analysis received:', data);
        
        aiOverview.innerHTML = `
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #661616;">
                <h4 style="margin-top: 0; color: #661616;">AI Overview</h4>
                <div style="white-space: pre-wrap; line-height: 1.6;">${data.summary}</div>
                <p style="margin-top: 15px; padding: 8px; background: #e8f5e8; border-radius: 4px; font-size: 12px;">
                     Powered by Cloudflare AI
                </p>
            </div>
        `;

    } catch (error) {
        console.error('AI Analysis Error:', error);
        aiOverview.innerHTML = `
            <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border: 1px solid #ffeaa7;">
                <h4 style="margin-top: 0; color: #856404;">Cloudflare AI Service Error</h4>
                <p><strong>Error:</strong> ${error.message}</p>
                <p>Please check:</p>
                <ul>
                    <li>Worker is deployed with <code>wrangler deploy</code></li>
                    <li>AI binding is configured in wrangler.jsonc</li>
                    <li>Functions directory exists with ai-summary/index.js</li>
                </ul>
                <button onclick="retryAI()" style="padding: 8px 16px; background: #661616; color: white; border: none; border-radius: 4px;">Retry</button>
            </div>
        `;
    }
}

function retryAI() {
    const params = new URLSearchParams(window.location.search);
    const vote_id = params.get("vote_id");
    if (vote_id) {
        processBillWithAI();
    }
}

/*
    PROCESSING BILL WITH AI-
    1. Finds the vote_id for the currently selected measure
    2. Extracts raw text using extractTextFromPDF() after directly referencing github to find the PDF corrosponding with the vote_id
    3. Generates the AI summary using generateAISummary()
*/
async function processBillWithAI() {
    
    const params = new URLSearchParams(window.location.search);
    const vote_id = params.get("vote_id");
    
    if (!vote_id) {
        document.getElementById('ai-overview').innerHTML = '<p>No bill ID provided.</p>';
        return;
    }

    const pdfUrl = `https://raw.githubusercontent.com/Epsilon157/Software-Engineering-Project/main/Website%20Assets/BillStoragePDFs/${vote_id}.pdf`;
    
    try {
        document.getElementById('ai-overview').innerHTML = '<p>Extracting text from PDF...</p>';
        const extractedText = await extractTextFromPDF(pdfUrl);
        
        if (extractedText && extractedText.length > 100) {
            await generateAISummary(extractedText);
        } else {
            throw new Error('Insufficient text extracted from PDF');
        }

    } catch (error) {
        console.error('Process error:', error);
        document.getElementById('ai-overview').innerHTML = `
            <div style="background: #f8d7da; padding: 15px; border-radius: 5px; border: 1px solid #f5c6cb;">
                <p> Error processing bill: ${error.message}</p>
            </div>
        `;
    }
}

// Start processing when page loads
document.addEventListener('DOMContentLoaded', function() {
    processBillWithAI();
});




