const fs = require('fs');
const prompt = require('prompt-sync')();
const childProcess = require('child_process');

const name = prompt('What is your code folder/encrypted file name? - ');

if (fs.existsSync(name)) { // Check if the specified file or folder exists
    if (name.endsWith("encrypted")) { // If the name ends with "encrypted"
        const pass = prompt('What should be the password? - ');

        if (fs.existsSync('./editor/decrypt.js')) { // Check if the decrypt.js file exists
            fs.unlinkSync('./editor/decrypt.js'); // Remove the existing decrypt.js file
        }

        const decryptCode = `import * as folderEncrypt from 'folder-encrypt';
        folderEncrypt.decrypt({
            password: '${pass}',
            input: '${name}',
            output: '${name.replace(".encrypted", "")}'
        }).then(() => {
            console.log('Decrypted!');
        }).catch((err) => {
            console.log(err);
        });`;

        fs.writeFileSync('./editor/decrypt.js', decryptCode); // Write the decryption code to decrypt.js

        runScript('./editor/decrypt.js', function (err) { // Execute the decryption script
            if (err) {
                throw err;
            }
            fs.rmdirSync(`./${name}`, { recursive: true }); // Remove the decrypted folder
            fs.unlinkSync('./editor/decrypt.js'); // Remove the decrypt.js file
        });
    } else { // If the name does not end with "encrypted"
        const pass = prompt('What should be the password? - ');

        if (fs.existsSync('./editor/encrypt.js')) { // Check if the encrypt.js file exists
            fs.unlinkSync('./editor/encrypt.js'); // Remove the existing encrypt.js file
        }

        const encryptCode = `import * as folderEncrypt from 'folder-encrypt';
        folderEncrypt.encrypt({
            password: '${pass}',
            input: 'codes',
            output: 'codes.encrypted'
        }).then(() => {
            console.log('Encrypted!');
        }).catch((err) => {
            console.log(err);
        });`;

        fs.writeFileSync('./editor/encrypt.js', encryptCode); // Write the encryption code to encrypt.js

        runScript('./editor/encrypt.js', function (err) { // Execute the encryption script
            if (err) {
                throw err;
            }
            fs.rmdirSync(name, { recursive: true }); // Remove the original folder or file
            fs.unlinkSync('./editor/encrypt.js'); // Remove the encrypt.js file
        });
    }
} else {
    console.log(`${name} doesn't exist.`); // If the specified file or folder does not exist
}

function runScript(scriptPath, callback) {
    var invoked = false;
    var process = childProcess.fork(scriptPath);

    process.on('error', function (err) {
        if (invoked) return;
        invoked = true;
        callback(err);
    });

    process.on('exit', function (code) {
        if (invoked) return;
        invoked = true;
        var err = code === 0 ? null : new Error('exit code ' + code);
        callback(err);
    });
}
