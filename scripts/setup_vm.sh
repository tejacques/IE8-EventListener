vbm () {
    local timeout=1000
    if [ "$1" == "--timeout" ]
    then
        shift
        timeout=$1
        shift
    fi
    local box=$1
    shift
    if [ "$1" == "--timeout" ]
    then
        shift
        timeout=$1
        shift
    fi
    local image=$1
    shift
    if [ "$1" == "--timeout" ]
    then
        shift
        timeout=$1
        shift
    fi
    local args=$@
    
    VBoxManage --nologo guestcontrol $box execute --username IEUser --password 'Passw0rd!' --wait-stdout --wait-stderr --wait-exit --timeout $timeout --verbose --image "$image" -- "$args"
}


#vbm vagrant_win7_ie8 --timeout 10000 'C:\Windows\explorer.exe' '\\VBOXSVR\vagrant'
# Open Explorer to make the network work
#sleep 15
# 15 minute timeout
vbm vagrant_win7_ie8 --timeout 100000 '\\VBOXSVR\vagrant\scripts\vm_setup.bat'
#vbm vagrant_win7_ie8 --timeout 900000 '\\VBOXSVR\vagrant\scripts\vm_setup.bat'
#vbm vagrant_win7_ie8 'C:\Windows\system32\WindowsPowerShell\v1.0\PowerShell.exe' 'ls \\VBOXSVR\vagrant\scripts\vm_setup.bat'
