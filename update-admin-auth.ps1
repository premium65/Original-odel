# Script to replace useAuth with useAdminAuth in all admin files
$adminFiles = Get-ChildItem -Path "client/src/pages/admin" -Recurse -Filter "*.tsx"

foreach ($file in $adminFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Replace import
    $content = $content -replace 'import.*useAuth.*from.*"@/hooks/use-auth"', 'import { useAdminAuth } from "@/hooks/use-admin-auth"'
    
    # Replace usage
    $content = $content -replace 'const\s*\{[^}]*\}\s*=\s*useAuth\(\)', 'const { user, logout } = useAdminAuth()'
    
    Set-Content $file.FullName $content
    Write-Host "Updated: $($file.FullName)"
}

Write-Host "All admin files updated!"
