# sync-vercel-domain.ps1
param (
  [string]$Token
)

$authFile = "$env:APPDATA\com.vercel.cli\Data\auth.json"

if (-not $Token) {
  if (Test-Path $authFile) {
    $authData = Get-Content $authFile | ConvertFrom-Json
    $Token = $authData.token
  }
}

if (-not $Token) {
  Write-Host "No Vercel Token found. Please log in or provide token."
  exit 1
}

$headers = @{
  "Authorization" = "Bearer $Token"
  "Content-Type" = "application/json"
}

Write-Host "Fetching Vercel projects..."
try {
  $projectsRes = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects" -Method Get -Headers $headers
  $projects = $projectsRes.projects

  $targetProject = $projects | Where-Object { $_.name -eq "ideapadeffectspro1" }
  $cleanProject = $projects | Where-Object { $_.name -eq "ideapadeffectspro" }

  if ($targetProject) {
    Write-Host "Found project: $($targetProject.name) ($($targetProject.id))"

    # If an empty cleanProject exists, delete it first to free the name
    if ($cleanProject -and $cleanProject.id -ne $targetProject.id) {
      Write-Host "Removing placeholder project $($cleanProject.id)..."
      Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$($cleanProject.id)" -Method Delete -Headers $headers | Out-Null
    }

    # Rename ideapadeffectspro1 -> ideapadeffectspro
    Write-Host "Renaming project to ideapadeffectspro..."
    $renameBody = @{ name = "ideapadeffectspro" } | ConvertTo-Json
    Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$($targetProject.id)" -Method Patch -Headers $headers -Body $renameBody | Out-Null

    # Add domain ideapadeffectspro.vercel.app
    Write-Host "Adding domain ideapadeffectspro.vercel.app..."
    $domainBody = @{ name = "ideapadeffectspro.vercel.app" } | ConvertTo-Json
    try {
      Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$($targetProject.id)/domains" -Method Post -Headers $headers -Body $domainBody | Out-Null
    } catch {
      Write-Host "Domain add note: $($_.Exception.Message)"
    }

    # Remove domain ideapadeffectspro1.vercel.app
    Write-Host "Removing domain ideapadeffectspro1.vercel.app..."
    try {
      Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$($targetProject.id)/domains/ideapadeffectspro1.vercel.app" -Method Delete -Headers $headers | Out-Null
    } catch {
      Write-Host "Domain remove note: $($_.Exception.Message)"
    }

    Write-Host "SUCCESS! Domain is now set to https://ideapadeffectspro.vercel.app"
  } elseif ($cleanProject) {
    Write-Host "Project is already named ideapadeffectspro!"
    # Ensure domain is added
    $domainBody = @{ name = "ideapadeffectspro.vercel.app" } | ConvertTo-Json
    try {
      Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$($cleanProject.id)/domains" -Method Post -Headers $headers -Body $domainBody | Out-Null
    } catch {}
    # Remove ideapadeffectspro1 domain if attached
    try {
      Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$($cleanProject.id)/domains/ideapadeffectspro1.vercel.app" -Method Delete -Headers $headers | Out-Null
    } catch {}
    Write-Host "SUCCESS! Active at https://ideapadeffectspro.vercel.app"
  } else {
    Write-Host "Deploying new project to ideapadeffectspro..."
    npx --yes vercel --token $Token --prod --yes
  }
} catch {
  Write-Host "Error: $($_.Exception.Message)"
  if ($_.ErrorDetails) { Write-Host $_.ErrorDetails.Message }
}
