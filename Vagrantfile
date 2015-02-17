# -*- mode: ruby -*-
# vi: set ft=ruby :
 
# Follow directions at https://gist.github.com/uchagani/48d25871e7f306f1f8af
# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"
 
Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
 
  # This is kinda ghetto, but the simplest way to print a message to the user
  puts "\nNOTE: After the box boots, your app will be available at e.g. http://192.168.50.1:9000"
  puts "      If Vagrant won't detect the machine state, just Ctrl + C after the GUI is up\n\n"

  config.vm.define "win7" do |win7|
    # http://blog.syntaxc4.net/post/2014/09/03/windows-boxes-for-vagrant-courtesy-of-modern-ie.aspx
    win7.vm.box = "vagrant-win7-ie8-updated"
    # win7.vm.box_url = "http://aka.ms/vagrant-win7-ie8-updated"
    win7.vm.guest = :windows

    win7.vm.network :forwarded_port, guest: 3389, host: 3391
    win7.vm.network :forwarded_port, guest: 5985, host: 5987, id: "winrm", auto_correct: true

    win7.windows.set_work_network = true
    # Makes the host machine available as "192.168.50.1" on the guest
    win7.vm.network "private_network", ip: "192.168.50.2"
 
    # http://stackoverflow.com/questions/23574387/why-is-vagrant-trying-to-ssh-to-windows-guest
    # https://www.vagrantup.com/blog/feature-preview-vagrant-1-6-windows.html
    win7.vm.communicator = "winrm"

    win7.winrm.username = "IEUser"
    win7.winrm.password = "Passw0rd!"
 
    # We don't want the default headless mode
    win7.vm.provider "virtualbox" do |vb|
      vb.name = "vagrant_win7_ie8_updated"
      vb.gui = true
    end
  end
end
