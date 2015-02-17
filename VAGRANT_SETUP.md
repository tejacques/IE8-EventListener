Requirements:
-------------

* VirtualBox
* Vagrant

Steps:
------

Run the following commands:

1. `cd vagrant`
2. `vagrant up`

Wait for vagrant to complete. This will download a Modern.IE win7 IE8 machine and start it with GUI.

In order for automated testing to work, modifications must be made to the machine.

## Run the following in Powershell in Administrator mode from the VM:

Open Powershell in Administrator mode, and run:

```Poswershell
Set-ExecutionPolicy ByPass -Force
\\VBOXSVR\vagrant\VAGRANT_VM_SETUP.ps1
```

Here is what runnign that script will do:

1. Disable Firewall:
  ```Powershell
  netsh firewall set opmode disable
  ```

2. Disable UAC (requires reboot):
  ```Powershell
  Set-ItemProperty -Path registry::HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\policies\system -Name EnableLUA -Value 0
  ```

3. Disable Windows Defender
  ```Powershell
  Set-Service WinDefend -StartupType "Disabled"
  ```

4. Make all networks "private"
  ```Powershell
  $nlm = [Activator]::CreateInstance([Type]::GetTypeFromCLSID([Guid]"{DCB00C01-570F-4A9B-8D69-199FDBA5723B}"))
  $connections = $nlm.getnetworkconnections()
  $connections |foreach {
    if ($_.getnetwork().getcategory() -eq 0)
    {
        $_.getnetwork().setcategory(1)
    }
  }
  ```

5. Enable WinRM
  ```Powershell
  Enable-PSRemoting -Force
  ```

6. Configure WinRM
  ```Powershell
  get-service winrm
  Enable-PSRemoting -force
  winrm qc -q  
  winrm set winrm/config/client '@{TrustedHosts="*"}'
  winrm set winrm/config/winrs '@{MaxMemoryPerShellMB="2048"}'
  winrm set winrm/config/winrs '@{MaxConcurrentUsers="100"}'
  winrm set winrm/config/winrs '@{AllowRemoteShellAccess="True"}'
  winrm set winrm/config '@{MaxTimeoutms="604800000"}'
  winrm set winrm/config/service '@{AllowUnencrypted="true"}'
  winrm set winrm/config/service/auth '@{Basic="true"}'
  ```

7. Set Windows Remoting service to start Automatic and not Automation (delayed)
  ```Powershell
  Set-Service WinRM -StartupType "Automatic"
  ```

8. Install VC++ 2008 SP1 Redistributable x86 Package
  ```Powershell
  (New-Object System.Net.WebClient).DownloadFile("http://download.microsoft.com/download/5/D/8/5D8C65CB-C849-4025-8E95-C3966CAFD8AE/vcredist_x86.exe", "vcredist_x86.exe")
  .\vcredist_x86.exe /qb!
  ```

9. Restart Computer
  ```Powershell
  Restart-Computer
  ```


## After setup

Package the running VM into a new updated box using the following commands from the host machine:

```shell
vagrant package vagrant-win7-ie8 vagrant-win7-ie8-updated.box
vagrant box add vagrant-win7-ie8-updated vagrant-win7-ie8-updated.box
cd ..
vagrant up
```

To Run Tests (With VM running):

```shell
grunt test
```
