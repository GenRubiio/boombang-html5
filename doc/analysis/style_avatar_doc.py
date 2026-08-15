from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.section import WD_SECTION
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from pathlib import Path
import re, sys

src=Path(sys.argv[1]); out=Path(sys.argv[2])
doc=Document(src)
BLUE='2E74B5'; DARK='1F4D78'; PALE='E8EEF5'; WHITE='FFFFFF'; BORDER='AEBFD0'; MUTED='66788A'

def set_cell_shading(cell, fill):
    tcPr=cell._tc.get_or_add_tcPr(); shd=tcPr.find(qn('w:shd'))
    if shd is None: shd=OxmlElement('w:shd'); tcPr.append(shd)
    shd.set(qn('w:fill'),fill)

def set_cell_margins(cell, top=80, start=120, bottom=80, end=120):
    tcPr=cell._tc.get_or_add_tcPr(); tcMar=tcPr.first_child_found_in('w:tcMar')
    if tcMar is None: tcMar=OxmlElement('w:tcMar'); tcPr.append(tcMar)
    for tag,val in [('top',top),('start',start),('bottom',bottom),('end',end)]:
        node=tcMar.find(qn('w:'+tag))
        if node is None: node=OxmlElement('w:'+tag); tcMar.append(node)
        node.set(qn('w:w'),str(val)); node.set(qn('w:type'),'dxa')

def set_repeat_table_header(row):
    trPr=row._tr.get_or_add_trPr(); e=OxmlElement('w:tblHeader'); e.set(qn('w:val'),'true'); trPr.append(e)

def set_repeat_heading(p):
    pPr=p._p.get_or_add_pPr(); keep=OxmlElement('w:keepNext'); keep.set(qn('w:val'),'1'); pPr.append(keep)

def set_font(run,name='Calibri',size=None,color=None,bold=None,italic=None):
    run.font.name=name; run._element.get_or_add_rPr().rFonts.set(qn('w:ascii'),name); run._element.get_or_add_rPr().rFonts.set(qn('w:hAnsi'),name)
    if size: run.font.size=Pt(size)
    if color: run.font.color.rgb=RGBColor.from_string(color)
    if bold is not None: run.bold=bold
    if italic is not None: run.italic=italic

# Page geometry and running furniture
for sec in doc.sections:
    sec.page_width=Inches(8.5); sec.page_height=Inches(11)
    sec.top_margin=Inches(.78); sec.bottom_margin=Inches(.72); sec.left_margin=Inches(1); sec.right_margin=Inches(1)
    sec.header_distance=Inches(.32); sec.footer_distance=Inches(.3)
    hp=sec.header.paragraphs[0]; hp.clear(); hp.text='BOOMBANG HTML5  |  ESPECIFICACIÓN FUNCIONAL'; hp.alignment=WD_ALIGN_PARAGRAPH.RIGHT
    for run in hp.runs: set_font(run,size=8,color=MUTED,bold=True)
    fp=sec.footer.paragraphs[0]; fp.clear(); fp.alignment=WD_ALIGN_PARAGRAPH.CENTER
    r=fp.add_run('Documento de implementación  •  15/08/2026  •  '); set_font(r,size=8,color=MUTED)
    fld=OxmlElement('w:fldSimple'); fld.set(qn('w:instr'),'PAGE'); fp._p.append(fld)

styles=doc.styles
for name,size,color,before,after in [
    ('Normal',11,None,0,6),('Body Text',11,None,0,6),
    ('Heading 1',16,BLUE,18,10),('Heading 2',13,BLUE,14,7),('Heading 3',12,DARK,10,5)]:
    if name not in styles: continue
    st=styles[name]; st.font.name='Calibri'; st._element.get_or_add_rPr().rFonts.set(qn('w:ascii'),'Calibri'); st._element.get_or_add_rPr().rFonts.set(qn('w:hAnsi'),'Calibri')
    st.font.size=Pt(size); st.font.bold=name.startswith('Heading')
    if color: st.font.color.rgb=RGBColor.from_string(color)
    st.paragraph_format.space_before=Pt(before); st.paragraph_format.space_after=Pt(after); st.paragraph_format.line_spacing=1.25

# Opening block
if doc.paragraphs:
    p=doc.paragraphs[0]; p.alignment=WD_ALIGN_PARAGRAPH.LEFT; p.paragraph_format.space_after=Pt(8)
    for run in p.runs: set_font(run,size=23,color=DARK,bold=True)
    pPr=p._p.get_or_add_pPr(); pbdr=OxmlElement('w:pBdr'); bottom=OxmlElement('w:bottom'); bottom.set(qn('w:val'),'single'); bottom.set(qn('w:sz'),'16'); bottom.set(qn('w:space'),'6'); bottom.set(qn('w:color'),BLUE); pbdr.append(bottom); pPr.append(pbdr)
for p in doc.paragraphs[1:5]:
    p.paragraph_format.space_after=Pt(2)
    for run in p.runs: set_font(run,size=9.5,color=MUTED)

# Paragraph and heading polish
for p in doc.paragraphs:
    if p.style and p.style.name.startswith('Heading'):
        set_repeat_heading(p)
    elif p.style and ('Bullet' in p.style.name or 'Number' in p.style.name):
        p.paragraph_format.space_after=Pt(4); p.paragraph_format.line_spacing=1.25
    # keep figure captions with image
    if len(p._p.xpath('.//w:drawing')):
        p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.space_before=Pt(6); p.paragraph_format.space_after=Pt(4)

# Resize images to usable width and add alt from filename if absent
for shape in doc.inline_shapes:
    maxw=Inches(6.5)
    if shape.width>maxw:
        ratio=maxw/shape.width; shape.width=maxw; shape.height=int(shape.height*ratio)
    docPr=shape._inline.docPr
    if not docPr.get('descr'): docPr.set('descr','Captura de validación del renderer de personajes en la sala de referencia')

# Tables: explicit width, repeating headers, padding and readable wrapping
TOTAL=9360
for ti,table in enumerate(doc.tables):
    n=len(table.columns)
    headers=[c.text.strip() for c in table.rows[0].cells]
    scores=[]
    for j in range(n):
        vals=[len(row.cells[j].text.strip()) for row in table.rows[:min(len(table.rows),30)]]
        scores.append(max(8, min(40, sum(vals)/max(1,len(vals)))))
    mins=[900 if n<=4 else 650 for _ in range(n)]
    remaining=TOTAL-sum(mins); s=sum(scores)
    widths=[mins[j]+int(remaining*scores[j]/s) for j in range(n)]
    widths[-1]+=TOTAL-sum(widths)
    table.autofit=False
    tblPr=table._tbl.tblPr
    tblW=tblPr.find(qn('w:tblW'))
    if tblW is None: tblW=OxmlElement('w:tblW'); tblPr.append(tblW)
    tblW.set(qn('w:w'),str(TOTAL)); tblW.set(qn('w:type'),'dxa')
    tblInd=tblPr.find(qn('w:tblInd'))
    if tblInd is None: tblInd=OxmlElement('w:tblInd'); tblPr.append(tblInd)
    tblInd.set(qn('w:w'),'120'); tblInd.set(qn('w:type'),'dxa')
    # borders
    borders=tblPr.find(qn('w:tblBorders'))
    if borders is None: borders=OxmlElement('w:tblBorders'); tblPr.append(borders)
    for edge in ['top','left','bottom','right','insideH','insideV']:
        el=OxmlElement('w:'+edge); el.set(qn('w:val'),'single'); el.set(qn('w:sz'),'4'); el.set(qn('w:color'),BORDER); borders.append(el)
    grid=table._tbl.tblGrid
    for child in list(grid): grid.remove(child)
    for w in widths:
        gc=OxmlElement('w:gridCol'); gc.set(qn('w:w'),str(w)); grid.append(gc)
    set_repeat_table_header(table.rows[0])
    for ri,row in enumerate(table.rows):
        for j,cell in enumerate(row.cells):
            cell.width=Inches(widths[j]/1440); cell.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER; set_cell_margins(cell)
            tcPr=cell._tc.get_or_add_tcPr(); tcW=tcPr.find(qn('w:tcW'))
            if tcW is None: tcW=OxmlElement('w:tcW'); tcPr.append(tcW)
            tcW.set(qn('w:w'),str(widths[j])); tcW.set(qn('w:type'),'dxa')
            if ri==0: set_cell_shading(cell,PALE)
            for p in cell.paragraphs:
                p.paragraph_format.space_before=Pt(0); p.paragraph_format.space_after=Pt(2); p.paragraph_format.line_spacing=1.05
                for run in p.runs: set_font(run,size=8.2,bold=(ri==0))

# Core properties: generic, no personal data
props=doc.core_properties; props.title='Personajes por capas y colores personalizados'; props.subject='Especificación funcional y técnica'; props.author='BoomBang HTML5'; props.last_modified_by='BoomBang HTML5'
doc.save(out)
