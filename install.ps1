# Install the skills in this repository for Claude Code on Windows, so they are
# available from any directory. The bash install.sh covers macOS, Linux and WSL.
#
# Each directory under skills\ that holds a SKILL.md is installed into the
# personal skills directory, with its own virtualenv when it has a
# requirements.txt. Symbolic links need Developer Mode or an elevated shell on
# Windows, so this falls back to copying and warns that a copy goes stale.
#
#   .\install.ps1              install or update every skill
#   .\install.ps1 -Uninstall   remove what was installed
#
# CLAUDE_CONFIG_DIR overrides where Claude Code keeps its configuration.
[CmdletBinding()]
param([switch]$Uninstall)

$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$config = if ($env:CLAUDE_CONFIG_DIR) { $env:CLAUDE_CONFIG_DIR }
          else { Join-Path $HOME ".claude" }
$skillsDir = Join-Path $config "skills"

$skills = Get-ChildItem -Path (Join-Path $here "skills") -Directory |
          Where-Object { Test-Path (Join-Path $_.FullName "SKILL.md") }
if (-not $skills) { throw "No skills found under $here\skills" }

foreach ($skill in $skills) {
    $link = Join-Path $skillsDir $skill.Name

    if ($Uninstall) {
        if (Test-Path $link) {
            Remove-Item -Recurse -Force $link
            Write-Host "Removed $link"
        } else {
            Write-Host "Nothing installed at $link"
        }
        continue
    }

    $requirements = Join-Path $skill.FullName "requirements.txt"
    if (Test-Path $requirements) {
        Write-Host "==> $($skill.Name): building the virtualenv"
        $venv = Join-Path $skill.FullName ".venv"
        if (Get-Command uv -ErrorAction SilentlyContinue) {
            uv venv $venv --python 3.12
            uv pip install --quiet --python (Join-Path $venv "Scripts\python.exe") `
                --upgrade -r $requirements
        } else {
            python -m venv $venv
            & (Join-Path $venv "Scripts\python.exe") -m pip install --quiet --upgrade pip
            & (Join-Path $venv "Scripts\python.exe") -m pip install --quiet --upgrade -r $requirements
        }
    }

    New-Item -ItemType Directory -Force -Path $skillsDir | Out-Null
    if (Test-Path $link) { Remove-Item -Recurse -Force $link }
    try {
        New-Item -ItemType SymbolicLink -Path $link -Target $skill.FullName | Out-Null
        Write-Host "==> $($skill.Name): linked at $link"
    } catch {
        Copy-Item -Recurse -Force $skill.FullName $link
        Write-Warning ("$($skill.Name): copied to $link because this shell cannot " +
                       "create symbolic links. Re-run after every change, or turn on " +
                       "Developer Mode to get a link that stays current.")
    }
}

if (-not $Uninstall) {
    Write-Host ""
    Write-Host "Start a Claude Code session in any directory and name the skill you want."
}
