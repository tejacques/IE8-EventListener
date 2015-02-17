#1. Disable Firewall
netsh firewall set opmode disable

#2. Disable UAC by modifying registry
Set-ItemProperty -Path registry::HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\policies\system -Name EnableLUA -Value 0

#3. Disable Windows Defender
Set-Service WinDefend -StartupType "Disabled"

#4. Make all networks "private"
$nlm = [Activator]::CreateInstance([Type]::GetTypeFromCLSID([Guid]"{DCB00C01-570F-4A9B-8D69-199FDBA5723B}"))
$connections = $nlm.getnetworkconnections()
$connections |foreach {
  if ($_.getnetwork().getcategory() -eq 0)
  {
      $_.getnetwork().setcategory(1)
  }
}

#5. Enable WinRM
Enable-PSRemoting -Force

#6. Configure WinRM
get-service winrm
Enable-PSRemoting -Force
winrm qc -q  
winrm set winrm/config/client '@{TrustedHosts="*"}'
winrm set winrm/config/winrs '@{MaxMemoryPerShellMB="2048"}'
winrm set winrm/config/winrs '@{MaxConcurrentUsers="100"}'
winrm set winrm/config/winrs '@{AllowRemoteShellAccess="True"}'
winrm set winrm/config '@{MaxTimeoutms="604800000"}'
winrm set winrm/config/service '@{AllowUnencrypted="true"}'
winrm set winrm/config/service/auth '@{Basic="true"}'

#7. Set Windows Remoting service to start Automatic and not Automation (delayed)
Set-Service WinRM -StartupType "Automatic"

#8. Install VC++ 2008 SP1 Redistributable x86 Package
(New-Object System.Net.WebClient).DownloadFile("http://download.microsoft.com/download/5/D/8/5D8C65CB-C849-4025-8E95-C3966CAFD8AE/vcredist_x86.exe", "vcredist_x86.exe")
.\vcredist_x86.exe /qb!

#8. Restart Computer
Restart-Computer
