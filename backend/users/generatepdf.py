# from PyPDF2 import PdfWriter, PdfReader
# import io
# from reportlab.pdfgen import canvas
# from reportlab.lib.pagesizes import letter
# from datetime import datetime

# def pdf(results3 , results2, new):

#     packet = io.BytesIO()
#     font_size = 11  # Adjust this value as needed
#     can = canvas.Canvas(packet, pagesize=letter)
#     can.setFont("Helvetica", font_size)

#     can.drawString(490, 709, new)
#     can.drawString(232, 679, results3[0])
#     can.drawString(230, 659, results3[1])
#     can.drawString(245, 659, "Y/O , ")
#     can.drawString(273, 659, results3[2])
#     # can.drawString(242, 657, Data['Contact'])
#     can.drawString(232, 639, results3[3])
#     can.drawString(490, 604, results3[4])
#     can.drawString(490, 576, results2[11])
#     can.drawString(490, 547, results2[0])
#     can.drawString(490, 519, results2[1])
#     can.drawString(490, 490, results2[2])
#     can.drawString(490, 462, results2[3])
#     can.drawString(490, 433, results2[4])
#     can.drawString(490, 405, results2[5])
#     can.drawString(488, 377, results2[6])
#     can.drawString(508, 377, "/")
#     can.drawString(512, 377, results2[7])
#     can.drawString(488 , 348 , results2[8])
#     can.save()

#     packet.seek(0)


#     new_pdf = PdfReader(packet)
#     existing_pdf = PdfReader(open("/Users/varunbalaji/Documents/iotapp/backend/users/form.pdf", "rb"))
#     output = PdfWriter()
#     page = existing_pdf.pages[0]
#     page.merge_page(new_pdf.pages[0])
#     output.add_page(page)
#     output_stream = open("/Users/varunbalaji/Documents/iotapp/backend/users/output.pdf", "wb")
#     output.write(output_stream)
#     output_stream.close()
#     return "saved success"


# # pdf(results3=[['DIKSHANT', '24', 'Male', '7', 'O+']],results2=[['914.72', '100', '709', '176.55', '712.32', '800', '12', '141', '16.50', '23.25']], new = datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
from django.conf import settings
import os
from PyPDF2 import PdfWriter, PdfReader
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter


def pdf(results3, results2, new_date):
    packet = io.BytesIO()
    font_size = 11  # Adjust this value as needed
    can = canvas.Canvas(packet, pagesize=letter)
    can.setFont("Helvetica", font_size)

    # Convert `new_date` to string if it isn't already
    can.drawString(490, 709, str(new_date))
    can.drawString(232, 679, str(results3[0]))
    can.drawString(230, 659, str(results3[1]))
    can.drawString(245, 659, "Y/O , ")
    can.drawString(273, 659, str(results3[2]))
    can.drawString(232, 639, str(results3[3]))
    can.drawString(490, 604, str(results3[4]))

    # Convert elements in `results2` to strings before drawing
    can.drawString(490, 576, str(results2[11]) if len(results2) > 11 else "N/A")
    can.drawString(490, 547, str(results2[0]))
    can.drawString(490, 519, str(results2[1]))
    can.drawString(490, 490, str(results2[2]))
    can.drawString(490, 462, str(results2[3]))
    can.drawString(490, 433, str(results2[4]))
    can.drawString(490, 405, str(results2[5]))
    can.drawString(488, 377, str(results2[6]))
    can.drawString(508, 377, "/")
    can.drawString(512, 377, str(results2[7]))
    can.drawString(488, 348, str(results2[8]))
    can.save()

    packet.seek(0)
    new_pdf = PdfReader(packet)

    # Use a relative path for the form.pdf
    form_pdf_path = os.path.join(
        settings.BASE_DIR, "users", "form.pdf"
    )  # Adjust the path as needed
    existing_pdf = PdfReader(open(form_pdf_path, "rb"))

    output = PdfWriter()
    page = existing_pdf.pages[0]
    page.merge_page(new_pdf.pages[0])
    output.add_page(page)

    # Save the output PDF
    output_stream = open(os.path.join(settings.MEDIA_ROOT, "output.pdf"), "wb")
    output.write(output_stream)
    output_stream.close()

    return "saved success"
