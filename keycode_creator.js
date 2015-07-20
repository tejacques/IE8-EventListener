Array.prototype.extend = function(array) {
    return this.push.apply(this, array);
};

String.prototype.isUpperCase = function() {
    for(var i = 0; i < this.length; i++) {
        var ch = this.charAt(i);
        var isUpper = ch === ch.toUpperCase();
        var isLower = ch === ch.toLowerCase();
        if (isLower || !isUpper) {
            return false;
        }
    }

    return true;
};

function sleep(secs) {
    var ms = secs|0 * 1000;
    var start = Date.now();
    while (Date.now() - start < ms);
}

// PC XT scancodes
var scancodes = {
    'a':  0x1e,
    'b':  0x30,
    'c':  0x2e,
    'd':  0x20,
    'e':  0x12,
    'f':  0x21,
    'g':  0x22,
    'h':  0x23,
    'i':  0x17,
    'j':  0x24,
    'k':  0x25,
    'l':  0x26,
    'm':  0x32,
    'n':  0x31,
    'o':  0x18,
    'p':  0x19,
    'q':  0x10,
    'r':  0x13,
    's':  0x1f,
    't':  0x14,
    'u':  0x16,
    'v':  0x2f,
    'w':  0x11,
    'x':  0x2d,
    'y':  0x15,
    'z':  0x2c,
    '0':  0x0b,
    '1':  0x02,
    '2':  0x03,
    '3':  0x04,
    '4':  0x05,
    '5':  0x06,
    '6':  0x07,
    '7':  0x08,
    '8':  0x09,
    '9':  0x0a,
    ' ':  0x39,
    '-':  0xc,
    '=':  0xd,
    '[':  0x1a,
    ']':  0x1b,
    ';':  0x27,
    '\'': 0x28,
    '\\': 0x2b,
    ',':  0x33,
    '.':  0x34,
    '/':  0x35,
    '\t': 0xf,
    '\n': 0x1c,
    '`':  0x29
};

var extScancodes = {
    'ESC' :    [0x01],
    'BKSP':    [0xe],
    'SPACE':   [0x39],
    'TAB':     [0x0f],
    'CAPS':    [0x3a],
    'ENTER':   [0x1c],
    'LSHIFT':  [0x2a],
    'RSHIFT':  [0x36],
    'INS':     [0xe0, 0x52],
    'DEL':     [0xe0, 0x53],
    'END':     [0xe0, 0x4f],
    'HOME':    [0xe0, 0x47],
    'PGUP':    [0xe0, 0x49],
    'PGDOWN':  [0xe0, 0x51],
    'LGUI':    [0xe0, 0x5b], // GUI, aka Win, aka Apple key
    'RGUI':    [0xe0, 0x5c],
    'LCTR':    [0x1d],
    'RCTR':    [0xe0, 0x1d],
    'LALT':    [0x38],
    'RALT':    [0xe0, 0x38],
    'APPS':    [0xe0, 0x5d],
    'F1':      [0x3b],
    'F2':      [0x3c],
    'F3':      [0x3d],
    'F4':      [0x3e],
    'F5':      [0x3f],
    'F6':      [0x40],
    'F7':      [0x41],
    'F8':      [0x42],
    'F9':      [0x43],
    'F10':     [0x44],
    'F11':     [0x57],
    'F12':     [0x58],
    'UP':      [0xe0, 0x48],
    'LEFT':    [0xe0, 0x4b],
    'DOWN':    [0xe0, 0x50],
    'RIGHT':   [0xe0, 0x4d],
};

shiftKeys = {
    '!' : '1',
    '@' : '2',
    '//' : '3',
    '$' : '4',
    '%' : '5',
    '^' : '6',
    '&' : '7',
    '*' : '8',
    '(' : '9',
    ')' : '0',
    '_' : '-',
    '+' : '=',
};

function keyDown(ch) {
    var code = ch in scancodes ? scancodes[ch] : 0x0;
    if (code !== 0) {
        return [code];
    }
    var extCode = ch in extScancodes ? extScancodes[ch] : [];
    if (extCode.length === 0) {
        console.log ("bad ext", ch);
    }
    return extCode;
}

function keyUp(ch) {
    codes = keyDown(ch).slice(); // make a copy
    if (codes.length > 0) {
        codes[codes.length-1] += 0x80;
    }
    return codes;
}

function keyPress(ch) {
    return [keyDown(ch), keyUp(ch)];
}

function printcmds(codelist) {
    codelist.forEach(function(codes) {
        printcmd(codes);
    });
}

function printcmd(codes) {
    var chunks = [];
    var i;
    for(i=0; i < codes.length; i+=10) {
        chunks.push(codes.slice(i,i+10));
    }
    for (i=0; i < chunks.length; i++) {
        codes = chunks[i];
        var formatted = codes.map(function(x) {
            return ("0" + x.toString(16)).slice(-2);
        });
        console.log("VBoxManage controlvm vagrant_win7_ie8 keyboardputscancode " + formatted.join(" "));
    }
}

function type(s) {
    s.split("").forEach(function(ch) {
        var codes = [];
        if (ch in shiftKeys) {
            codes.extend(keyDown('LSHIFT'));
            codes.extend(keyDown(shiftKeys[ch]));
            codes.extend(keyUp(shiftKeys[ch]));
            codes.extend(keyUp('LSHIFT'));
        }
        else if (ch.isUpperCase()) {
            var lower = ch.toLowerCase();
            codes.extend(keyDown('LSHIFT'));
            codes.extend(keyDown(lower));
            codes.extend(keyUp(lower));
            codes.extend(keyUp('LSHIFT'));
        }
        else {
            codes.extend(keyDown(ch));
            codes.extend(keyUp(ch));
        }
        printcmd(codes);
        console.log("sleep 0.1");
    });
}

printcmds(keyPress('LGUI'));
console.log("sleep 1");
type("powershell");
printcmd(keyDown('LCTR'));
printcmd(keyDown('LSHIFT'));
printcmds(keyPress('ENTER'));
printcmd(keyUp('LSHIFT'));
printcmd(keyUp('LCTR'));
console.log("sleep 2");
printcmds(keyPress('LEFT'));
console.log("sleep 1");
printcmds(keyPress('ENTER'));
console.log("sleep 2");
type("Set-ExecutionPolicy ByPass -Force\n");
type("cmd.exe /k %windir%\\System32\\reg.exe ADD HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System /v EnableLUA /t REG_DWORD /d 0 /f\n");
type("cmd.exe /k %windir%\\System32\\reg.exe ADD HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System /v ConsentPromptBehaviorAdmin /t REG_DWORD /d 0 /f\n");
printcmds(keyPress('ENTER'));
type("powershell.exe\n");
type("explorer.exe \\\\VBOXSVR\\vagrant\n");
console.log("sleep 2");
printcmd(keyDown('LALT'));
printcmd(keyDown('TAB'));
printcmd(keyUp('TAB'));
printcmd(keyUp('LALT'));
console.log("sleep 2");
type("\\\\VBOXSVR\\vagrant\\VAGRANT_VM_SETUP.ps1\n");
