Add-Type -AssemblyName System.Windows.Forms
while ($true) {
    [System.Windows.Forms.SendKeys]::SendWait("{CAPSLOCK}")
    Start-Sleep -Milliseconds 50
    [System.Windows.Forms.SendKeys]::SendWait("{CAPSLOCK}")
    Start-Sleep -Seconds 300
}