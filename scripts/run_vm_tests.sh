VBoxManage guestcontrol vagrant_win7_ie8 execute --username IEUser --password 'Passw0rd!' --wait-stdout --wait-stderr --wait-exit --timeout 10000 --image '\\VBOXSVR\vagrant\bin\TrifleJS.exe' -- '\\VBOXSVR\vagrant\tests\trifle\ie8vm.js' | tr -d "\\r" | sed "/^$/d"
