param(
  [string]$WorkbookPath = "",
  [string]$OutputPath = "src/data/ls-hz-inner-data.js"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-XmlDocument {
  param(
    [System.IO.Compression.ZipArchive]$Zip,
    [string]$EntryPath
  )

  $entry = $Zip.Entries | Where-Object { $_.FullName -eq $EntryPath }
  if (-not $entry) {
    throw "Missing ZIP entry: $EntryPath"
  }

  $stream = $entry.Open()
  $reader = New-Object System.IO.StreamReader($stream)
  try {
    [xml]$xml = $reader.ReadToEnd()
  }
  finally {
    $reader.Close()
    $stream.Close()
  }

  return $xml
}

function Get-SharedStrings {
  param(
    [System.IO.Compression.ZipArchive]$Zip
  )

  $sharedStrings = New-Object System.Collections.Generic.List[string]
  $entry = $Zip.Entries | Where-Object { $_.FullName -eq "xl/sharedStrings.xml" }
  if (-not $entry) {
    return $sharedStrings
  }

  $xml = Get-XmlDocument -Zip $Zip -EntryPath "xl/sharedStrings.xml"
  $ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
  $ns.AddNamespace("x", "http://schemas.openxmlformats.org/spreadsheetml/2006/main")

  foreach ($si in $xml.SelectNodes("//x:si", $ns)) {
    $texts = $si.SelectNodes(".//x:t", $ns) | ForEach-Object { $_.'#text' }
    $null = $sharedStrings.Add(($texts -join ""))
  }

  return $sharedStrings
}

function Get-CellText {
  param(
    [System.Xml.XmlElement]$Cell,
    [System.Collections.Generic.List[string]]$SharedStrings
  )

  $type = if ($Cell.HasAttribute("t")) { [string]$Cell.GetAttribute("t") } else { "" }
  $valueNode = $Cell.SelectSingleNode("./*[local-name()='v']")
  $inlineNode = $Cell.SelectSingleNode("./*[local-name()='is']")

  if ($type -eq "inlineStr" -and $inlineNode) {
    $texts = $inlineNode.SelectNodes(".//*[local-name()='t']") | ForEach-Object { $_.'#text' }
    return ($texts -join "")
  }

  if (-not $valueNode) {
    return ""
  }

  $value = [string]$valueNode.InnerText
  if ($type -eq "s") {
    $index = [int]$value
    if ($index -ge 0 -and $index -lt $SharedStrings.Count) {
      return [string]$SharedStrings[$index]
    }
  }

  return $value
}

function Get-ColumnName {
  param(
    [string]$CellReference
  )

  return ($CellReference -replace "\d", "")
}

function Get-SheetMap {
  param(
    [System.IO.Compression.ZipArchive]$Zip
  )

  $workbook = Get-XmlDocument -Zip $Zip -EntryPath "xl/workbook.xml"
  $rels = Get-XmlDocument -Zip $Zip -EntryPath "xl/_rels/workbook.xml.rels"

  $relMap = @{}
  foreach ($rel in $rels.Relationships.Relationship) {
    $target = [string]$rel.Target
    if ($target -notmatch "^xl/") {
      $target = "xl/$target"
    }
    $relMap[[string]$rel.Id] = $target
  }

  $sheets = @()
  foreach ($sheet in $workbook.workbook.sheets.sheet) {
    $rid = [string]$sheet.GetAttribute("id", "http://schemas.openxmlformats.org/officeDocument/2006/relationships")
    $target = $relMap[$rid]
    $sheets += [pscustomobject]@{
      Name = [string]$sheet.name
      Rid = $rid
      Path = $target
    }
  }

  return $sheets
}

function Convert-SheetToObjects {
  param(
    [System.IO.Compression.ZipArchive]$Zip,
    [string]$SheetPath,
    [System.Collections.Generic.List[string]]$SharedStrings
  )

  $xml = Get-XmlDocument -Zip $Zip -EntryPath $SheetPath
  $rows = @($xml.worksheet.sheetData.row)
  if ($rows.Count -eq 0) {
    return @{
      Headers = @()
      Rows = @()
    }
  }

  $headerMap = [ordered]@{}
  foreach ($cell in $rows[0].c) {
    $columnName = Get-ColumnName -CellReference ([string]$cell.r)
    $headerText = Get-CellText -Cell $cell -SharedStrings $SharedStrings
    if (-not $headerText) {
      $headerText = "COL_$columnName"
    }
    $headerMap[$columnName] = $headerText
  }

  $headers = @($headerMap.Values)
  $records = New-Object System.Collections.Generic.List[object]

  foreach ($row in ($rows | Select-Object -Skip 1)) {
    $record = [ordered]@{}
    foreach ($header in $headers) {
      $record[$header] = ""
    }

    foreach ($cell in $row.c) {
      $columnName = Get-ColumnName -CellReference ([string]$cell.r)
      if (-not $headerMap.Contains($columnName)) {
        continue
      }

      $headerText = [string]$headerMap[$columnName]
      $record[$headerText] = Get-CellText -Cell $cell -SharedStrings $SharedStrings
    }

    $records.Add([pscustomobject]$record) | Out-Null
  }

  return @{
    Headers = $headers
    Rows = [object[]]$records.ToArray()
  }
}

$workbookCandidate = $WorkbookPath
if (-not $workbookCandidate) {
  $matchedFile = Get-ChildItem -LiteralPath (Get-Location) -File -Filter "*.xlsx" | Select-Object -First 1
  if (-not $matchedFile) {
    throw "No .xlsx workbook found in $(Get-Location)"
  }
  $workbookCandidate = $matchedFile.FullName
}

$resolvedWorkbook = Resolve-Path -LiteralPath $workbookCandidate
$resolvedOutput = Join-Path (Get-Location) $OutputPath

$zip = [System.IO.Compression.ZipFile]::OpenRead($resolvedWorkbook)

try {
  $sharedStrings = Get-SharedStrings -Zip $zip
  $sheetMap = Get-SheetMap -Zip $zip

  $sheetsObject = [ordered]@{}
  foreach ($sheet in $sheetMap) {
    $sheetData = Convert-SheetToObjects -Zip $zip -SheetPath $sheet.Path -SharedStrings $sharedStrings
    $sheetsObject[$sheet.Name] = [ordered]@{
      headers = $sheetData.Headers
      rows = $sheetData.Rows
      rowCount = $sheetData.Rows.Count
    }
  }

  $payload = [ordered]@{
    meta = [ordered]@{
      sourceFile = [System.IO.Path]::GetFileName($resolvedWorkbook)
      generatedAt = (Get-Date).ToString("s")
      sheetNames = @($sheetsObject.Keys)
    }
    sheets = $sheetsObject
  }

  $json = $payload | ConvertTo-Json -Depth 12 -Compress
  $module = @"
export const LS_HZ_INNER_WORKBOOK = $json;

export const LS_HZ_INNER_Y25 = LS_HZ_INNER_WORKBOOK.sheets.Y25?.rows ?? [];
export const LS_HZ_INNER_Y24 = LS_HZ_INNER_WORKBOOK.sheets.Y24?.rows ?? [];
"@

  Set-Content -LiteralPath $resolvedOutput -Value $module -Encoding UTF8
}
finally {
  $zip.Dispose()
}
