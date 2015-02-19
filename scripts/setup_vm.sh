vbm () {
    local timeout=""
    local timeout_param=""
    if [ "$1" == "--timeout" ]
    then
        timeout_param=$1
        shift
        timeout=$1
        shift
    fi
    local box=$1
    shift
    if [ "$1" == "--timeout" ]
    then
        timeout_param=$1
        shift
        timeout=$1
        shift
    fi
    local image=$1
    shift
    if [ "$1" == "--timeout" ]
    then
        timeout_param=$1
        shift
        timeout=$1
        shift
    fi
    local args=$@
#    echo $args
    
    VBoxManage --nologo guestcontrol $box execute --username IEUser --password 'Passw0rd!' --wait-stdout --wait-stderr --wait-exit $timeout_param $timeout --verbose --image "$image" -- "$args"
}

wait_for_guestcontrol() {
    while true ; do
        VBoxManage showvminfo "vagrant_win7_ie8" | grep 'Additions run level:' | grep -q "3" && return 0 || true
        echo "Waiting for vagrant_win7_ie8 to be available for guestcontrol..."
        sleep 10
    done
}


wait_for_guestcontrol
sleep 10
node keycode_creator.js | bash
#PS1SCRIPT=$(cat VAGRANT_VM_SETUP.ps1 | sed 's/#.*//g' | tr '\n' ' ')
#vbm vagrant_win7_ie8 --timeout 5000 'C:\Windows\system32\WindowsPowerShell\v1.0\PowerShell.exe' "pwd; pwd"
#vbm vagrant_win7_ie8 --timeout 5000 'C:\Windows\system32\WindowsPowerShell\v1.0\PowerShell.exe' "pwd"

#vbm vagrant_win7_ie8 --timeout 5000 'C:\Windows\system32\WindowsPowerShell\v1.0\PowerShell.exe' "Set-ExecutionPolicy ByPass -Force -Scope CurrentUser"
#vbm vagrant_win7_ie8 --timeout 5000 'C:\Windows\system32\WindowsPowerShell\v1.0\PowerShell.exe' 'netsh firewall set opmode disable'
#sleep 10
#vbm vagrant_win7_ie8 --timeout 5000 'C:\Windows\system32\WindowsPowerShell\v1.0\PowerShell.exe' '$nlm = [Activator]::CreateInstance([Type]::GetTypeFromCLSID([Guid]"{DCB00C01-570F-4A9B-8D69-199FDBA5723B}")); $connections = $nlm.getnetworkconnections(); $connections |foreach { if ($_.getnetwork().getcategory() -eq 0) { $_.getnetwork().setcategory(1) } }'
#sleep 5
#vbm vagrant_win7_ie8 --timeout 10000 'C:\Windows\explorer.exe' '\\VBOXSVR\vagrant'
#sleep 30;
#vbm vagrant_win7_ie8 --timeout 60000 'C:\Windows\system32\WindowsPowerShell\v1.0\PowerShell.exe' '\\VBOXSVR\vagrant\VAGRANT_VM_SETUP.ps1'

#vbm vagrant_win7_ie8 --timeout 10000 'C:\Windows\explorer.exe' '\\VBOXSVR\vagrant'
# Open Explorer to make the network work
#sleep 15
# 15 minute timeout
#vbm vagrant_win7_ie8 --timeout 100000 '\\VBOXSVR\vagrant\scripts\vm_setup.bat'
#vbm vagrant_win7_ie8 --timeout 900000 '\\VBOXSVR\vagrant\scripts\vm_setup.bat'
#vbm vagrant_win7_ie8 'C:\Windows\system32\WindowsPowerShell\v1.0\PowerShell.exe' 'ls \\VBOXSVR\vagrant\scripts\vm_setup.bat'
