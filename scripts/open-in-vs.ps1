# open-in-vs.ps1
# Opens a file in Visual Studio 2022 at a specific line using DTE COM interface

param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath,

    [Parameter(Mandatory=$true)]
    [int]$LineNumber,

    [Parameter(Mandatory=$false)]
    [int]$ColumnNumber = 1,

    [Parameter(Mandatory=$false)]
    [string]$DTEVersion = "VisualStudio.DTE.17.0"
)

$ErrorActionPreference = "Stop"

function Get-RunningVSInstance {
    param([string]$ProgId)

    try {
        # Try to get running instance
        $dte = [System.Runtime.InteropServices.Marshal]::GetActiveObject($ProgId)
        return $dte
    }
    catch {
        return $null
    }
}

function Open-FileInVS {
    param(
        [object]$DTE,
        [string]$FilePath,
        [int]$Line,
        [int]$Column
    )

    # Open the file
    $DTE.ItemOperations.OpenFile($FilePath)

    # Get the active document's text selection
    $selection = $DTE.ActiveDocument.Selection

    # Move to the specified line and column
    $selection.MoveToLineAndOffset($Line, $Column)

    # Center the view on the current line
    $DTE.ActiveDocument.Activate()

    # Bring VS to foreground
    $DTE.MainWindow.Activate()
}

# Main execution
try {
    Write-Host "Attempting to connect to Visual Studio ($DTEVersion)..."

    $dte = Get-RunningVSInstance -ProgId $DTEVersion

    if ($null -eq $dte) {
        # Try without version number (gets any running instance)
        $dte = Get-RunningVSInstance -ProgId "VisualStudio.DTE"
    }

    if ($null -eq $dte) {
        Write-Error "No running Visual Studio instance found. Please open Visual Studio first."
        exit 1
    }

    Write-Host "Connected to Visual Studio"
    Write-Host "Opening file: $FilePath at line $LineNumber"

    Open-FileInVS -DTE $dte -FilePath $FilePath -Line $LineNumber -Column $ColumnNumber

    Write-Host "Success!"
    exit 0
}
catch {
    Write-Error "Error: $_"
    exit 1
}
