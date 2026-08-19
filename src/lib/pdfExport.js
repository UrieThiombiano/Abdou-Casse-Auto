import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// Capture un element DOM (le papier de la facture proforma) et le telecharge
// en PDF A4, en repartissant sur plusieurs pages si le contenu deborde.
export async function downloadElementAsPdf(elementId, filename) {
    const element = document.getElementById(elementId)
    if (!element) return

    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff', useCORS: true })
    const imgData = canvas.toDataURL('image/png')

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pageWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
    }

    pdf.save(filename)
}
