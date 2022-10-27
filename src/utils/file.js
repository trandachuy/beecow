import moment from 'moment'

var FileSaver = require('file-saver');

/**
 *
 * @param {File} file
 */
const getExtension = (file) => {
    const [_, extension] = file.type.split('/')
    return extension
}

const downloadByUrl = url => {
    FileSaver.saveAs(url, 'image.jpg');
}

const html2PDF = elementId => {
    // const content = document.getElementById('order-kpos-template');

    // html2canvas(content)
    //     .then(canvas => {
    //         console.log(canvas)
    //         const dataUrl = canvas.toDataURL('img/png'); //attempt to save base64 string to server using this var  
    //         const pdf = new jsPDF('p', 'mm', 'a4');
    //         pdf.addImage(dataUrl, 'PNG', 1, 1);
    //         pdf.save("File.pdf");
    //     })
}

const downloadByFile = file => {
    FileSaver.saveAs(file, `orders-${moment().utc().format()}.html`);
}

export const FileUtils = {
    getExtension,
    downloadByUrl,
    downloadByFile,
    html2PDF
}