"""Convert the original ABAKO worksheet to a portable UTF-8 CSV (no calculations)."""
import csv
import sys
import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET

source, target = map(Path, sys.argv[1:])
ns = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
with zipfile.ZipFile(source) as archive:
    shared = []
    if "xl/sharedStrings.xml" in archive.namelist():
        shared = ["".join(si.itertext()) for si in ET.fromstring(archive.read("xl/sharedStrings.xml")).findall("m:si", ns)]
    sheet = ET.fromstring(archive.read("xl/worksheets/sheet1.xml"))
    rows = []
    for row in sheet.findall("m:sheetData/m:row", ns):
        values = [""] * 22
        for cell in row:
            column = 0
            for letter in cell.attrib["r"]:
                if not letter.isalpha():
                    break
                column = column * 26 + ord(letter) - 64
            value = cell.findtext("m:v", default="", namespaces=ns)
            if cell.get("t") == "s":
                value = shared[int(value)]
            elif cell.get("t") == "inlineStr":
                value = "".join(cell.find("m:is", ns).itertext())
            values[column - 1] = value
        rows.append(values)
target.parent.mkdir(parents=True, exist_ok=True)
with target.open("w", encoding="utf-8-sig", newline="") as output:
    csv.writer(output, delimiter=";", quoting=csv.QUOTE_ALL).writerows(rows)
print(f"CSV exported: {len(rows)-1} detail rows, {len(rows[0])} columns, {target.stat().st_size} bytes")
