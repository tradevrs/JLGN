# Makes VRS-Indicator-Pro.pine (compact, no comments) from VRS-Indicator-Pro.annotated.pine. Run: .\make_compact.ps1 VRS-Indicator-Pro.annotated.pine VRS-Indicator-Pro.pine ; then node build-lite.cjs
param([string]$src, [string]$dst)
$t = [IO.File]::ReadAllText($src, [Text.Encoding]::UTF8) -replace "`r`n", "`n"
$out = New-Object System.Collections.Generic.List[string]
$out.Add('//@version=6')
$out.Add('// VRS Indicator Pro · VRS Strategy (VA1 / VA2) by Value Research Systems (paid, invite-only). VRS-Indicator-Lite.pine is generated from this file: node build-lite.cjs')
foreach ($ln in ($t -split "`n")) {
    if ($ln -match '^//@version') { continue }
    # cut a // comment that is outside any string literal
    $q = [char]0; $cut = -1
    for ($i = 0; $i -lt $ln.Length; $i++) {
        $c = $ln[$i]
        if ($q -ne [char]0) {
            if ($c -eq '\') { $i++; continue }
            if ($c -eq $q) { $q = [char]0 }
        } elseif ($c -eq '"' -or $c -eq "'") { $q = $c }
        elseif ($c -eq '/' -and $i + 1 -lt $ln.Length -and $ln[$i + 1] -eq '/') { $cut = $i; break }
    }
    if ($cut -ge 0) { $ln = $ln.Substring(0, $cut) }
    $ln = $ln.TrimEnd()
    if ($ln.Trim() -eq '') { continue }
    # indentation: every 4 spaces -> one tab
    $m = [regex]::Match($ln, '^( *)')
    $n = $m.Groups[1].Length
    $ln = ("`t" * [int]($n / 4)) + $ln.Substring($n)
    $out.Add($ln)
}
$res = ($out -join "`n") + "`n"
[IO.File]::WriteAllText($dst, $res, (New-Object System.Text.UTF8Encoding($false)))
"chars: $($res.Length)  lines: $($out.Count)"
