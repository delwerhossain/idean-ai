# WebCloudor Chunk-by-Chunk Commit Script (PowerShell)
# Usage: .\scripts\chunk-commit.ps1

param(
    [string]$Mode = "help"
)

# Colors for output
$colors = @{
    Green = "Green"
    Blue = "Cyan" 
    Yellow = "Yellow"
    Red = "Red"
}

function Write-ColorText {
    param($Text, $Color)
    Write-Host $Text -ForegroundColor $colors[$Color]
}

Write-ColorText "🚀 WebCloudor Chunk-by-Chunk Commit Helper" "Blue"
Write-ColorText "==========================================" "Blue"

# Check if we're in a git repository
try {
    git rev-parse --git-dir | Out-Null
} catch {
    Write-ColorText "❌ Error: Not in a git repository" "Red"
    exit 1
}

# Check git configuration
Write-ColorText "📋 Current Git Configuration:" "Yellow"
$gitUser = git config user.name
$gitEmail = git config user.email
Write-Host "User: $gitUser $gitEmail"
Write-Host ""

# Show current status
Write-ColorText "📊 Current Git Status:" "Yellow"
git status --short
Write-Host ""

function Commit-Chunk {
    param($FilePath, $CommitMessage)
    
    Write-ColorText "📁 Adding: $FilePath" "Blue"
    git add $FilePath
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorText "✅ Committing with message: $CommitMessage" "Green"
        git commit -m $CommitMessage
        Write-Host ""
    } else {
        Write-ColorText "❌ Failed to add $FilePath" "Red"
    }
}

# Auto mode - commit all changes automatically
if ($Mode -eq "auto") {
    Write-ColorText "🤖 Auto Mode: Committing all changes automatically" "Yellow"
    
    # Check if there are any changes
    $changes = git diff --name-only
    $untracked = git ls-files --others --exclude-standard
    
    if (!$changes -and !$untracked) {
        Write-ColorText "✅ No changes to commit. Working tree is clean!" "Green"
        exit 0
    }
    
    # Commit all changes with a comprehensive message
    git add .
    $commitMessage = @"
Transform application to iDEAN AI with enhanced UI and functionality

- Updated landing page with iDEAN AI branding and messaging
- Implemented tool-based navigation with 4 core modules
- Added comprehensive tools hub with 18+ business frameworks
- Created Facebook Ad Builder with Bengali/English support
- Enhanced AI service with multi-provider architecture
- Added dynamic form system with validation and language toggle
- Integrated business context and structured content generation
- Improved user experience with responsive design

🤖 Generated with Claude Code (https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
"@
    
    git commit -m $commitMessage
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorText "🎉 Successfully committed all changes!" "Green"
        Write-ColorText "📋 Recent commits:" "Yellow"
        git log --oneline -3
    } else {
        Write-ColorText "❌ Failed to commit changes" "Red"
    }
}

# Interactive mode
if ($Mode -eq "interactive") {
    Write-ColorText "🔄 Interactive Mode: Commit files one by one" "Yellow"
    
    # Get list of changed files
    $unstagedFiles = git diff --name-only
    $untrackedFiles = git ls-files --others --exclude-standard
    $allFiles = $unstagedFiles + $untrackedFiles | Where-Object { $_ -ne "" }
    
    if ($allFiles.Count -eq 0) {
        Write-ColorText "✅ No files to commit. Working tree is clean!" "Green"
        exit 0
    }
    
    Write-ColorText "📁 Files available for commit:" "Yellow"
    for ($i = 0; $i -lt $allFiles.Count; $i++) {
        Write-Host "$($i+1). $($allFiles[$i])"
    }
    Write-Host ""
    
    foreach ($file in $allFiles) {
        Write-ColorText "📝 Process file: $file" "Blue"
        $choice = Read-Host "Commit this file? (y/n/s=skip)"
        
        if ($choice -eq "y" -or $choice -eq "yes") {
            $customMessage = Read-Host "Enter commit message for $file"
            if ($customMessage) {
                Commit-Chunk $file $customMessage
            }
        } elseif ($choice -eq "s" -or $choice -eq "skip") {
            Write-ColorText "⏭️  Skipping $file" "Yellow"
        } else {
            Write-ColorText "⏭️  Skipping $file" "Yellow"
        }
        Write-Host ""
    }
    
    Write-ColorText "🎉 Interactive commit process completed!" "Green"
    git log --oneline -5
}

# Help mode
if ($Mode -eq "help" -or $Mode -eq "") {
    Write-ColorText "📖 Usage:" "Yellow"
    Write-Host "  .\scripts\chunk-commit.ps1 interactive  # Interactive file-by-file commits"
    Write-Host "  .\scripts\chunk-commit.ps1 auto        # Auto-commit with smart messages"
    Write-Host ""
    Write-ColorText "💡 Tip:" "Yellow"
    Write-Host " Use auto mode for quick commits or interactive mode for control"
}

Write-ColorText "✨ Happy coding with WebCloudor! ✨" "Blue"