$file = Get-Content "matrixHtmlHelper.ts" -Raw
# Add innerHtml variable at start of function after color = utils.getColor(n)
$file = $file -replace '(let color = utils\.getColor\(n\);[\s\S]*?//   : notationStore\.getParent\(\)\.type)', '$1

    let innerHtml = "";' 

Set-Content "matrixHtmlHelper.ts" $file
Write-Host "Step 1 done"
