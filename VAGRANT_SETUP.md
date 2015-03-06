Requirements:
-------------

* VirtualBox 4.3.x
* Vagrant 1.7.2

Steps:
------

Run the following commands:

```shell
vagrant up
```

When the GUI comes up (this step unforunately cannot be automated, as acquiring an elevated prompt in windows requires GUI interaction the first time):

* Hit Start
* Type PowerShell into the search bar
* Right Click > Run as administrator
* Enter:
```PowerShell
  Set-ExecutionPolicy ByPass -Force
  \\VBOXSVR\vagrant\VAGRANT_VM_SETUP.ps1
  ```

VM should now complete setup with Vagrant

Run Tests:
----------

Tests can be run on IE8 Native with the following command:

```shell
grunt test
```
