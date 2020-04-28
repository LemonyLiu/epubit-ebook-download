import PDFDocument from "pdfkit";
import fs, { write } from "fs";
import cheerio from "cheerio";

const doc: PDFKit.PDFDocument = new PDFDocument;
doc.pipe(fs.createWriteStream('output.pdf'));
const html: string = fs.readFileSync("books/9afea4fd-cbc9-4428-860e-e49258d2b0d3/html/Solr实现多边形地理搜索.html").toString();
const documents = cheerio.parseHTML(html);
documents.filter(d => d !== null)
    .forEach((document: any) => {
        writeDoc(doc, document);
    })
doc.end();

function writeDoc(d: PDFKit.PDFDocument, n: Node, parentNode?: Node): void {
    console.log(n.nodeName, n.nodeValue)
    if (n.nodeType === 1 && n.hasChildNodes()) {
        //tag node
        writeDoc(d, n.childNodes[0], n);
    }
    if (n.nodeType === 3) {
        //text node
        console.log(n.nodeName, n.nodeValue)
    }
}