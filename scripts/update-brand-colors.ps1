$root = Join-Path $PSScriptRoot "..\src"
$files = Get-ChildItem -Path $root -Recurse -Include *.styl, *.css, *.vue

foreach ($f in $files) {
  $c = [IO.File]::ReadAllText($f.FullName)
  $orig = $c

  $c = [regex]::Replace($c, '(?i)#d209b6', '#e91e63')
  $c = [regex]::Replace($c, '(?i)background:\s*#9f00ad', 'background: #cf1658')
  $c = [regex]::Replace($c, '(?i)background #9f00ad', 'background #cf1658')
  $c = [regex]::Replace($c, '(?i)background-color:\s*#9f00ad', 'background-color: #cf1658')
  $c = [regex]::Replace($c, '(?i)background-color #9f00ad', 'background-color #cf1658')
  $c = [regex]::Replace($c, '(?i)color:\s*#9f00ad', 'color: #e91e63')
  $c = [regex]::Replace($c, '(?i)color #9f00ad', 'color #e91e63')
  $c = [regex]::Replace($c, '(?i)#9f00ad', '#e91e63')
  $c = [regex]::Replace($c, '(?i)#f3e5f5', '#fce4ec')

  if ($c -ne $orig) {
    [IO.File]::WriteAllText($f.FullName, $c)
    Write-Output $f.FullName
  }
}
